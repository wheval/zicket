//! # ZicketEvents
//!
//! Privacy-first event ticketing for Starknet.
//!
//! ## Ticket modes
//!
//! * **Public** — the ticket is bound to a wallet address, transferable, and
//!   checked in by the holder or the organizer.
//! * **Anonymous** — the ticket is bound to `poseidon(secret, nullifier)`. No
//!   address is recorded against the ticket, so a relayer may purchase on behalf
//!   of an attendee and *any* wallet holding the secret can check in. Check-in
//!   burns `poseidon(nullifier)` so a ticket cannot be used twice.
//!
//! ## Settlement
//!
//! Ticket sales are escrowed per event. After the event ends the organizer calls
//! `withdraw`, which pays `platform_fee_bps` to the fee recipient and the
//! remainder to the organizer. If the organizer cancels, attendees reclaim their
//! funds with `refund` / `refund_anonymous`.

#[starknet::contract]
pub mod ZicketEvents {
    use core::hash::HashStateTrait;
    use core::num::traits::Zero;
    use core::poseidon::PoseidonTrait;
    use starknet::storage::*;
    use starknet::{
        ContractAddress, get_block_timestamp, get_caller_address, get_contract_address,
    };
    use zicket::interfaces::{IERC20Dispatcher, IERC20DispatcherTrait, IZicketEvents};
    use zicket::types::{EventData, TicketData, TicketMode};

    /// Basis-point denominator.
    const BPS_DENOMINATOR: u256 = 10000;
    /// Hard cap on the configurable platform fee (10%).
    const MAX_FEE_BPS: u16 = 1000;

    pub mod Errors {
        pub const NOT_OWNER: felt252 = 'Zicket: not owner';
        pub const NOT_ORGANIZER: felt252 = 'Zicket: not organizer';
        pub const EVENT_NOT_FOUND: felt252 = 'Zicket: event not found';
        pub const TICKET_NOT_FOUND: felt252 = 'Zicket: ticket not found';
        pub const EVENT_CANCELLED: felt252 = 'Zicket: event cancelled';
        pub const EVENT_NOT_CANCELLED: felt252 = 'Zicket: event not cancelled';
        pub const SOLD_OUT: felt252 = 'Zicket: sold out';
        pub const SALE_CLOSED: felt252 = 'Zicket: sale closed';
        pub const ALREADY_HAS_TICKET: felt252 = 'Zicket: already has ticket';
        pub const ANON_NOT_ALLOWED: felt252 = 'Zicket: anon not allowed';
        pub const COMMITMENT_USED: felt252 = 'Zicket: commitment used';
        pub const INVALID_COMMITMENT: felt252 = 'Zicket: invalid commitment';
        pub const NULLIFIER_USED: felt252 = 'Zicket: nullifier used';
        pub const ALREADY_CHECKED_IN: felt252 = 'Zicket: already checked in';
        pub const NOT_TICKET_OWNER: felt252 = 'Zicket: not ticket owner';
        pub const NOT_PUBLIC_TICKET: felt252 = 'Zicket: not public ticket';
        pub const EVENT_NOT_ENDED: felt252 = 'Zicket: event not ended';
        pub const ALREADY_WITHDRAWN: felt252 = 'Zicket: already withdrawn';
        pub const ALREADY_REFUNDED: felt252 = 'Zicket: already refunded';
        pub const INVALID_CAPACITY: felt252 = 'Zicket: invalid capacity';
        pub const INVALID_WINDOW: felt252 = 'Zicket: invalid time window';
        pub const FEE_TOO_HIGH: felt252 = 'Zicket: fee too high';
        pub const ZERO_ADDRESS: felt252 = 'Zicket: zero address';
        pub const PAYMENT_FAILED: felt252 = 'Zicket: payment failed';
    }

    #[storage]
    pub struct Storage {
        owner: ContractAddress,
        payment_token: ContractAddress,
        fee_recipient: ContractAddress,
        platform_fee_bps: u16,
        events_count: u64,
        tickets_count: u64,
        events: Map<u64, EventData>,
        tickets: Map<u64, TicketData>,
        /// event_id -> attendee -> ticket_id (0 when absent)
        ticket_by_attendee: Map<u64, Map<ContractAddress, u64>>,
        /// event_id -> commitment -> ticket_id (0 when absent)
        ticket_by_commitment: Map<u64, Map<felt252, u64>>,
        /// event_id -> poseidon(nullifier) -> spent
        nullifier_used: Map<u64, Map<felt252, bool>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        EventCreated: EventCreated,
        EventCancelled: EventCancelled,
        TicketPurchased: TicketPurchased,
        AnonymousTicketPurchased: AnonymousTicketPurchased,
        TicketTransferred: TicketTransferred,
        CheckedIn: CheckedIn,
        Refunded: Refunded,
        Withdrawn: Withdrawn,
        PlatformFeeUpdated: PlatformFeeUpdated,
        FeeRecipientUpdated: FeeRecipientUpdated,
        OwnershipTransferred: OwnershipTransferred,
    }

    #[derive(Drop, starknet::Event)]
    pub struct EventCreated {
        #[key]
        pub event_id: u64,
        #[key]
        pub organizer: ContractAddress,
        pub metadata_hash: felt252,
        pub price: u256,
        pub max_attendees: u32,
        pub start_time: u64,
        pub end_time: u64,
        pub anonymous_allowed: bool,
    }

    #[derive(Drop, starknet::Event)]
    pub struct EventCancelled {
        #[key]
        pub event_id: u64,
        pub cancelled_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TicketPurchased {
        #[key]
        pub event_id: u64,
        #[key]
        pub ticket_id: u64,
        #[key]
        pub buyer: ContractAddress,
        pub price: u256,
        pub purchased_at: u64,
    }

    /// Deliberately omits the buyer address: only the commitment is published.
    #[derive(Drop, starknet::Event)]
    pub struct AnonymousTicketPurchased {
        #[key]
        pub event_id: u64,
        #[key]
        pub ticket_id: u64,
        pub commitment: felt252,
        pub price: u256,
        pub purchased_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TicketTransferred {
        #[key]
        pub ticket_id: u64,
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CheckedIn {
        #[key]
        pub event_id: u64,
        #[key]
        pub ticket_id: u64,
        pub anonymous: bool,
        pub nullifier_hash: felt252,
        pub checked_in_at: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Refunded {
        #[key]
        pub event_id: u64,
        #[key]
        pub ticket_id: u64,
        pub recipient: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Withdrawn {
        #[key]
        pub event_id: u64,
        #[key]
        pub organizer: ContractAddress,
        pub organizer_amount: u256,
        pub fee_amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct PlatformFeeUpdated {
        pub old_bps: u16,
        pub new_bps: u16,
    }

    #[derive(Drop, starknet::Event)]
    pub struct FeeRecipientUpdated {
        pub old_recipient: ContractAddress,
        pub new_recipient: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct OwnershipTransferred {
        #[key]
        pub previous_owner: ContractAddress,
        #[key]
        pub new_owner: ContractAddress,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        payment_token: ContractAddress,
        fee_recipient: ContractAddress,
        platform_fee_bps: u16,
    ) {
        assert(owner.is_non_zero(), Errors::ZERO_ADDRESS);
        assert(fee_recipient.is_non_zero(), Errors::ZERO_ADDRESS);
        assert(platform_fee_bps <= MAX_FEE_BPS, Errors::FEE_TOO_HIGH);

        self.owner.write(owner);
        self.payment_token.write(payment_token);
        self.fee_recipient.write(fee_recipient);
        self.platform_fee_bps.write(platform_fee_bps);
    }

    #[abi(embed_v0)]
    pub impl ZicketEventsImpl of IZicketEvents<ContractState> {
        // ── Organizer ────────────────────────────────────────────────────────
        fn create_event(
            ref self: ContractState,
            metadata_hash: felt252,
            price: u256,
            max_attendees: u32,
            start_time: u64,
            end_time: u64,
            anonymous_allowed: bool,
        ) -> u64 {
            assert(max_attendees > 0, Errors::INVALID_CAPACITY);
            assert(end_time > start_time, Errors::INVALID_WINDOW);

            let organizer = get_caller_address();
            let event_id = self.events_count.read() + 1;

            self
                .events
                .entry(event_id)
                .write(
                    EventData {
                        organizer,
                        metadata_hash,
                        price,
                        max_attendees,
                        tickets_sold: 0,
                        start_time,
                        end_time,
                        anonymous_allowed,
                        cancelled: false,
                        escrow: 0,
                        withdrawn: false,
                    },
                );
            self.events_count.write(event_id);

            self
                .emit(
                    Event::EventCreated(
                        EventCreated {
                            event_id,
                            organizer,
                            metadata_hash,
                            price,
                            max_attendees,
                            start_time,
                            end_time,
                            anonymous_allowed,
                        },
                    ),
                );

            event_id
        }

        fn cancel_event(ref self: ContractState, event_id: u64) {
            let mut event = self._load_event(event_id);
            assert(event.organizer == get_caller_address(), Errors::NOT_ORGANIZER);
            assert(!event.cancelled, Errors::EVENT_CANCELLED);
            assert(!event.withdrawn, Errors::ALREADY_WITHDRAWN);

            event.cancelled = true;
            self.events.entry(event_id).write(event);

            self
                .emit(
                    Event::EventCancelled(
                        EventCancelled { event_id, cancelled_at: get_block_timestamp() },
                    ),
                );
        }

        fn withdraw(ref self: ContractState, event_id: u64) -> u256 {
            let mut event = self._load_event(event_id);
            let caller = get_caller_address();

            assert(event.organizer == caller, Errors::NOT_ORGANIZER);
            assert(!event.cancelled, Errors::EVENT_CANCELLED);
            assert(!event.withdrawn, Errors::ALREADY_WITHDRAWN);
            assert(get_block_timestamp() >= event.end_time, Errors::EVENT_NOT_ENDED);

            let gross = event.escrow;
            event.escrow = 0;
            event.withdrawn = true;
            self.events.entry(event_id).write(event);

            let fee = gross * self.platform_fee_bps.read().into() / BPS_DENOMINATOR;
            let payout = gross - fee;

            if gross > 0 {
                let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
                if fee > 0 {
                    assert(
                        token.transfer(self.fee_recipient.read(), fee), Errors::PAYMENT_FAILED,
                    );
                }
                if payout > 0 {
                    assert(token.transfer(caller, payout), Errors::PAYMENT_FAILED);
                }
            }

            self
                .emit(
                    Event::Withdrawn(
                        Withdrawn {
                            event_id,
                            organizer: caller,
                            organizer_amount: payout,
                            fee_amount: fee,
                        },
                    ),
                );

            payout
        }

        // ── Attendee ─────────────────────────────────────────────────────────
        fn buy_ticket(ref self: ContractState, event_id: u64) -> u64 {
            let mut event = self._load_event(event_id);
            let buyer = get_caller_address();

            self._assert_sale_open(@event);
            assert(
                self.ticket_by_attendee.entry(event_id).entry(buyer).read() == 0,
                Errors::ALREADY_HAS_TICKET,
            );

            self._collect_payment(buyer, event.price);

            let ticket_id = self.tickets_count.read() + 1;
            let now = get_block_timestamp();

            self
                .tickets
                .entry(ticket_id)
                .write(
                    TicketData {
                        event_id,
                        owner: buyer,
                        commitment: 0,
                        mode: TicketMode::Public,
                        paid: event.price,
                        purchased_at: now,
                        checked_in: false,
                        refunded: false,
                    },
                );
            self.tickets_count.write(ticket_id);
            self.ticket_by_attendee.entry(event_id).entry(buyer).write(ticket_id);

            event.tickets_sold += 1;
            event.escrow += event.price;
            self.events.entry(event_id).write(event);

            self
                .emit(
                    Event::TicketPurchased(
                        TicketPurchased {
                            event_id, ticket_id, buyer, price: event.price, purchased_at: now,
                        },
                    ),
                );

            ticket_id
        }

        fn buy_ticket_anonymous(
            ref self: ContractState, event_id: u64, commitment: felt252,
        ) -> u64 {
            let mut event = self._load_event(event_id);

            self._assert_sale_open(@event);
            assert(event.anonymous_allowed, Errors::ANON_NOT_ALLOWED);
            assert(commitment != 0, Errors::INVALID_COMMITMENT);
            assert(
                self.ticket_by_commitment.entry(event_id).entry(commitment).read() == 0,
                Errors::COMMITMENT_USED,
            );

            // The payer is charged but is never recorded against the ticket, so a
            // relayer can settle on behalf of the attendee.
            self._collect_payment(get_caller_address(), event.price);

            let ticket_id = self.tickets_count.read() + 1;
            let now = get_block_timestamp();

            self
                .tickets
                .entry(ticket_id)
                .write(
                    TicketData {
                        event_id,
                        owner: Zero::zero(),
                        commitment,
                        mode: TicketMode::Anonymous,
                        paid: event.price,
                        purchased_at: now,
                        checked_in: false,
                        refunded: false,
                    },
                );
            self.tickets_count.write(ticket_id);
            self.ticket_by_commitment.entry(event_id).entry(commitment).write(ticket_id);

            event.tickets_sold += 1;
            event.escrow += event.price;
            self.events.entry(event_id).write(event);

            self
                .emit(
                    Event::AnonymousTicketPurchased(
                        AnonymousTicketPurchased {
                            event_id, ticket_id, commitment, price: event.price, purchased_at: now,
                        },
                    ),
                );

            ticket_id
        }

        fn transfer_ticket(ref self: ContractState, ticket_id: u64, to: ContractAddress) {
            let mut ticket = self._load_ticket(ticket_id);
            let caller = get_caller_address();

            assert(ticket.mode == TicketMode::Public, Errors::NOT_PUBLIC_TICKET);
            assert(ticket.owner == caller, Errors::NOT_TICKET_OWNER);
            assert(to.is_non_zero(), Errors::ZERO_ADDRESS);
            assert(!ticket.checked_in, Errors::ALREADY_CHECKED_IN);
            assert(
                self.ticket_by_attendee.entry(ticket.event_id).entry(to).read() == 0,
                Errors::ALREADY_HAS_TICKET,
            );

            let event = self._load_event(ticket.event_id);
            assert(!event.cancelled, Errors::EVENT_CANCELLED);

            ticket.owner = to;
            self.tickets.entry(ticket_id).write(ticket);
            self.ticket_by_attendee.entry(ticket.event_id).entry(caller).write(0);
            self.ticket_by_attendee.entry(ticket.event_id).entry(to).write(ticket_id);

            self
                .emit(
                    Event::TicketTransferred(
                        TicketTransferred { ticket_id, from: caller, to },
                    ),
                );
        }

        fn check_in(ref self: ContractState, ticket_id: u64) {
            let mut ticket = self._load_ticket(ticket_id);
            let event = self._load_event(ticket.event_id);
            let caller = get_caller_address();

            assert(ticket.mode == TicketMode::Public, Errors::NOT_PUBLIC_TICKET);
            assert(
                ticket.owner == caller || event.organizer == caller, Errors::NOT_TICKET_OWNER,
            );
            assert(!event.cancelled, Errors::EVENT_CANCELLED);
            assert(!ticket.checked_in, Errors::ALREADY_CHECKED_IN);

            ticket.checked_in = true;
            self.tickets.entry(ticket_id).write(ticket);

            self
                .emit(
                    Event::CheckedIn(
                        CheckedIn {
                            event_id: ticket.event_id,
                            ticket_id,
                            anonymous: false,
                            nullifier_hash: 0,
                            checked_in_at: get_block_timestamp(),
                        },
                    ),
                );
        }

        fn check_in_anonymous(
            ref self: ContractState, event_id: u64, secret: felt252, nullifier: felt252,
        ) -> u64 {
            let event = self._load_event(event_id);
            assert(!event.cancelled, Errors::EVENT_CANCELLED);

            let commitment = self._commitment(secret, nullifier);
            let ticket_id = self.ticket_by_commitment.entry(event_id).entry(commitment).read();
            assert(ticket_id != 0, Errors::TICKET_NOT_FOUND);

            let nullifier_hash = self._nullifier_hash(nullifier);
            assert(
                !self.nullifier_used.entry(event_id).entry(nullifier_hash).read(),
                Errors::NULLIFIER_USED,
            );

            let mut ticket = self.tickets.entry(ticket_id).read();
            assert(!ticket.checked_in, Errors::ALREADY_CHECKED_IN);

            ticket.checked_in = true;
            self.tickets.entry(ticket_id).write(ticket);
            self.nullifier_used.entry(event_id).entry(nullifier_hash).write(true);

            self
                .emit(
                    Event::CheckedIn(
                        CheckedIn {
                            event_id,
                            ticket_id,
                            anonymous: true,
                            nullifier_hash,
                            checked_in_at: get_block_timestamp(),
                        },
                    ),
                );

            ticket_id
        }

        fn refund(ref self: ContractState, ticket_id: u64) -> u256 {
            let mut ticket = self._load_ticket(ticket_id);
            let caller = get_caller_address();

            assert(ticket.mode == TicketMode::Public, Errors::NOT_PUBLIC_TICKET);
            assert(ticket.owner == caller, Errors::NOT_TICKET_OWNER);

            self._settle_refund(ticket_id, ref ticket, caller)
        }

        fn refund_anonymous(
            ref self: ContractState,
            event_id: u64,
            secret: felt252,
            nullifier: felt252,
            recipient: ContractAddress,
        ) -> u256 {
            assert(recipient.is_non_zero(), Errors::ZERO_ADDRESS);

            let commitment = self._commitment(secret, nullifier);
            let ticket_id = self.ticket_by_commitment.entry(event_id).entry(commitment).read();
            assert(ticket_id != 0, Errors::TICKET_NOT_FOUND);

            let nullifier_hash = self._nullifier_hash(nullifier);
            assert(
                !self.nullifier_used.entry(event_id).entry(nullifier_hash).read(),
                Errors::NULLIFIER_USED,
            );
            self.nullifier_used.entry(event_id).entry(nullifier_hash).write(true);

            let mut ticket = self.tickets.entry(ticket_id).read();
            self._settle_refund(ticket_id, ref ticket, recipient)
        }

        // ── Views ────────────────────────────────────────────────────────────
        fn get_event(self: @ContractState, event_id: u64) -> EventData {
            self.events.entry(event_id).read()
        }

        fn get_ticket(self: @ContractState, ticket_id: u64) -> TicketData {
            self.tickets.entry(ticket_id).read()
        }

        fn ticket_of(self: @ContractState, event_id: u64, attendee: ContractAddress) -> u64 {
            self.ticket_by_attendee.entry(event_id).entry(attendee).read()
        }

        fn ticket_of_commitment(
            self: @ContractState, event_id: u64, commitment: felt252,
        ) -> u64 {
            self.ticket_by_commitment.entry(event_id).entry(commitment).read()
        }

        fn is_nullifier_used(
            self: @ContractState, event_id: u64, nullifier_hash: felt252,
        ) -> bool {
            self.nullifier_used.entry(event_id).entry(nullifier_hash).read()
        }

        fn tickets_remaining(self: @ContractState, event_id: u64) -> u32 {
            let event = self.events.entry(event_id).read();
            if event.tickets_sold >= event.max_attendees {
                0
            } else {
                event.max_attendees - event.tickets_sold
            }
        }

        fn events_count(self: @ContractState) -> u64 {
            self.events_count.read()
        }

        fn tickets_count(self: @ContractState) -> u64 {
            self.tickets_count.read()
        }

        fn compute_commitment(
            self: @ContractState, secret: felt252, nullifier: felt252,
        ) -> felt252 {
            self._commitment(secret, nullifier)
        }

        fn compute_nullifier_hash(self: @ContractState, nullifier: felt252) -> felt252 {
            self._nullifier_hash(nullifier)
        }

        // ── Admin ────────────────────────────────────────────────────────────
        fn payment_token(self: @ContractState) -> ContractAddress {
            self.payment_token.read()
        }

        fn platform_fee_bps(self: @ContractState) -> u16 {
            self.platform_fee_bps.read()
        }

        fn fee_recipient(self: @ContractState) -> ContractAddress {
            self.fee_recipient.read()
        }

        fn owner(self: @ContractState) -> ContractAddress {
            self.owner.read()
        }

        fn set_platform_fee_bps(ref self: ContractState, bps: u16) {
            self._assert_only_owner();
            assert(bps <= MAX_FEE_BPS, Errors::FEE_TOO_HIGH);
            let old_bps = self.platform_fee_bps.read();
            self.platform_fee_bps.write(bps);
            self.emit(Event::PlatformFeeUpdated(PlatformFeeUpdated { old_bps, new_bps: bps }));
        }

        fn set_fee_recipient(ref self: ContractState, recipient: ContractAddress) {
            self._assert_only_owner();
            assert(recipient.is_non_zero(), Errors::ZERO_ADDRESS);
            let old_recipient = self.fee_recipient.read();
            self.fee_recipient.write(recipient);
            self
                .emit(
                    Event::FeeRecipientUpdated(
                        FeeRecipientUpdated { old_recipient, new_recipient: recipient },
                    ),
                );
        }

        fn transfer_ownership(ref self: ContractState, new_owner: ContractAddress) {
            self._assert_only_owner();
            assert(new_owner.is_non_zero(), Errors::ZERO_ADDRESS);
            let previous_owner = self.owner.read();
            self.owner.write(new_owner);
            self
                .emit(
                    Event::OwnershipTransferred(
                        OwnershipTransferred { previous_owner, new_owner },
                    ),
                );
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _assert_only_owner(self: @ContractState) {
            assert(self.owner.read() == get_caller_address(), Errors::NOT_OWNER);
        }

        fn _load_event(self: @ContractState, event_id: u64) -> EventData {
            let event = self.events.entry(event_id).read();
            assert(event.organizer.is_non_zero(), Errors::EVENT_NOT_FOUND);
            event
        }

        fn _load_ticket(self: @ContractState, ticket_id: u64) -> TicketData {
            let ticket = self.tickets.entry(ticket_id).read();
            assert(ticket.event_id != 0, Errors::TICKET_NOT_FOUND);
            ticket
        }

        fn _assert_sale_open(self: @ContractState, event: @EventData) {
            assert(!*event.cancelled, Errors::EVENT_CANCELLED);
            assert(*event.tickets_sold < *event.max_attendees, Errors::SOLD_OUT);
            assert(get_block_timestamp() < *event.end_time, Errors::SALE_CLOSED);
        }

        /// Pulls `amount` of the payment token from `payer` into the contract.
        /// Free events (`amount == 0`) skip the transfer entirely so guests never
        /// need a funded wallet.
        fn _collect_payment(ref self: ContractState, payer: ContractAddress, amount: u256) {
            if amount == 0 {
                return;
            }
            let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
            assert(
                token.transfer_from(payer, get_contract_address(), amount),
                Errors::PAYMENT_FAILED,
            );
        }

        fn _settle_refund(
            ref self: ContractState,
            ticket_id: u64,
            ref ticket: TicketData,
            recipient: ContractAddress,
        ) -> u256 {
            let mut event = self._load_event(ticket.event_id);
            assert(event.cancelled, Errors::EVENT_NOT_CANCELLED);
            assert(!ticket.refunded, Errors::ALREADY_REFUNDED);

            let amount = ticket.paid;
            ticket.refunded = true;
            self.tickets.entry(ticket_id).write(ticket);

            event.escrow -= amount;
            self.events.entry(ticket.event_id).write(event);

            if amount > 0 {
                let token = IERC20Dispatcher { contract_address: self.payment_token.read() };
                assert(token.transfer(recipient, amount), Errors::PAYMENT_FAILED);
            }

            self
                .emit(
                    Event::Refunded(
                        Refunded { event_id: ticket.event_id, ticket_id, recipient, amount },
                    ),
                );

            amount
        }

        fn _commitment(self: @ContractState, secret: felt252, nullifier: felt252) -> felt252 {
            PoseidonTrait::new().update(secret).update(nullifier).finalize()
        }

        fn _nullifier_hash(self: @ContractState, nullifier: felt252) -> felt252 {
            PoseidonTrait::new().update(nullifier).finalize()
        }
    }
}

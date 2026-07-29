use snforge_std::{
    ContractClassTrait, DeclareResultTrait, declare, start_cheat_block_timestamp_global,
    start_cheat_caller_address, stop_cheat_caller_address,
};
use starknet::ContractAddress;
use zicket::interfaces::{
    IERC20Dispatcher, IERC20DispatcherTrait, IZicketEventsDispatcher, IZicketEventsDispatcherTrait,
};
use zicket::mock_erc20::MockERC20::{IMockERC20MetaDispatcher, IMockERC20MetaDispatcherTrait};
use zicket::types::TicketMode;

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const PRICE: u256 = 1000;
const FEE_BPS: u16 = 250; // 2.5%
const START_TIME: u64 = 2_000;
const END_TIME: u64 = 10_000;

fn owner() -> ContractAddress {
    'OWNER'.try_into().unwrap()
}
fn organizer() -> ContractAddress {
    'ORGANIZER'.try_into().unwrap()
}
fn alice() -> ContractAddress {
    'ALICE'.try_into().unwrap()
}
fn bob() -> ContractAddress {
    'BOB'.try_into().unwrap()
}
fn fee_recipient() -> ContractAddress {
    'FEE'.try_into().unwrap()
}

#[derive(Copy, Drop)]
struct Ctx {
    zicket: IZicketEventsDispatcher,
    token: IERC20Dispatcher,
    token_admin: IMockERC20MetaDispatcher,
    zicket_address: ContractAddress,
}

fn setup() -> Ctx {
    let erc20_class = declare("MockERC20").unwrap().contract_class();
    let mut erc20_calldata = array![];
    let name: ByteArray = "Mock Starknet Token";
    let symbol: ByteArray = "mSTRK";
    name.serialize(ref erc20_calldata);
    symbol.serialize(ref erc20_calldata);
    18_u8.serialize(ref erc20_calldata);
    0_u256.serialize(ref erc20_calldata);
    owner().serialize(ref erc20_calldata);
    let (token_address, _) = erc20_class.deploy(@erc20_calldata).unwrap();

    let zicket_class = declare("ZicketEvents").unwrap().contract_class();
    let mut calldata = array![];
    owner().serialize(ref calldata);
    token_address.serialize(ref calldata);
    fee_recipient().serialize(ref calldata);
    FEE_BPS.serialize(ref calldata);
    let (zicket_address, _) = zicket_class.deploy(@calldata).unwrap();

    let ctx = Ctx {
        zicket: IZicketEventsDispatcher { contract_address: zicket_address },
        token: IERC20Dispatcher { contract_address: token_address },
        token_admin: IMockERC20MetaDispatcher { contract_address: token_address },
        zicket_address,
    };

    // Fund the buyers and pre-approve the protocol.
    ctx.token_admin.mint(alice(), 1_000_000);
    ctx.token_admin.mint(bob(), 1_000_000);
    fund_approval(ctx, alice());
    fund_approval(ctx, bob());

    start_cheat_block_timestamp_global(START_TIME);
    ctx
}

fn fund_approval(ctx: Ctx, who: ContractAddress) {
    start_cheat_caller_address(ctx.token.contract_address, who);
    ctx.token.approve(ctx.zicket_address, 1_000_000);
    stop_cheat_caller_address(ctx.token.contract_address);
}

fn create_default_event(ctx: Ctx, anonymous_allowed: bool) -> u64 {
    start_cheat_caller_address(ctx.zicket_address, organizer());
    let id = ctx.zicket.create_event('META', PRICE, 100, START_TIME, END_TIME, anonymous_allowed);
    stop_cheat_caller_address(ctx.zicket_address);
    id
}

fn buy_as(ctx: Ctx, who: ContractAddress, event_id: u64) -> u64 {
    start_cheat_caller_address(ctx.zicket_address, who);
    let ticket_id = ctx.zicket.buy_ticket(event_id);
    stop_cheat_caller_address(ctx.zicket_address);
    ticket_id
}

// ─────────────────────────────────────────────────────────────────────────────
// Event creation
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_create_event_stores_data() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);

    assert(event_id == 1, 'first event id is 1');
    assert(ctx.zicket.events_count() == 1, 'events_count == 1');

    let event = ctx.zicket.get_event(event_id);
    assert(event.organizer == organizer(), 'organizer stored');
    assert(event.metadata_hash == 'META', 'metadata stored');
    assert(event.price == PRICE, 'price stored');
    assert(event.max_attendees == 100, 'capacity stored');
    assert(event.tickets_sold == 0, 'no sales yet');
    assert(event.anonymous_allowed, 'anon allowed');
    assert(!event.cancelled, 'not cancelled');
    assert(ctx.zicket.tickets_remaining(event_id) == 100, 'all remaining');
}

#[test]
fn test_event_ids_increment() {
    let ctx = setup();
    assert(create_default_event(ctx, false) == 1, 'id 1');
    assert(create_default_event(ctx, false) == 2, 'id 2');
    assert(ctx.zicket.events_count() == 2, 'count 2');
}

#[test]
#[should_panic(expected: 'Zicket: invalid capacity')]
fn test_create_event_rejects_zero_capacity() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.create_event('META', PRICE, 0, START_TIME, END_TIME, true);
}

#[test]
#[should_panic(expected: 'Zicket: invalid time window')]
fn test_create_event_rejects_bad_window() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.create_event('META', PRICE, 10, END_TIME, START_TIME, true);
}

// ─────────────────────────────────────────────────────────────────────────────
// Public tickets
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_buy_public_ticket_moves_funds_and_records_owner() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);

    let balance_before = ctx.token.balance_of(alice());
    let ticket_id = buy_as(ctx, alice(), event_id);

    assert(ticket_id == 1, 'first ticket id');
    assert(ctx.token.balance_of(alice()) == balance_before - PRICE, 'buyer debited');
    assert(ctx.token.balance_of(ctx.zicket_address) == PRICE, 'escrowed in contract');

    let ticket = ctx.zicket.get_ticket(ticket_id);
    assert(ticket.event_id == event_id, 'linked to event');
    assert(ticket.owner == alice(), 'owner recorded');
    assert(ticket.mode == TicketMode::Public, 'public mode');
    assert(ticket.commitment == 0, 'no commitment');
    assert(ticket.paid == PRICE, 'paid recorded');
    assert(!ticket.checked_in, 'not checked in');

    assert(ctx.zicket.ticket_of(event_id, alice()) == ticket_id, 'index updated');
    assert(ctx.zicket.get_event(event_id).tickets_sold == 1, 'sold counter');
    assert(ctx.zicket.tickets_remaining(event_id) == 99, 'remaining decremented');
}

#[test]
#[should_panic(expected: 'Zicket: already has ticket')]
fn test_cannot_buy_twice() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    buy_as(ctx, alice(), event_id);
    buy_as(ctx, alice(), event_id);
}

#[test]
#[should_panic(expected: 'Zicket: sold out')]
fn test_sold_out() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, organizer());
    let event_id = ctx.zicket.create_event('META', PRICE, 1, START_TIME, END_TIME, false);
    stop_cheat_caller_address(ctx.zicket_address);

    buy_as(ctx, alice(), event_id);
    assert(ctx.zicket.tickets_remaining(event_id) == 0, 'none remaining');
    buy_as(ctx, bob(), event_id);
}

#[test]
#[should_panic(expected: 'Zicket: sale closed')]
fn test_sale_closes_after_event_ends() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    start_cheat_block_timestamp_global(END_TIME + 1);
    buy_as(ctx, alice(), event_id);
}

#[test]
fn test_free_event_requires_no_payment() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, organizer());
    let event_id = ctx.zicket.create_event('FREE', 0, 50, START_TIME, END_TIME, false);
    stop_cheat_caller_address(ctx.zicket_address);

    // `carol` has no tokens and no approval at all.
    let carol: ContractAddress = 'CAROL'.try_into().unwrap();
    start_cheat_caller_address(ctx.zicket_address, carol);
    let ticket_id = ctx.zicket.buy_ticket(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    assert(ticket_id == 1, 'ticket minted');
    assert(ctx.zicket.get_ticket(ticket_id).paid == 0, 'paid nothing');
    assert(ctx.token.balance_of(ctx.zicket_address) == 0, 'no escrow');
}

#[test]
fn test_transfer_ticket_reassigns_index() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.transfer_ticket(ticket_id, bob());
    stop_cheat_caller_address(ctx.zicket_address);

    assert(ctx.zicket.get_ticket(ticket_id).owner == bob(), 'bob owns it');
    assert(ctx.zicket.ticket_of(event_id, alice()) == 0, 'alice index cleared');
    assert(ctx.zicket.ticket_of(event_id, bob()) == ticket_id, 'bob index set');
}

#[test]
#[should_panic(expected: 'Zicket: not ticket owner')]
fn test_transfer_requires_ownership() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, bob());
    ctx.zicket.transfer_ticket(ticket_id, bob());
}

#[test]
fn test_check_in_by_holder_and_by_organizer() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let alice_ticket = buy_as(ctx, alice(), event_id);
    let bob_ticket = buy_as(ctx, bob(), event_id);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.check_in(alice_ticket);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.check_in(bob_ticket);
    stop_cheat_caller_address(ctx.zicket_address);

    assert(ctx.zicket.get_ticket(alice_ticket).checked_in, 'alice in');
    assert(ctx.zicket.get_ticket(bob_ticket).checked_in, 'bob in');
}

#[test]
#[should_panic(expected: 'Zicket: already checked in')]
fn test_public_double_check_in_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.check_in(ticket_id);
    ctx.zicket.check_in(ticket_id);
}

#[test]
#[should_panic(expected: 'Zicket: not ticket owner')]
fn test_stranger_cannot_check_in() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, bob());
    ctx.zicket.check_in(ticket_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Anonymous tickets
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_anonymous_purchase_does_not_record_buyer() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('secret', 'nullifier');

    start_cheat_caller_address(ctx.zicket_address, alice());
    let ticket_id = ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    stop_cheat_caller_address(ctx.zicket_address);

    let ticket = ctx.zicket.get_ticket(ticket_id);
    assert(ticket.mode == TicketMode::Anonymous, 'anon mode');
    assert(ticket.commitment == commitment, 'commitment stored');
    assert(ticket.owner.into() == 0_felt252, 'no owner recorded');
    // The paying wallet is not linkable to the ticket through contract storage.
    assert(ctx.zicket.ticket_of(event_id, alice()) == 0, 'buyer not indexed');
    assert(
        ctx.zicket.ticket_of_commitment(event_id, commitment) == ticket_id, 'commitment indexed',
    );
    // Funds were still collected from the payer.
    assert(ctx.token.balance_of(ctx.zicket_address) == PRICE, 'escrowed');
}

#[test]
fn test_relayer_can_buy_and_a_different_wallet_checks_in() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s1', 'n1');

    // Bob acts as the relayer and pays.
    start_cheat_caller_address(ctx.zicket_address, bob());
    let ticket_id = ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    stop_cheat_caller_address(ctx.zicket_address);

    // A wallet that never touched the purchase redeems it with the secret.
    let stranger: ContractAddress = 'STRANGER'.try_into().unwrap();
    start_cheat_caller_address(ctx.zicket_address, stranger);
    let redeemed = ctx.zicket.check_in_anonymous(event_id, 's1', 'n1');
    stop_cheat_caller_address(ctx.zicket_address);

    assert(redeemed == ticket_id, 'same ticket');
    assert(ctx.zicket.get_ticket(ticket_id).checked_in, 'checked in');
    let nullifier_hash = ctx.zicket.compute_nullifier_hash('n1');
    assert(ctx.zicket.is_nullifier_used(event_id, nullifier_hash), 'nullifier burnt');
}

#[test]
#[should_panic(expected: 'Zicket: nullifier used')]
fn test_anonymous_double_check_in_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s2', 'n2');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    ctx.zicket.check_in_anonymous(event_id, 's2', 'n2');
    ctx.zicket.check_in_anonymous(event_id, 's2', 'n2');
}

#[test]
#[should_panic(expected: 'Zicket: ticket not found')]
fn test_check_in_with_wrong_secret_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s3', 'n3');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    ctx.zicket.check_in_anonymous(event_id, 'wrong', 'n3');
}

#[test]
#[should_panic(expected: 'Zicket: commitment used')]
fn test_duplicate_commitment_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s4', 'n4');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, bob());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
}

#[test]
#[should_panic(expected: 'Zicket: anon not allowed')]
fn test_anonymous_blocked_when_disabled() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let commitment = ctx.zicket.compute_commitment('s5', 'n5');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
}

#[test]
fn test_commitment_is_deterministic_and_distinct() {
    let ctx = setup();
    let a = ctx.zicket.compute_commitment('s', 'n');
    let b = ctx.zicket.compute_commitment('s', 'n');
    let c = ctx.zicket.compute_commitment('n', 's');
    assert(a == b, 'deterministic');
    assert(a != c, 'order matters');
    assert(a != ctx.zicket.compute_nullifier_hash('n'), 'distinct domains');
}

// ─────────────────────────────────────────────────────────────────────────────
// Settlement
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_withdraw_splits_platform_fee() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    buy_as(ctx, alice(), event_id);
    buy_as(ctx, bob(), event_id);

    start_cheat_block_timestamp_global(END_TIME + 1);
    start_cheat_caller_address(ctx.zicket_address, organizer());
    let payout = ctx.zicket.withdraw(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    let gross = PRICE * 2;
    let expected_fee = gross * FEE_BPS.into() / 10000;
    assert(payout == gross - expected_fee, 'payout net of fee');
    assert(ctx.token.balance_of(organizer()) == gross - expected_fee, 'organizer paid');
    assert(ctx.token.balance_of(fee_recipient()) == expected_fee, 'fee paid');
    assert(ctx.token.balance_of(ctx.zicket_address) == 0, 'escrow drained');
    assert(ctx.zicket.get_event(event_id).withdrawn, 'marked withdrawn');
}

#[test]
#[should_panic(expected: 'Zicket: event not ended')]
fn test_withdraw_before_end_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.withdraw(event_id);
}

#[test]
#[should_panic(expected: 'Zicket: already withdrawn')]
fn test_double_withdraw_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    buy_as(ctx, alice(), event_id);

    start_cheat_block_timestamp_global(END_TIME + 1);
    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.withdraw(event_id);
    ctx.zicket.withdraw(event_id);
}

#[test]
#[should_panic(expected: 'Zicket: not organizer')]
fn test_only_organizer_withdraws() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    buy_as(ctx, alice(), event_id);

    start_cheat_block_timestamp_global(END_TIME + 1);
    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.withdraw(event_id);
}

#[test]
fn test_cancel_then_refund_public_ticket() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);
    let balance_after_purchase = ctx.token.balance_of(alice());

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.cancel_event(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, alice());
    let refunded = ctx.zicket.refund(ticket_id);
    stop_cheat_caller_address(ctx.zicket_address);

    assert(refunded == PRICE, 'full refund');
    assert(ctx.token.balance_of(alice()) == balance_after_purchase + PRICE, 'buyer repaid');
    assert(ctx.zicket.get_ticket(ticket_id).refunded, 'marked refunded');
    assert(ctx.zicket.get_event(event_id).escrow == 0, 'escrow cleared');
}

#[test]
#[should_panic(expected: 'Zicket: already refunded')]
fn test_double_refund_reverts() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.cancel_event(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.refund(ticket_id);
    ctx.zicket.refund(ticket_id);
}

#[test]
#[should_panic(expected: 'Zicket: event not cancelled')]
fn test_refund_requires_cancellation() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);
    let ticket_id = buy_as(ctx, alice(), event_id);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.refund(ticket_id);
}

#[test]
fn test_refund_anonymous_pays_chosen_recipient() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s6', 'n6');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.cancel_event(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    // Refund routed to a fresh address, unlinked from the payer.
    let fresh: ContractAddress = 'FRESH'.try_into().unwrap();
    start_cheat_caller_address(ctx.zicket_address, fresh);
    let refunded = ctx.zicket.refund_anonymous(event_id, 's6', 'n6', fresh);
    stop_cheat_caller_address(ctx.zicket_address);

    assert(refunded == PRICE, 'full refund');
    assert(ctx.token.balance_of(fresh) == PRICE, 'fresh wallet paid');
}

#[test]
#[should_panic(expected: 'Zicket: nullifier used')]
fn test_anonymous_refund_cannot_be_replayed() {
    let ctx = setup();
    let event_id = create_default_event(ctx, true);
    let commitment = ctx.zicket.compute_commitment('s7', 'n7');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.buy_ticket_anonymous(event_id, commitment);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.cancel_event(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.refund_anonymous(event_id, 's7', 'n7', alice());
    ctx.zicket.refund_anonymous(event_id, 's7', 'n7', alice());
}

#[test]
#[should_panic(expected: 'Zicket: event cancelled')]
fn test_cannot_buy_after_cancel() {
    let ctx = setup();
    let event_id = create_default_event(ctx, false);

    start_cheat_caller_address(ctx.zicket_address, organizer());
    ctx.zicket.cancel_event(event_id);
    stop_cheat_caller_address(ctx.zicket_address);

    buy_as(ctx, alice(), event_id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin
// ─────────────────────────────────────────────────────────────────────────────

#[test]
fn test_admin_can_update_fee_and_recipient() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, owner());
    ctx.zicket.set_platform_fee_bps(500);
    ctx.zicket.set_fee_recipient(bob());
    stop_cheat_caller_address(ctx.zicket_address);

    assert(ctx.zicket.platform_fee_bps() == 500, 'fee updated');
    assert(ctx.zicket.fee_recipient() == bob(), 'recipient updated');
}

#[test]
#[should_panic(expected: 'Zicket: not owner')]
fn test_non_owner_cannot_update_fee() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.set_platform_fee_bps(500);
}

#[test]
#[should_panic(expected: 'Zicket: fee too high')]
fn test_fee_is_capped() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, owner());
    ctx.zicket.set_platform_fee_bps(1001);
}

#[test]
fn test_ownership_transfer() {
    let ctx = setup();
    start_cheat_caller_address(ctx.zicket_address, owner());
    ctx.zicket.transfer_ownership(alice());
    stop_cheat_caller_address(ctx.zicket_address);

    assert(ctx.zicket.owner() == alice(), 'new owner');

    start_cheat_caller_address(ctx.zicket_address, alice());
    ctx.zicket.set_platform_fee_bps(100);
    stop_cheat_caller_address(ctx.zicket_address);
    assert(ctx.zicket.platform_fee_bps() == 100, 'new owner can admin');
}

#[test]
fn test_config_exposed() {
    let ctx = setup();
    assert(ctx.zicket.payment_token() == ctx.token.contract_address, 'token exposed');
    assert(ctx.zicket.platform_fee_bps() == FEE_BPS, 'fee exposed');
    assert(ctx.zicket.owner() == owner(), 'owner exposed');
}

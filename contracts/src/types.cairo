//! Shared data types for the Zicket ticketing protocol.

use starknet::ContractAddress;

/// Ticket privacy mode.
///
/// * `Public` — ticket is bound to a wallet address and is transferable.
/// * `Anonymous` — ticket is bound to a Poseidon commitment. No address is
///   stored, so a relayer may purchase on behalf of an attendee and any wallet
///   holding the secret can perform the check-in.
#[derive(Copy, Drop, Serde, PartialEq, starknet::Store)]
pub enum TicketMode {
    #[default]
    Public,
    Anonymous,
}

/// On-chain representation of an event.
///
/// `metadata_hash` is a commitment to the off-chain metadata (title, image,
/// location, description) stored in the Zicket database, so the indexer can
/// prove the rendered content matches what the organizer published.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct EventData {
    pub organizer: ContractAddress,
    pub metadata_hash: felt252,
    pub price: u256,
    pub max_attendees: u32,
    pub tickets_sold: u32,
    pub start_time: u64,
    pub end_time: u64,
    pub anonymous_allowed: bool,
    pub cancelled: bool,
    pub escrow: u256,
    pub withdrawn: bool,
}

/// On-chain representation of a single ticket.
///
/// For `TicketMode::Anonymous` tickets `owner` is the zero address and
/// `commitment` holds `poseidon(secret, nullifier)`. For `TicketMode::Public`
/// tickets `commitment` is `0` and `owner` is the holding wallet.
#[derive(Copy, Drop, Serde, starknet::Store)]
pub struct TicketData {
    pub event_id: u64,
    pub owner: ContractAddress,
    pub commitment: felt252,
    pub mode: TicketMode,
    pub paid: u256,
    pub purchased_at: u64,
    pub checked_in: bool,
    pub refunded: bool,
}

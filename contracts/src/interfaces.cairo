//! Public interfaces for the Zicket protocol.

use starknet::ContractAddress;
use zicket::types::{EventData, TicketData};

/// Minimal ERC20 surface required for ticket settlement.
#[starknet::interface]
pub trait IERC20<TContractState> {
    fn balance_of(self: @TContractState, account: ContractAddress) -> u256;
    fn allowance(
        self: @TContractState, owner: ContractAddress, spender: ContractAddress,
    ) -> u256;
    fn transfer(ref self: TContractState, recipient: ContractAddress, amount: u256) -> bool;
    fn transfer_from(
        ref self: TContractState,
        sender: ContractAddress,
        recipient: ContractAddress,
        amount: u256,
    ) -> bool;
    fn approve(ref self: TContractState, spender: ContractAddress, amount: u256) -> bool;
}

/// Core ticketing interface.
#[starknet::interface]
pub trait IZicketEvents<TContractState> {
    // ── Organizer ────────────────────────────────────────────────────────────
    fn create_event(
        ref self: TContractState,
        metadata_hash: felt252,
        price: u256,
        max_attendees: u32,
        start_time: u64,
        end_time: u64,
        anonymous_allowed: bool,
    ) -> u64;
    fn cancel_event(ref self: TContractState, event_id: u64);
    fn withdraw(ref self: TContractState, event_id: u64) -> u256;

    // ── Attendee ─────────────────────────────────────────────────────────────
    fn buy_ticket(ref self: TContractState, event_id: u64) -> u64;
    fn buy_ticket_anonymous(
        ref self: TContractState, event_id: u64, commitment: felt252,
    ) -> u64;
    fn transfer_ticket(ref self: TContractState, ticket_id: u64, to: ContractAddress);
    fn check_in(ref self: TContractState, ticket_id: u64);
    fn check_in_anonymous(
        ref self: TContractState, event_id: u64, secret: felt252, nullifier: felt252,
    ) -> u64;
    fn refund(ref self: TContractState, ticket_id: u64) -> u256;
    fn refund_anonymous(
        ref self: TContractState,
        event_id: u64,
        secret: felt252,
        nullifier: felt252,
        recipient: ContractAddress,
    ) -> u256;

    // ── Views ────────────────────────────────────────────────────────────────
    fn get_event(self: @TContractState, event_id: u64) -> EventData;
    fn get_ticket(self: @TContractState, ticket_id: u64) -> TicketData;
    fn ticket_of(self: @TContractState, event_id: u64, attendee: ContractAddress) -> u64;
    fn ticket_of_commitment(self: @TContractState, event_id: u64, commitment: felt252) -> u64;
    fn is_nullifier_used(self: @TContractState, event_id: u64, nullifier_hash: felt252) -> bool;
    fn tickets_remaining(self: @TContractState, event_id: u64) -> u32;
    fn events_count(self: @TContractState) -> u64;
    fn tickets_count(self: @TContractState) -> u64;
    fn compute_commitment(self: @TContractState, secret: felt252, nullifier: felt252) -> felt252;
    fn compute_nullifier_hash(self: @TContractState, nullifier: felt252) -> felt252;

    // ── Admin ────────────────────────────────────────────────────────────────
    fn payment_token(self: @TContractState) -> ContractAddress;
    fn platform_fee_bps(self: @TContractState) -> u16;
    fn fee_recipient(self: @TContractState) -> ContractAddress;
    fn owner(self: @TContractState) -> ContractAddress;
    fn set_platform_fee_bps(ref self: TContractState, bps: u16);
    fn set_fee_recipient(ref self: TContractState, recipient: ContractAddress);
    fn transfer_ownership(ref self: TContractState, new_owner: ContractAddress);
}

//! Minimal ERC20 used as the settlement asset on devnet and in tests.
//!
//! On mainnet/sepolia the protocol is configured with the canonical STRK or
//! USDC address instead — this contract exists so the full purchase flow can be
//! exercised locally without bridging.

#[starknet::contract]
pub mod MockERC20 {
    use core::num::traits::Zero;
    use starknet::storage::*;
    use starknet::{ContractAddress, get_caller_address};
    use zicket::interfaces::IERC20;

    pub mod Errors {
        pub const INSUFFICIENT_BALANCE: felt252 = 'ERC20: insufficient balance';
        pub const INSUFFICIENT_ALLOWANCE: felt252 = 'ERC20: insufficient allowance';
        pub const ZERO_ADDRESS: felt252 = 'ERC20: zero address';
    }

    #[storage]
    pub struct Storage {
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        total_supply: u256,
        balances: Map<ContractAddress, u256>,
        allowances: Map<ContractAddress, Map<ContractAddress, u256>>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Transfer {
        #[key]
        pub from: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub value: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct Approval {
        #[key]
        pub owner: ContractAddress,
        #[key]
        pub spender: ContractAddress,
        pub value: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: ByteArray,
        symbol: ByteArray,
        decimals: u8,
        initial_supply: u256,
        recipient: ContractAddress,
    ) {
        self.name.write(name);
        self.symbol.write(symbol);
        self.decimals.write(decimals);
        if initial_supply > 0 {
            self._mint(recipient, initial_supply);
        }
    }

    #[abi(embed_v0)]
    pub impl MockERC20Impl of IERC20<ContractState> {
        fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
            self.balances.entry(account).read()
        }

        fn allowance(
            self: @ContractState, owner: ContractAddress, spender: ContractAddress,
        ) -> u256 {
            self.allowances.entry(owner).entry(spender).read()
        }

        fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool {
            self._transfer(get_caller_address(), recipient, amount);
            true
        }

        fn transfer_from(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) -> bool {
            let spender = get_caller_address();
            let allowed = self.allowances.entry(sender).entry(spender).read();
            assert(allowed >= amount, Errors::INSUFFICIENT_ALLOWANCE);
            self.allowances.entry(sender).entry(spender).write(allowed - amount);
            self._transfer(sender, recipient, amount);
            true
        }

        fn approve(ref self: ContractState, spender: ContractAddress, amount: u256) -> bool {
            let owner = get_caller_address();
            self.allowances.entry(owner).entry(spender).write(amount);
            self.emit(Event::Approval(Approval { owner, spender, value: amount }));
            true
        }
    }

    #[starknet::interface]
    pub trait IMockERC20Meta<TContractState> {
        fn name(self: @TContractState) -> ByteArray;
        fn symbol(self: @TContractState) -> ByteArray;
        fn decimals(self: @TContractState) -> u8;
        fn total_supply(self: @TContractState) -> u256;
        /// Unrestricted faucet — devnet/testing only.
        fn mint(ref self: TContractState, recipient: ContractAddress, amount: u256);
    }

    #[abi(embed_v0)]
    pub impl MockERC20MetaImpl of IMockERC20Meta<ContractState> {
        fn name(self: @ContractState) -> ByteArray {
            self.name.read()
        }

        fn symbol(self: @ContractState) -> ByteArray {
            self.symbol.read()
        }

        fn decimals(self: @ContractState) -> u8 {
            self.decimals.read()
        }

        fn total_supply(self: @ContractState) -> u256 {
            self.total_supply.read()
        }

        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self._mint(recipient, amount);
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn _mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            assert(recipient.is_non_zero(), Errors::ZERO_ADDRESS);
            self.total_supply.write(self.total_supply.read() + amount);
            self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);
            self
                .emit(
                    Event::Transfer(Transfer { from: Zero::zero(), to: recipient, value: amount }),
                );
        }

        fn _transfer(
            ref self: ContractState,
            sender: ContractAddress,
            recipient: ContractAddress,
            amount: u256,
        ) {
            assert(recipient.is_non_zero(), Errors::ZERO_ADDRESS);
            let sender_balance = self.balances.entry(sender).read();
            assert(sender_balance >= amount, Errors::INSUFFICIENT_BALANCE);
            self.balances.entry(sender).write(sender_balance - amount);
            self.balances.entry(recipient).write(self.balances.entry(recipient).read() + amount);
            self.emit(Event::Transfer(Transfer { from: sender, to: recipient, value: amount }));
        }
    }
}

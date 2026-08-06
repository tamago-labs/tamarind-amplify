# Tamarind Contracts

The current contract scope contains the proof anchor and the first direct receivable financing draft.

`TamarindProof` anchors one Merkle root for each settlement record. The settlement ID is the hashed reference to the internal Tamarind settlement record. It does not contain identity, Financial Partner, pool, token, or compliance logic.

`ReceivableManager` supports one Company receivable funded by multiple Financial Partners. Each investment creates a non-transferable `InvestmentPositionNFT` lot. The manager uses ERC-20 aUSDC for funding and repayment and calls the Cleanverse Validator before accepting a Financial Partner investment.

`ReceivableFactory` deploys and registers one ReceivableManager per Company receivable. The Factory owner is the protocol deployment account, while every created manager is owned by the Company that called the Factory.

The manager does not create or custody a SHARE A-Token. Cleanverse asset and token integration remains external and must be configured before testnet deployment.

## Deployment

Deploy the proof anchor:

```bash
forge script script/DeployTamarindProof.s.sol:DeployTamarindProof \
  --rpc-url $RPC_URL \
  --broadcast
```

Deploy the receivable factory once per network:

```bash
forge script script/DeployReceivableFactory.s.sol:DeployReceivableFactory \
  --rpc-url $RPC_URL \
  --broadcast
```

The factory deployment requires:

```text
PRIVATE_KEY
AUSDC_ADDRESS
CLEANVERSE_VALIDATOR_ADDRESS
```

After deployment, grant `REGISTER_ROLE` to the factory using the Cleanverse Validator scripts before a Company creates its first receivable.

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

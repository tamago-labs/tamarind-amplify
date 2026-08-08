# Tamarind Validator Flow

## Purpose

The Cleanverse CVI Compliance Validator is the on-chain eligibility layer for Tamarind's future Financial Partner pools. It does not issue A-Pass identities and it does not store passport or KYC documents. A-Pass provides identity attributes; the Validator evaluates those attributes against the rules configured for one specific pool.

```text
A-Pass / CVI
  Provides wallet identity attributes
        |
        v
CVI Compliance Validator
  Evaluates one wallet against one pool policy
        |
        v
PartnerPool or CVA/A-Token
  Allows or rejects the action
```

## What the Validator Answers

The central question is:

```text
Can this wallet participate in this specific pool?
```

The answer is returned by:

```solidity
complianceVerify(poolAddress, userAddress)
```

The result is:

- `true`: the wallet satisfies the pool rules
- `false`: the wallet does not satisfy the pool rules

The Validator checks the user's A-Pass attributes, including:

- Group
- Sub-group
- Tier
- Sub-tier
- Country
- A-Pass validity and status

## Tamarind's Two Contract Systems

Tamarind has two separate business flows.

### Company to Financial Partner

```text
Company
  -> creates verified receivable
Financial Partner
  -> funds Company directly
  -> receives Receivable A-Tokens
```

The Validator is not necessarily required for the first direct financing flow. The Financial Partner can be checked through the application and Cleanverse A-Pass query before funding.

If the Receivable A-Token is a compliant CVA asset, Cleanverse's token-level compliance can control later holding and transfer actions.

### Financial Partner to Pool Investor

```text
Financial Partner
  -> creates PartnerPool
  -> registers pool with Validator
  -> configures RuleV2 policy

Pool Investor
  -> connects wallet
  -> Validator checks eligibility
  -> deposits USDC
  -> receives Pool Share A-Tokens
```

This is the primary Validator use case.

## RuleV2 Policy

The Validator stores one or more rules for each registered pool.

```solidity
struct RuleV2 {
    bytes2 allowedGroup;
    bytes2 allowedSubGroup;
    uint8 minTier;
    uint8 minSubTier;
    uint256 poolCountryBitmap;
}
```

### Logic

Fields inside one rule use AND logic:

```text
Tier >= 30
AND
Group = TM
AND
Country is allowed
```

Multiple rules for the same pool use OR logic:

```text
Rule 1: Tier >= 30 AND US
OR
Rule 2: Tier >= 50 AND Singapore
```

This allows a Financial Partner to create different eligibility paths without creating a shared pool across unrelated partners.

## Pool Registration Flow

Before a PartnerPool accepts investors:

```text
1. Deploy PartnerPool
2. Obtain the pool address
3. Sign the owner message
4. Register the pool with Cleanverse Validator
5. Configure the initial RuleV2 policy
6. Confirm the on-chain transaction
7. Test user eligibility
8. Open pool deposits
```

The registration request contains:

```json
{
  "chain": "base",
  "contract_address": "0xPoolAddress",
  "rule": {
    "allowed_group": "",
    "allowed_sub_group": "TM",
    "min_tier": 1,
    "min_sub_tier": 0,
    "is_black_list": false,
    "countries": ["US", "SG"]
  },
  "owner_signature": "0x..."
}
```

The API request is encrypted with the Cleanverse AES scheme. The pool owner signature is an EIP-191 signature over:

```text
lowercase chain slug + lowercase contract address
```

Example:

```text
base0xpooladdress
```

## Registrar Role

The Cleanverse Validator uses a registrar permission for registering pools.

```text
Cleanverse owner
  -> grants REGISTER_ROLE
Factory or approved registrar
  -> registers PartnerPool contracts
```

The registrar is useful when Tamarind or a Financial Partner operates a factory that creates multiple pools. For a first single-pool test, the approved account can register the pool directly if the Cleanverse account permissions allow it.

## How PartnerPool Uses the Validator

The PartnerPool should check eligibility before accepting investor capital:

```solidity
function deposit(uint256 amount) external {
    require(
        validator.complianceVerify(address(this), msg.sender),
        "Investor not eligible"
    );

    // Transfer USDC and mint Pool Share A-Tokens
}
```

The order should be:

```text
1. Check Validator eligibility
2. Check pool is open
3. Check amount and capacity
4. Transfer USDC from investor
5. Mint Pool Share A-Tokens
```

The pool should not mint shares before the compliance check passes.

## Pool Share A-Tokens

Pool shares are Cleanverse A-Tokens, not custom ERC-20 tokens.

Example:

```text
Pool capacity: 10,000 USDC
Share supply: 1,000,000 Pool Share A-Tokens

Investor deposits: 2,500 USDC
Investor receives: 250,000 Pool Share A-Tokens
```

The Pool Share A-Token uses Cleanverse rules to control who can hold or transfer shares. The PartnerPool controls the accounting relationship between USDC, receivable positions, and shares.

## CVA Automatic Compliance

The CVI integration guide describes a CVA path where compliance is handled by the CVA token itself.

```text
1. Factory registers PartnerPool with Validator
2. Factory registers CVA/A-Token for the pool
3. Pool and optional fee address receive CVI registration
4. Users deposit compliant assets
5. CVA transfer hooks verify CVI automatically
```

In this mode, the business contract may not need to call the Validator for every token transfer. The CVA contract invokes the compliance policy during its transfer hook.

Tamarind should still perform an explicit Validator check before accepting a deposit. This produces a clear application-level rejection before funds move, while the A-Token remains the final transfer-level enforcement layer.

## API Launch Versus Template

### API Launch

Cleanverse launches the A-Token through the Cooperate API.

After issuance:

- Query the final token address
- Grant `MINTER_ROLE` to the correct Tamarind contract
- Configure RuleV2 policy
- Connect the token to PartnerPool

This is recommended for the first testnet because it reduces token implementation risk.

### Custom CVA Template

Tamarind deploys the Cleanverse-compatible token template.

The template must:

- Store the compliance policy address
- Call `canTransfer` during token updates
- Support mint and burn
- Use Ownable or AccessControl
- Be registered with Cleanverse
- Pass Cleanverse contract review

The template is better when Tamarind needs fixed supply enforcement or custom mint/burn behavior, but it creates a larger contract and review surface.

## Recommended V1 Validator Architecture

```text
Cleanverse A-Pass
        |
        v
Cleanverse Validator
        |
        v
PartnerPool
  - checks investor before deposit
  - holds Receivable A-Tokens
  - mints Pool Share A-Tokens
        |
        v
Pool Share A-Token
  - Cleanverse compliance transfer hooks
```

The Company to Financial Partner receivable flow can remain separate:

```text
Company
  -> ReceivableManager
  -> Financial Partner funds with USDC
  -> Receivable A-Token is issued or transferred
```

The Validator becomes mandatory when Pool Investors enter the system.

## Pool Lifecycle and Validator Checks

### Pool Creation

- Financial Partner creates the pool.
- Pool is registered with Validator.
- RuleV2 policy is configured.
- Pool remains closed until registration and rules are confirmed.

### Investor Deposit

- Investor connects wallet.
- Frontend can query eligibility for user feedback.
- PartnerPool performs the authoritative on-chain check.
- USDC is transferred.
- Pool Share A-Tokens are minted.

### Share Transfer

- Pool Share A-Token compliance hooks check the sender and recipient.
- A transfer to an ineligible wallet reverts.

### Pool Pause

If a pool is paused:

- New deposits should stop.
- Share transfers may stop depending on the token policy.
- Redemptions should follow the emergency policy defined by the pool.

### Redemption

- Pool confirms redemption is open.
- Pool calculates the share of available assets.
- Pool burns Pool Share A-Tokens.
- Pool transfers USDC to the eligible investor.

## Validator Test Script Sequence

The scripts under `scripts/` are intended to be run before Solidity deployment:

```text
0-check-cleanverse-config
1-generate-apass
2-query-apass
11-verify-apass
19-validator-sign
20-validator-grant
21-validator-is-register
22-validator-register
23-validator-rules
24-validator-set-rule
25-validator-add-rule
26-validator-verify
27-validator-set-paused
28-validator-is-paused
```

The expected learning flow is:

```text
Create or query A-Pass
  -> Register test pool address
  -> Configure RuleV2
  -> Verify eligible wallet
  -> Verify ineligible wallet
  -> Pause pool
  -> Confirm verification behavior
  -> Unpause pool
```

## Important Design Rules

- A-Pass is the identity source; do not recreate it in Solidity.
- Validator is the pool eligibility source; do not recreate tier or country rules in a local registry.
- A-Token/CVA is the compliant asset source; do not use an unrestricted custom ERC-20 for final assets.
- PartnerPool must use ERC-20 USDC transfers, not native `msg.value`.
- The pool must not mint shares before compliance verification.
- Rules must be configured and confirmed before deposits open.
- Cleanverse API keys remain server-side.
- No passport, bank, or KYC payload belongs on-chain.

# Tamarind Architecture

Status: Working architecture reference

Tamarind is a workspace-based Web3 payment application. Companies operate payment workflows and create verified receivable history. Financial Partners can finance receivables directly or manage permissioned pools for Pool Investors.

## System Overview

```text
Browser
  |
  | Next.js App Router
  | Amplify Authenticator
  | RainbowKit + Wagmi wallet connection
  v
Amplify Data / AppSync
  |
  | Workspace membership and internal records
  | Custom identity operations
  v
cleanverseIdentity Lambda
  |
  | Cleanverse API credentials
  | AES request encryption
  | A-Pass generation and querying
  v
Cleanverse Cooperate API
  |
  | A-Pass / CVI identity
  | A-Token / CVA compliance
  | Validator pool eligibility
```

## Repository Structure

```text
app/
  page.tsx                         Landing page
  layout.tsx                       Root metadata and fonts
  app/
    layout.tsx                     Shared authentication boundary
    page.tsx                       Workspace selector
    workspaces/[workspaceId]/
      layout.tsx                   Workspace membership guard and dashboard shell
      overview/page.tsx            Workspace overview
      [page]/page.tsx              Role-specific placeholder modules
      identities/page.tsx          Company identity management
      identity/
        layout.tsx                 Counter-party identity sidebar
        identities/page.tsx        A-Pass index and empty state
        identities/new/page.tsx    Two-step A-Pass creation flow
        identities/[id]/page.tsx   A-Pass detail page
      organization/
        layout.tsx                 Organization secondary sidebar
        members/page.tsx           Workspace member management
        profile/page.tsx           Company profile
        kyb/page.tsx               KYB workflow
        templates/page.tsx         Template placeholder
        settings/page.tsx          Workspace settings and deletion

amplify/
  backend.ts                       Backend resource composition
  auth/resource.ts                 Cognito configuration
  data/resource.ts                 AppSync schema and custom operations
  functions/
    cleanverseIdentity/
      resource.ts                  Lambda definition and secrets
      handler.ts                   Cleanverse integration and authorization

components/
  app/
    AppAuth.tsx                    Amplify Authenticator and wallet providers
    AppLayout.tsx                  Dashboard shell and topbar
    Sidebar.tsx                    Role-based main navigation
    UserMenu.tsx                   Profile, wallet, and network menu
    WalletProviders.tsx            Wagmi, React Query, RainbowKit providers
    WalletProvider.tsx             Circle adapter preparation
    WorkspaceContext.tsx           Active workspace context
    OrganizationMembers.tsx        Member role management
    CompanyIdentities.tsx          Company identity review table
    IdentitySidebar.tsx            Dynamic Counter-party A-Pass navigation
    CreateIdentityPage.tsx         Passport and wallet A-Pass flow

components/landing/
  Hero.tsx                         Product positioning
  ProductHighlights.tsx            Product capabilities
  OriginationLifecycle.tsx         Role permissions
  SupportedChains.tsx              Cleanverse-supported networks
  RealWorldExample.tsx             Receivable financing example

lib/
  wagmi.ts                         Supported wallet chains and transports
  organizationOptions.ts          Countries, currencies, and company options

scripts/
  cleanverse.txt                   Cleanverse Cooperate API guide
  cvi-integration-guide.txt        CVI Validator integration guide
  cva-integration-guide.txt        CVA and RuleV2 integration guide
  1-generate-apass.ts              A-Pass generation test
  2-query-apass.ts                 A-Pass query test
  11-verify-apass.ts               A-Token eligibility test
  12-update-status.ts              A-Pass freeze/unfreeze test
  utils/setup.ts                   Cleanverse API and AES helper
```

## Authentication and Workspace Context

AWS Amplify Authenticator handles Cognito sign-in and sign-up. After authentication, `/app` loads the user's workspace memberships.

Workspace creation:

- Creates a `Workspace`
- Creates an active `WorkspaceMember` with the `admin` role
- Generates a permanent invite code

Workspace joining:

- Finds the workspace by invite code
- Creates a `pending` `WorkspaceMember`
- Shows a pending approval screen
- Does not assign a business role automatically

The workspace route is scoped by ID:

```text
/app/workspaces/[workspaceId]/...
```

The workspace layout loads the membership and role before rendering the dashboard. Pending members cannot access active workspace pages.

## Role Navigation

### Admin and Company

- Overview
- Workflows
- Identities
- Payments
- Invoices
- Proof Explorer
- Knowledge Base
- Receivable
- Organization

### Counter-party

- Overview
- Identity
- Payments
- Invoices
- Proof Explorer
- Knowledge Base

### Partner

- Overview
- Available Receivables
- Due Diligence
- Identity
- Proof Explorer
- Knowledge Base

Company and Admin share the same operational view, but only workspace administrators and company members can manage organization records.

## Organization Architecture

Organization uses a secondary sidebar:

```text
Members
Company Profile
KYB Verification
Templates
Settings
```

### Members

`WorkspaceMember` stores workspace access and internal role assignment:

- `admin`
- `company`
- `counterParty`
- `partner`

The workspace creator's admin role is locked. Other roles can be assigned or changed by authorized company users.

### Company Profile

`OrganizationProfile` stores workspace business configuration:

- Legal name
- Trading name
- Incorporation country
- Entity type
- Registration number
- Tax ID
- Registered address
- Website
- Local currency using ISO 4217 codes
- Fiscal year start as recurring `MM-DD`
- Business contact details

### KYB

`KYBProfile` tracks the internal business verification workflow:

- Not started
- Draft
- Submitted
- Under review
- Approved
- Rejected
- Needs changes

The current KYB document upload is a local preview only. Real documents should later use Amplify Storage and a selected corporate KYB provider.

The current Cleanverse API documentation covers individual A-Pass identity, not a dedicated corporate KYB endpoint. KYB is therefore separate from A-Pass.

## Wallet Architecture

RainbowKit provides the wallet connection UI. Wagmi manages wallet state and network switching.

Current wallet networks:

- Base Sepolia
- Ethereum Sepolia
- Monad Testnet

The wallet menu provides:

- Connect wallet
- Wallet address and copy action
- Native balance for the active network
- Network switching
- Disconnect wallet
- Edit profile

Circle App Kit and the Viem adapter remain installed as preparation for future Circle payment operations. They are not currently used for Unified Balance or payment execution.

## Cleanverse and A-Pass Architecture

Tamarind uses the term CVI in product language. Cleanverse's wallet-bound implementation is called A-Pass.

### A-Pass Source of Truth

Cleanverse is the source of truth for:

- A-Pass status
- Tier and sub-tier
- Group and sub-group
- Countries
- Expiration
- KYC hash
- Cleanverse record identifiers
- On-chain transaction information

Tamarind stores only the mapping and workspace-specific workflow state.

### Local Models

`WalletIdentity` is global per user, wallet, and chain:

```text
userId
walletAddress
chain
```

`WorkspaceIdentity` links that identity to a workspace:

```text
workspaceId
userId
walletIdentityId
internalStatus
statusNote
statusUpdatedAt
statusUpdatedBy
ownershipMessage
ownershipSignature
ownershipVerifiedAt
ownershipVerifiedBy
```

This allows one Financial Partner to use the same wallet identity across multiple workspaces while each workspace keeps its own internal status.

### A-Pass Creation

The Counter-party uses a two-step flow:

1. Passport data, wallet, and network
2. Review and wallet signature

The Cleanverse request includes:

- `customerId`, derived deterministically from the Cognito user ID
- `subTier: 1`
- `subGroup: "TM"`
- Passport `identityDataList`
- Passport expiration converted to `expirationTime`
- Wallet address and Cleanverse chain slug

Passport images are currently mock previews and are not uploaded or stored.

## Cleanverse Lambda Boundary

The `cleanverseIdentity` Lambda is the only application component that should call the Cleanverse Cooperate API.

It exposes explicit operations:

- `generateApass`
- `queryApass`
- `updateWalletIdentityStatus`
- `verifyWalletIdentity`

The Lambda validates:

- Authenticated Cognito user
- Workspace membership
- Role permissions
- One wallet per chain
- Supported chain slug
- Passport expiry and country format
- Cleanverse response codes

Secrets:

```text
CLEANVERSE_API_ID
CLEANVERSE_API_KEY
CLEANVERSE_BASE_URL
```

These are Amplify secrets, not browser environment variables. AWS Lambda credentials are supplied automatically by its execution role.

## Validator Architecture

The CVI Compliance Validator is not an identity issuer. It is the on-chain eligibility layer for compliant pools and protocols.

```text
A-Pass / CVI
  -> wallet identity and attributes

Validator
  -> checks wallet eligibility for a specific pool

CVA / A-Token
  -> compliant asset and transfer policy
```

The Validator can:

- Verify a wallet against a pool's tier/group/sub-tier/country rules
- Manage independent rules per pool
- Register CVI for CVA pool and fee addresses
- Pause pools for emergency risk control

The later Financial Partner pool flow will use one independent Validator registration per partner pool. Pool contracts will call `complianceVerify(poolAddress, userAddress)` before staking, transfers, claims, or other restricted actions.

Validator integration is not required for:

- A-Pass creation
- Company Profile
- KYB
- Direct Company to Financial Partner financing

It becomes necessary when Pool Investors begin staking into Financial Partner pools.

## Financial Partner and Pool Architecture

The current product model supports two Financial Partner financing paths:

```text
Direct path:
Company -> Financial Partner

Pool path:
Company -> Financial Partner -> Partner Pool -> Pool Investor
```

Each Financial Partner owns and manages its own permissioned pool. Shared pools across multiple Financial Partners are deferred.

Future pool components:

- Financial Partner onboarding and due diligence
- Pool contract or CVA asset
- Cleanverse Validator registration
- RuleV2 policy management
- Pool Investor eligibility check
- Staking and withdrawal flows
- Pool pause and emergency controls

## Security and Authorization Notes

The current project still uses broad authenticated Data authorization on several existing models. Lambda operations perform application-level workspace and role checks, but direct model reads should be tightened before production.

Production hardening should include:

- Restricting identity and KYB model access
- Routing workspace-wide identity reads through authorized operations
- Verifying wallet signatures server-side rather than relying only on frontend verification
- Adding real document storage permissions
- Adding audit events for role, KYB, and identity changes
- Never exposing Cleanverse API keys to the browser

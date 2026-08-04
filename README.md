# Tamarind

**The Web3 Payment Workspace That Issues RWAs**

---

## The Problem

Businesses running global payments face a fragmented stack — payroll tools, invoicing systems, compliance checks, and capital markets all operate in silos. Converting verified financial records into investable assets requires manual documentation, legal overhead, and weeks of due diligence. Investors lack transparent access to compliant real-world assets backed by verifiable operational history.

---

## What Tamarind Does

Tamarind is a compliance-first Web3 payment workspace that turns business payments into investable real-world assets (RWAs).

**For Companies:**
- Run payroll, invoicing, and contractor payments from one visual workspace
- Every transaction creates cryptographically verifiable records
- Convert pending receivables into compliant RWAs for instant capital access

**For Investors:**
- Access CVA-verified RWAs as ERC-20 tokens with fixed returns
- Participate in partner-curated permissioned staking pools
- Invest in assets backed by real, verified payment operations

---

## How It Works

### 1. Compliance Workspace
Design payment workflows visually with drag-and-drop. Every transaction is compliance-ready and cryptographically verifiable.

- Payroll, contractor & vendor records
- Invoice & receivable tracking
- Merkle-rooted financial records
- Programmable compliance rules

### 2. Verified Identity
Every wallet carries a CVI-bound identity — verified once, enforced everywhere.

- CVI identity binding per wallet
- Travel Rule compliance on every transfer
- Identity tiers assigned per company & investor
- Built on Cleanverse's compliance network

### 3. RWA Origination
Run payment operations as usual. When receivables are waiting, tokenize them into compliant RWAs.

- CVA-verified RWA issuance
- Tier-gated holding & transfer rules
- Non-compliant transfers rejected automatically
- Payroll, invoice & receivable origination

### 4. RWA Marketplace
Invest in company RWAs directly or through partner-curated pools.

- Company-originated ERC-20 tokens
- Fixed interest with maturity dates
- Partner-curated permissioned pools
- Risk-rated investment tiers

---

## The Origination Lifecycle

Four roles power the flow from company operations to investor capital:

| Action | Company | Counter-party | Financial Partner | Pool Investor |
|--------|---------|---------------|-------------------|---------------|
| Manage participants | ✓ | — | — | Pool access only |
| Financial records | ✓ | View own | Permissioned | — |
| Invoice submission | ✓ | Submit / Confirm | Review | — |
| CVI identity verification | ✓ | ✓ | ✓ | ✓ |
| Merkle proof verification | ✓ | ✓ | ✓ | ✓ |
| CVA-verified RWA issuance | Originate | — | Finance & hold | — |
| Permissioned staking pools | — | — | Create pool | Participate |

---

## Financial Partner and Pool Model

Tamarind separates receivable origination from passive investment. The Company runs payroll, invoicing, and payments, then issues a receivable backed by Merkle-rooted, CVI-verified history. The Financial Partner reviews and underwrites that receivable, buys it directly from the Company, and manages the investor pool. The Pool Investor stakes capital into the partner's permissioned pool and earns yield without selecting individual receivables.

---

## Compliance Layer (Powered by Cleanverse)

Tamarind is built on Cleanverse's compliance infrastructure:

### CVI — Cleanverse Verified Identity
Identity tokens bound to wallets of verified users — bank-verified identity proofs, local-only PII, revocable credentials.

### CVA — Cleanverse Verified Assets
A digital representation of verified stablecoins and assets, with clean origination, programmable compliance rules, full traceability.

### CCP Protocol
Embedded pre-transaction rule checks, Travel Rule data, and audit-ready extractable reports.

### Playground
Compliance workbench for designing rule engines, validating transaction flows, and generating audit-ready reports.

---

## Supported Chains

Send and receive USDC across 20+ chains. Cross-chain transfers powered by Circle Gateway.

**Testnets (Live during Alpha):**
- Base Sepolia
- Monad Testnet

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Auth:** AWS Amplify (Cognito)
- **Database:** AWS Amplify (DynamoDB)
- **Compliance:** Cleanverse (CVI, CVA, CCP)
- **Cross-chain:** Circle App Kit & Gateway
- **Icons:** @web3icons/react

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
app/
  page.tsx              # Landing page
  layout.tsx            # Root layout with SEO
  app/
    page.tsx            # Authenticated workspace selection
    layout.tsx          # Shared Amplify authentication boundary
    workspaces/[workspaceId]/
      layout.tsx        # Workspace membership guard and dashboard shell
      overview/page.tsx
      [page]/page.tsx   # Role-specific placeholder modules
      organization/
        members/page.tsx
        templates/page.tsx
  explore/
    page.tsx            # RWA marketplace placeholder

components/
  landing/              # Landing page sections
    Hero.tsx
    ProductHighlights.tsx
    OriginationLifecycle.tsx
    SupportedChains.tsx
    RealWorldExample.tsx
    CTA.tsx
    Navbar.tsx
    Footer.tsx
  app/                  # App components
    WorkspaceSelector.tsx
    WorkspaceCard.tsx
    AppLayout.tsx
    Sidebar.tsx
    Dashboard.tsx
    OrganizationMembers.tsx
    PendingApproval.tsx
    InvitePopover.tsx

amplify/
  data/
    resource.ts         # Database schema
  auth/
    resource.ts         # Auth configuration
```

## Workspace Roles

Creating a workspace makes the creator its active, locked `admin`. Joining uses the permanent workspace invite code and creates a `pending` membership without a business role. Pending members see an approval screen until an admin assigns one of these roles:

- **Company:** Full operational workspace access, including organization management
- **Counter-party:** Identity, wallet, payment, invoice, proof, and knowledge access
- **Partner:** Available receivables, due diligence, identity, proof, and knowledge access

Admins can change non-admin member roles from **Organization > Members**. Member records retain Amplify creation and update timestamps, plus the role assignment time and assigning user.

---

## License

MIT © [Tamago Labs](https://tamagolabs.com)

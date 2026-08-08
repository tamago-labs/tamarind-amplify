import { apiRequest, uuid, type GenerateAPassBody, type GenerateAPassResponse } from "./utils/setup.js"

const body: GenerateAPassBody = {
  customerId: "TAMARINDUSER007",
  kycSource: "sumsub",
  kycId: "KYC-001",
  subTier: 10,
  subGroup: "CD",
  override: false,
  expirationTime: 1863690034,
  wallet: {
    address: "0x36bBb997235Fc965a854e132976fC8461B9392F5",
    chain: "base",
  },
  identityDataList: [
    {
      idType: "PASSPORT",
      fullName: "Tamarind Test User",
      idNumber: "A123456789",
      validUntil: "2030-12-31",
      issuingCountryISO2: "US",
    },
  ],
  bankAccountList: [
    {
      bankCountry: "US",
      bankName: "Bank of America",
      bankAccount: "6222021234567890",
      bankAccountType: "A",
      balance: 0,
      currency: "USD",
    },
  ],
}

console.log("=== 1. Generate A-Pass ===")
console.log("Creating verified identity for wallet...\n")

await apiRequest<GenerateAPassResponse>("POST", "/generate_apass", body, {
  encrypted: true,
  requestId: uuid(),
})

// NEW ONE
// === 1. Generate A-Pass ===
// Creating verified identity for wallet...


// ▸ POST /generate_apass
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "customerId": "TAMARINDUSER003",
//     "cvRecordId": "598",
//     "tier": "50",
//     "wallet": {
//       "operate": "insert",
//       "address": "0x971F6680a20671458d456656081ea8e32102a64e",
//       "chain": "base",
//       "txHash": "0xfad4c550b8b84df221821e3f70637d4eac11651f0295304a62bf915eba5bc9b6",
//       "depositUSDCWallet": "0x19E06d2eed180A6dC1D9f086cd60ee06933a0D46",
//       "depositUSDCAccount": "",
//       "depositUSDTWallet": "0x19E06d2eed180A6dC1D9f086cd60ee06933a0D46",
//       "depositUSDTAccount": "",
//       "apassAddress": ""
//     }
//   }
// }

// IF ALREADY THERE
// === 1. Generate A-Pass ===
// Creating verified identity for wallet...


// ▸ POST /generate_apass
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "customerId": "TAMARINDUSER001",
//     "cvRecordId": "594",
//     "tier": "50",
//     "wallet": {
//       "operate": "update",
//       "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
//       "chain": "base",
//       "txHash": "0x27e8050f38cdea005b455012ac70933fcd8cf430691b4327949e965911f62859",
//       "depositUSDCWallet": "0x321977da3f3DA082D259D6e0fA5E75067449350E",
//       "depositUSDCAccount": "",
//       "depositUSDTWallet": "0x321977da3f3DA082D259D6e0fA5E75067449350E",
//       "depositUSDTAccount": "",
//       "apassAddress": ""
//     }
//   }
// }

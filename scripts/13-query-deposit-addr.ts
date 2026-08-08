import { apiRequest, uuid, type QueryDepositAddressBody, type QueryDepositAddressResponse } from "./utils/setup.js"

const body: QueryDepositAddressBody = {
  chain: "base",
  address: "0x971F6680a20671458d456656081ea8e32102a64e",
}

console.log("=== 13. Query Deposit Address ===")
console.log(`Getting deposit addresses for ${body.address}...\n`)

await apiRequest<QueryDepositAddressResponse>("POST", "/query_deposit_address", body, {
  requestId: uuid(),
})

// === 13. Query Deposit Address ===
// Getting deposit addresses for 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0...

// ▸ POST /query_deposit_address
// {
//   "code": "0000",
//   "message": "ok",
//   "data": {
//     "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
//     "chain": "base",
//     "txHash": "",
//     "aPassAddress": "",
//     "depositUSDCWallet": "0x321977da3f3DA082D259D6e0fA5E75067449350E",
//     "depositUSDTWallet": "0x321977da3f3DA082D259D6e0fA5E75067449350E"
//   }
// }
import { apiRequest, uuid, type QueryAPassListResponse } from "./utils/setup.js"

const params = new URLSearchParams({
  page: "1",
  pageSize: "20",
})

console.log("=== 10. Query A-Pass List ===")
console.log("Listing all A-Pass registrations...\n")

await apiRequest<QueryAPassListResponse>("POST", "/query_apass_list", {
  page: 1,
  pageSize: 20,
}, {
  requestId: uuid(),
})

// === 10. Query A-Pass List ===
// Listing all A-Pass registrations...


// ▸ POST /query_apass_list
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "total": 99,
//     "pageSize": 20,
//     "page": 1,
//     "items": [
//       {
//         "cvRecordId": "594",
//         "customerId": "TAMARINDUSER001",
//         "chain": "base",
//         "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
//         "apassAddress": "",
//         "status": null,
//         "tier": "50",
//         "subTier": 9,
//         "group": null,
//         "subGroup": "CD",
//         "countries": [
//           "US"
//         ],
//         "expirationTime": 1863690034,
//         "txHash": "0x27e8050f38cdea005b455012ac70933fcd8cf430691b4327949e965911f62859",
//         "registeredAt": "2026-07-27T17:34:33"
//       },
//       {
//         "cvRecordId": "593",
//         "customerId": "CCMALLORY20001MONAD",
//         "chain": "monad",
//         "walletAddress": "0xa49DC72C5EF423Cc0E7270b816e4dac462A6E721",
//         "apassAddress": "",
//         "status": 1,
//         "tier": "50",
//         "subTier": 20,
//         "group": null,
//         "subGroup": "CC",
//         "countries": [
//           "SG"
//         ],
//         "expirationTime": 1893456000,
//         "txHash": "0xa5f3b1fa5aae6fde0022f222d00eaa6373ba2521cc2a51e3939c3be0b591261f",
//         "registeredAt": "2026-07-27T17:25:12"
//       },
//       {
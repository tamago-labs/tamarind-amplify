import { apiRequest, uuid, type QueryAPassResponse } from "./utils/setup.js"

const body = {
  chain: "base",
  address: "0x971F6680a20671458d456656081ea8e32102a64e",
}

console.log("=== 2. Query A-Pass ===")
console.log("Checking A-Pass status...\n")

await apiRequest<QueryAPassResponse>("POST", "/query_apass", body, {
  requestId: uuid(),
})

// === 2. Query A-Pass ===
// Checking A-Pass status...


// ▸ POST /query_apass
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "subTier": 9,
//     "tier": "50",
//     "expirationTime": 1863690034,
//     "subGroup": "CD",
//     "cvRecordId": "598",
//     "countries": [
//       "US"
//     ],
//     "currentKycHash": "0x25113907653f6b85f08a89ffc2c7e9866e01dc42e487a6a07f03d5e59e53cb4d",
//     "group": "",
//     "status": 1
//   }
// }
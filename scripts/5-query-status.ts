import { apiRequest, uuid, type QueryApplyStatusResponse } from "./utils/setup.js"

const requestId = process.argv[2]

if (!requestId) {
  console.log("=== 5. Query Apply Status ===\n")
  console.log("Usage: npm run 5-query-status -- <requestId>")
  console.log("Example: npm run 5-query-status -- IA20260407153906803586")
  console.log("\nRequestIds from common flows:")
  console.log("  IA...  \u2192 Launch A-Token")
  console.log("  IAR... \u2192 Register A-Token")
  console.log("  WA...  \u2192 Launch Wrapped A-Token")
  console.log("  WAR... \u2192 Register Wrapped A-Token")
  process.exit(1)
}

console.log("=== 5. Query Apply Status ===")
console.log(`Checking status for ${requestId}...\n`)

await apiRequest<QueryApplyStatusResponse>("GET", `/atoken/query_apply_status/${requestId}`, undefined, {
  requestId: uuid(),
})


// === 5. Query Apply Status ===
// Checking status for IA20260727234831795803...


// ▸ GET /atoken/query_apply_status/IA20260727234831795803
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "flowType": "LAUNCH",
//     "requestId": "IA20260727234831795803",
//     "applyStatus": "ISSUED",
//     "chain": "base",
//     "atokenAddress": "0x89a21fAEE4FAf7E8d3d95e7d1236b81dB1FFA48b",
//     "tokenSymbol": "TRT002",
//     "txHash": "0xf1b4608a2b96643916d240f0b23b9d572e158336edeb8bf21e12f9932e62ff1a",
//     "issueErrorMsg": "",
//     "issuedAt": "2026-07-27 23:48:32"
//   }
// }
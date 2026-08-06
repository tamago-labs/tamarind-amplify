import { apiRequest, uuid, type ListATokensResponse } from "./utils/setup.js"

const params = new URLSearchParams({
  page: "1",
  page_size: "20",
})

console.log("=== 6. List My A-Tokens ===")
console.log("Listing all A-Token applications...\n")

await apiRequest<ListATokensResponse>("GET", `/atoken/list_my_atokens?${params}`, undefined, {
  requestId: uuid(),
})


// === 6. List My A-Tokens ===
// Listing all A-Token applications...


// ▸ GET /atoken/list_my_atokens?page=1&page_size=20
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "total": 13,
//     "page": 1,
//     "pageSize": 20,
//     "items": [
//       {
//         "flowType": "LAUNCH",
//         "requestId": "IA20260727175428672374",
//         "applyStatus": "ISSUED",
//         "chain": "base",
//         "atokenAddress": "0x04345ceFdD9AAaAFBD7d04C240c761BbB1884553",
//         "tokenSymbol": "TRT001",
//         "tokenName": "Tamarind Receivable Token",
//         "txHash": "0x71dc6bf84c4b5ff223caa0e5c1f0e8cc80d03b4481d82a4bdbe3957eb3681539",
//         "issuedAt": "2026-07-27 17:54:29",
//         "createTime": "2026-07-27 17:54:29"
//       },
//       {
//         "flowType": "LAUNCH",
//         "requestId": "IA20260727171918806531",
//         "applyStatus": "ISSUED",
//         "chain": "monad",
//         "atokenAddress": "0x6cbA1135f61BA24867Ef125eFcA46fC7f9FDa835",
//         "tokenSymbol": "SPT0001",
//         "tokenName": "SPT Probe 0001",
//         "txHash": "0xc47432e3d0f1c6f0818ca5e7a5ace4dd86c9287682917dd120d4626bfc262b90",
//         "issuedAt": "2026-07-27 17:19:19",
//         "createTime": "2026-07-27 17:19:19"
//       },
//       {
//         "flowType": "LAUNCH",
//         "requestId": "IA20260727150844775413",
//         "applyStatus": "ISSUED",
//         "chain": "base",
//         "atokenAddress": "0x9e6daCD70dcd24FB4f20AD49981f920B99781a18",
//         "tokenSymbol": "CADRE1001",
//         "tokenName": "CleanACE Demo RE",
//         "txHash": "0xd2e7a3a649dfd018d2bcf954f5daf5c3efdf43122d304ad89f0736f34ec45974",
//         "issuedAt": "2026-07-27 15:08:45",
//         "createTime": "2026-07-27 15:08:45"
//       },
//       {
//         "flowType": "LAUNCH",
//         "requestId": "IA20260727090156816555",
//         "applyStatus": "ISSUE_FAILED",
//         "chain": "monad",
//         "tokenSymbol": "SPTRETEST1",
//         "tokenName": "Sandbox Probe Token",
//         "createTime": "2026-07-27 09:01:56"
//       },
//       {
//         "flowType": "LAUNCH",
//         "requestId": "IA20260727061522398962",
//         "applyStatus": "ISSUE_FAILED",
//         "chain": "monad",
//         "tokenSymbol": "CCUSD",
//         "tokenName": "CleanCredit USD",
//         "createTime": "2026-07-27 06:15:23"
//       },
//       {
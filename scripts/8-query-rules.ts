import { apiRequest, uuid, type QueryRulesResponse } from "./utils/setup.js"

const body = {
  chain: "base",
  atoken_address: "0x89a21fAEE4FAf7E8d3d95e7d1236b81dB1FFA48b",
}

console.log("=== 8. Query A-Token Rules ===")
console.log("Fetching compliance rules...\n")

await apiRequest<QueryRulesResponse>("POST", "/atoken/rules", body, {
  requestId: uuid(),
})

// === 8. Query A-Token Rules ===
// Fetching compliance rules...

// ▸ POST /atoken/rules
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "chain": "base",
//     "rules": [
//       {
//         "allowed_group": "",
//         "allowed_sub_group": "",
//         "min_tier": 3,
//         "min_sub_tier": 0,
//         "is_black_list": false,
//         "countries": [
//           "SG",
//           "US"
//         ]
//       },
//       {
//         "allowed_group": "AB",
//         "allowed_sub_group": "",
//         "min_tier": 5,
//         "min_sub_tier": 0,
//         "is_black_list": true,
//         "countries": [
//           "CN",
//           "HK"
//         ]
//       }
//     ],
//     "atoken_address": "0x04345cefdd9aaaafbd7d04c240c761bbb1884553"
//   }
// }

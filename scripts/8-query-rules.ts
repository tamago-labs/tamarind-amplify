import { apiRequest, uuid, type QueryRulesResponse } from "./utils/setup.js"

const body = {
  chain: "base",
  atoken_address: "0xE91425E3C244AeE3CD940eca7548CFF010b20828",
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
//         "min_tier": 5,
//         "min_sub_tier": 0,
//         "is_black_list": false,
//         "countries": []
//       }
//     ],
//     "atoken_address": "0xac0893567d43c3e7e6e35a72803df05416c1f20d"
//   }
// }
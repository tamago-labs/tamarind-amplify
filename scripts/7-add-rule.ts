import { apiRequest, uuid, type AddRuleBody } from "./utils/setup.js"

const body: AddRuleBody = {
  chain: "base",
  atoken_address: "0x89a21fAEE4FAf7E8d3d95e7d1236b81dB1FFA48b",
  rule: {
    allowed_group: "AB",
    allowed_sub_group: "",
    min_tier: 5,
    min_sub_tier: 0,
    is_black_list: true,
    countries: ["CN", "HK"],
  },
}

console.log("=== 7. Add A-Token Rule ===")
console.log("Adding compliance rule...\n")
console.log("Rule:", JSON.stringify(body.rule, null, 2))

await apiRequest("POST", "/atoken/add_rule", body, {
  encrypted: true,
  requestId: uuid(),
})


// === 7. Add A-Token Rule ===
// Adding compliance rule...

// Rule: {
//   "allowed_group": "AB",
//   "allowed_sub_group": "",
//   "min_tier": 5,
//   "min_sub_tier": 0,
//   "is_black_list": true,
//   "countries": [
//     "CN",
//     "HK"
//   ]
// }

// ▸ POST /atoken/add_rule
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "chain": "base",
//     "atoken_address": "0x04345cefdd9aaaafbd7d04c240c761bbb1884553",
//     "tx_hash": "0x3bcd8d5c8ba24522da6987df00b90affb383edb0686c4caa1a8912c4e10f05b4"
//   }
// }
import { apiRequest, uuid, type LaunchATokenBody, type LaunchATokenResponse } from "./utils/setup.js"

const body: LaunchATokenBody = {
  chain: "monad",
  token_name: "Tamarind Receivable Token",
  token_symbol: "TRT003",
  decimals: 6,
  admin_address: "0x36bBb997235Fc965a854e132976fC8461B9392F5",
  rule: {
    allowed_group: "",
    allowed_sub_group: "",
    min_tier: 3,
    min_sub_tier: 0,
    is_black_list: false,
    countries: ["US", "SG"],
  },
  icon: "https://assets.coingecko.com/coins/images/68480/standard/figure.png?1755863954",
}

console.log("=== 4. Launch A-Token ===")
console.log("Issuing new compliant token...\n")
console.log("Token:", body.token_name, `(${body.token_symbol})`)
console.log("Compliance: min_tier >", body.rule.min_tier, "countries:", body.rule.countries, "\n")

const res = await apiRequest<LaunchATokenResponse>("POST", "/atoken/launch", body, {
  encrypted: true,
  requestId: uuid(),
})

if (res.code === "0000" && res.data?.requestId) {
  console.log("\n\u2713 Token application submitted!")
  console.log("  requestId:", res.data.requestId)
  console.log("  Run: npm run 5-query-status -- " + res.data.requestId)
}


// === 4. Launch A-Token ===
// Issuing new compliant token...

// Token: Tamarind Receivable Token (TRT002)
// Compliance: min_tier > 3 countries: [ 'US', 'SG' ]


// ▸ POST /atoken/launch
// {
//   "code": "0000",
//   "message": "success",
//   "data": {
//     "todo": true,
//     "requestId": "IA20260727234831795803",
//     "issueAssetId": 138
//   }
// }

// ✓ Token application submitted!
//   requestId: IA20260727234831795803
//   Run: npm run 5-query-status -- IA20260727234831795803
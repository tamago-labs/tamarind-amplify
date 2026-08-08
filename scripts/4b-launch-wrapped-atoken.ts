import { apiRequest, uuid, type LaunchATokenBody, type LaunchATokenResponse } from "./utils/setup.js"

const body: LaunchATokenBody = {
  chain: "monad",
  token_name: "Tamarind JPYC Wrapped (Monad)",
  token_symbol: "aJPYC-NEW",
  decimals: 6,
  admin_address: "0x36bBb997235Fc965a854e132976fC8461B9392F5",
  rule: {
    allowed_group: "",
    allowed_sub_group: "",
    min_tier: 0,
    min_sub_tier: 0,
    is_black_list: false,
    countries: ["TH","US","SG","JP"],
  },
  icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
  origin_token_address: "0x9465a4C246D44F32F391Ebda165Acb12886746Ca", // JPYC Mock on Base
  origin_token_icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
}

console.log("=== 4b. Launch Wrapped A-Token ===")
console.log("Issuing new wrapped token...\n")
console.log("Token:", body.token_name, `(${body.token_symbol})`)
console.log("Origin:", body.origin_token_address)
console.log("Compliance: min_tier >", body.rule.min_tier, "\n")

const res = await apiRequest<LaunchATokenResponse>("POST", "/atoken/launch_wrapped_atoken", body, {
  encrypted: true,
  requestId: uuid(),
})

if (res.code === "0000" && res.data?.requestId) {
  console.log("\u2713 Wrapped token application submitted!")
  console.log("  requestId:", res.data.requestId)
  console.log("  Run: npm run 5-query-status -- " + res.data.requestId)
}

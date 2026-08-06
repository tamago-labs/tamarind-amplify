import { apiRequest, uuid, type DownloadTravelRuleBody, type DownloadTravelRuleResponse } from "./utils/setup.js"

const body: DownloadTravelRuleBody = {
  customerId: "TAMARINDUSER003",
  txHash: "0x6c7268f90f91f7cc4817b2c03dfadb4b683153a54e5abb295719c65c78c94c5e",
  wallet: {
    address: "0x971F6680a20671458d456656081ea8e32102a64e",
    chain: "base",
  },
}

console.log("=== 15. Download Travel Rule Report ===")
console.log(`Fetching travel rule for tx: ${body.txHash}\n`)

await apiRequest<DownloadTravelRuleResponse>("POST", "/download_travel_rule", body, {
  requestId: uuid(),
})

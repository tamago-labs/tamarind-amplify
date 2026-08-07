import { apiRequest, uuid } from "./utils/setup.js"

const body = {
  entityName: "Tamago Labs",
  serviceName: "Tamarind",
  category: "DeFi",
  license: "TAMARIND-2026",
  logoUrl: "https://avatars.githubusercontent.com/u/169526695",
  addressList: [
    {
      chain: "base",
      symbol: "jpyc",
      assetAddress: "0xc4d91b769f0bd8af2bf7f02862cd233e62c139d4", // JPYC Mock
      walletAddresses: [
        "0x36bBb997235Fc965a854e132976fC8461B9392F5", // Your wallet
      ],
    },
  ],
}

console.log("=== Add Whitelist for Institutional Deposits ===\n")
console.log("Entity:", body.entityName)
console.log("Chain:", body.addressList[0].chain)
console.log("Token:", body.addressList[0].symbol)
console.log("Asset:", body.addressList[0].assetAddress)
console.log("Wallets:", body.addressList[0].walletAddresses)
console.log()

await apiRequest("POST", "/atoken/add_whitelist_for_institutional", body, {
  encrypted: true,
  requestId: uuid(),
})

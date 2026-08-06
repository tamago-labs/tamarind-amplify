import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  address: requiredEnv("VALIDATOR_REGISTRAR_ADDRESS"),
  owner_signature: requiredEnv("VALIDATOR_OWNER_SIGNATURE"),
}

console.log("=== Grant Validator Registrar Role ===")
console.log("Chain:", body.chain)
console.log("Registrar:", body.address)
await apiRequest("POST", "/validator/grant", body, { encrypted: true, requestId: uuid() })

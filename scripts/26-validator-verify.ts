import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
  user_address: requiredEnv("VALIDATOR_USER_ADDRESS"),
}

console.log("=== Verify User Against Validator Pool ===")
console.log("Pool:", body.contract_address)
console.log("User:", body.user_address)
await apiRequest("POST", "/validator/verify", body, { requestId: uuid() })

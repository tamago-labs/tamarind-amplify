import { apiRequest, requiredEnv, uuid } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
}

console.log("=== Check Validator Pool Registration ===")
await apiRequest("POST", "/validator/is_register", body, { requestId: uuid() })

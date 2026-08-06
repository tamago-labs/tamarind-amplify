import { apiRequest, requiredEnv, uuid, validatorRuleFromEnv } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
  rule: validatorRuleFromEnv(),
  owner_signature: requiredEnv("VALIDATOR_OWNER_SIGNATURE"),
}

console.log("=== Register Validator Pool ===")
console.log("Pool:", body.contract_address)
console.log("Rule:", JSON.stringify(body.rule, null, 2))
await apiRequest("POST", "/validator/register", body, { encrypted: true, requestId: uuid() })

import { apiRequest, requiredEnv, uuid, validatorRuleFromEnv } from "./utils/setup.js"

const body = {
  chain: (process.env.VALIDATOR_CHAIN || "base").toLowerCase(),
  contract_address: requiredEnv("VALIDATOR_POOL_ADDRESS"),
  rule: validatorRuleFromEnv(),
}

console.log("=== Set Validator Pool Rule ===")
console.log("Rule:", JSON.stringify(body.rule, null, 2))
await apiRequest("POST", "/validator/set_rule", body, { encrypted: true, requestId: uuid() })

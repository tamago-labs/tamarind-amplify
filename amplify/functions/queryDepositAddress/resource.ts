import { defineFunction, secret } from "@aws-amplify/backend";

export const queryDepositAddress = defineFunction({
  name: "queryDepositAddress",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    CLEANVERSE_API_ID: secret("CLEANVERSE_API_ID"),
    CLEANVERSE_BASE_URL: secret("CLEANVERSE_BASE_URL"),
  },
});

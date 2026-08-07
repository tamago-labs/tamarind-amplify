import { defineFunction, secret } from "@aws-amplify/backend";

export const queryTokenRules = defineFunction({
  name: "queryTokenRules",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    CLEANVERSE_API_ID: secret("CLEANVERSE_API_ID"),
    CLEANVERSE_BASE_URL: secret("CLEANVERSE_BASE_URL"),
  },
});

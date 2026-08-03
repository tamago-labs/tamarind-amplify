import { defineFunction, secret } from "@aws-amplify/backend";

export const cleanverseIdentity = defineFunction({
  name: "cleanverseIdentity",
  entry: "./handler.ts",
  timeoutSeconds: 30,
  environment: {
    CLEANVERSE_API_ID: secret("CLEANVERSE_API_ID"),
    CLEANVERSE_API_KEY: secret("CLEANVERSE_API_KEY"),
    CLEANVERSE_BASE_URL: secret("CLEANVERSE_BASE_URL"),
  },
});

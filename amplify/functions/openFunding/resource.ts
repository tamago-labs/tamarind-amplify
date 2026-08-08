import { defineFunction } from "@aws-amplify/backend";

export const openFunding = defineFunction({
  name: "openFunding",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});

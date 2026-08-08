import { defineFunction } from "@aws-amplify/backend";

export const queryReceivable = defineFunction({
  name: "queryReceivable",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});

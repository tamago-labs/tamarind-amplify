import { defineFunction } from "@aws-amplify/backend";

export const createReceivable = defineFunction({
  name: "createReceivable",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});

import { defineFunction } from "@aws-amplify/backend";

export const addPaymentProof = defineFunction({
  name: "addPaymentProof",
  entry: "./handler.ts",
  timeoutSeconds: 60,
});

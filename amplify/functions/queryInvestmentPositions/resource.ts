import { defineFunction } from "@aws-amplify/backend";

export const queryInvestmentPositions = defineFunction({
  name: "queryInvestmentPositions",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});

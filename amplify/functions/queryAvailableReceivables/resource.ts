import { defineFunction } from "@aws-amplify/backend";

export const queryAvailableReceivables = defineFunction({
  name: "queryAvailableReceivables",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});

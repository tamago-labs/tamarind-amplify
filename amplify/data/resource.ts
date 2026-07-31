import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.string().required(),
      displayName: a.string(),
      avatarUrl: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read", "update"]),
      allow.owner(),
    ]),

  Workspace: a
    .model({
      name: a.string().required(),
      description: a.string(),
      inviteCode: a.string().required(),
      ownerId: a.string().required(),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.owner(),
    ]),

  WorkspaceMember: a
    .model({
      workspaceId: a.id().required(),
      userId: a.string().required(),
      role: a.enum(["admin", "company", "payee", "payer", "partner"]),
      status: a.enum(["pending", "active"]),
      workspace: a.belongsTo("Workspace", "workspaceId"),
    })
    .authorization((allow) => [
      allow.authenticated().to(["read"]),
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

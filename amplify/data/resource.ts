import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { cleanverseIdentity } from "../functions/cleanverseIdentity/resource.js";
import { cleanverseFaucet } from "../functions/cleanverseFaucet/resource.js";
import { queryDepositAddress } from "../functions/queryDepositAddress/resource.js";
import { addWhitelist } from "../functions/addWhitelist/resource.js";
import { removeWhitelist } from "../functions/removeWhitelist/resource.js";
import { queryTokenRules } from "../functions/queryTokenRules/resource.js";

const apassStatus = a.customType({
  workspaceIdentityId: a.id(),
  walletAddress: a.string(),
  chain: a.string(),
  cvRecordId: a.string(),
  tier: a.string(),
  subTier: a.integer(),
  group: a.string(),
  subGroup: a.string(),
  countries: a.string().array(),
  expirationTime: a.integer(),
  currentKycHash: a.string(),
  cleanverseStatus: a.integer(),
  internalStatus: a.string(),
  ownershipVerified: a.boolean(),
});

const schema = a.schema({
  UserProfile: a
    .model({
      userId: a.string().required(),
      displayName: a.string(),
      avatarUrl: a.string(),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  Workspace: a
    .model({
      name: a.string().required(),
      description: a.string(),
      inviteCode: a.string().required(),
      ownerId: a.string().required(),
      members: a.hasMany("WorkspaceMember", "workspaceId"),
      tokens: a.hasMany("WorkspaceToken", "workspaceId"),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  WorkspaceMember: a
    .model({
      workspaceId: a.id().required(),
      userId: a.string().required(),
      role: a.enum(["admin", "company", "counterParty", "partner"]),
      status: a.enum(["pending", "active"]),
      assignedAt: a.datetime(),
      assignedBy: a.string(),
      workspace: a.belongsTo("Workspace", "workspaceId"),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  WorkspaceToken: a
    .model({
      workspaceId: a.id().required(),
      tokenAddress: a.string().required(),
      name: a.string().required(),
      symbol: a.string().required(),
      decimals: a.integer().required(),
      icon: a.string(),
      chain: a.string().required(),
      tokenType: a.enum(["ERC20", "A_TOKEN", "WRAPPED_TOKEN"]),
      originalTokenAddress: a.string(),
      originalTokenName: a.string(),
      originalTokenSymbol: a.string(),
      originalTokenDecimals: a.integer(),
      originalTokenIcon: a.string(),
      addedBy: a.string(),
      workspace: a.belongsTo("Workspace", "workspaceId"),
    })
    .authorization((allow) => [
      allow.authenticated(),
    ]),

  OrganizationProfile: a
    .model({
      workspaceId: a.id().required(),
      legalName: a.string().required(),
      tradingName: a.string(),
      incorporationCountryISO2: a.string().required(),
      entityType: a.string().required(),
      registrationNumber: a.string(),
      taxId: a.string(),
      registeredAddress: a.string(),
      website: a.string(),
      localCurrency: a.string().required(),
      fiscalYearStart: a.string().required(),
      businessDescription: a.string(),
      contactEmail: a.string(),
      contactPhone: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  OrganizationIdentity: a
    .model({
      workspaceId: a.id().required(),
      createdBy: a.string().required(),
      walletAddress: a.string().required(),
      chain: a.string().required(),
      internalStatus: a.enum(["pending", "active", "needsReview", "suspended", "archived"]),
      statusNote: a.string(),
      statusUpdatedAt: a.datetime(),
      statusUpdatedBy: a.string(),
      ownershipMessage: a.string().required(),
      ownershipSignature: a.string().required(),
      ownershipVerifiedAt: a.datetime(),
      ownershipVerifiedBy: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  WhitelistEntry: a
    .model({
      workspaceId: a.id().required(),
      walletAddress: a.string().required(),
      chain: a.string().required(),
      tokenAddress: a.string().required(),
      tokenSymbol: a.string(),
      status: a.enum(["active", "removed"]),
      addedAt: a.datetime(),
      addedBy: a.string(),
      removedAt: a.datetime(),
      removedBy: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  WalletIdentity: a
    .model({
      userId: a.string().required(),
      walletAddress: a.string().required(),
      chain: a.string().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  WorkspaceIdentity: a
    .model({
      workspaceId: a.id().required(),
      userId: a.string().required(),
      walletIdentityId: a.id().required(),
      internalStatus: a.enum(["pending", "active", "needsReview", "suspended", "archived"]),
      statusNote: a.string(),
      statusUpdatedAt: a.datetime(),
      statusUpdatedBy: a.string(),
      ownershipMessage: a.string(),
      ownershipSignature: a.string(),
      ownershipVerifiedAt: a.datetime(),
      ownershipVerifiedBy: a.string(),
    })
    .authorization((allow) => [allow.authenticated()]),

  queryApass: a
    .query()
    .arguments({
      workspaceId: a.id().required(),
      workspaceIdentityId: a.id().required(),
    })
    .returns(apassStatus)
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  generateApass: a
    .mutation()
    .arguments({
      workspaceId: a.id().required(),
      walletAddress: a.string().required(),
      chain: a.string().required(),
      ownershipMessage: a.string().required(),
      ownershipSignature: a.string().required(),
      fullName: a.string().required(),
      passportNumber: a.string().required(),
      validUntil: a.string().required(),
      issuingCountryISO2: a.string().required(),
    })
    .returns(apassStatus)
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  generateOrganizationApass: a
    .mutation()
    .arguments({
      workspaceId: a.id().required(),
      walletAddress: a.string().required(),
      chain: a.string().required(),
      ownershipMessage: a.string().required(),
      ownershipSignature: a.string().required(),
      organization: a.boolean().required(),
    })
    .returns(apassStatus)
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  queryOrganizationApass: a
    .query()
    .arguments({ workspaceId: a.id().required(), organizationIdentityId: a.id().required() })
    .returns(apassStatus)
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  updateWalletIdentityStatus: a
    .mutation()
    .arguments({
      workspaceId: a.id().required(),
      workspaceIdentityId: a.id().required(),
      internalStatus: a.enum(["pending", "active", "needsReview", "suspended", "archived"]),
      statusNote: a.string(),
    })
    .returns(a.customType({ success: a.boolean().required(), statusUpdatedAt: a.datetime() }))
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  verifyWalletIdentity: a
    .mutation()
    .arguments({ workspaceId: a.id().required(), workspaceIdentityId: a.id().required() })
    .returns(a.customType({ success: a.boolean().required(), verifiedAt: a.datetime() }))
    .handler(a.handler.function(cleanverseIdentity))
    .authorization((allow) => [allow.authenticated()]),

  cleanverseFaucet: a
    .mutation()
    .arguments({
      chain: a.string().required(),
      depositAddress: a.string().required(),
      amount: a.string(),
    })
    .returns(a.customType({ success: a.boolean().required(), txHash: a.string(), error: a.string() }))
    .handler(a.handler.function(cleanverseFaucet))
    .authorization((allow) => [allow.authenticated()]),

  queryDepositAddress: a
    .query()
    .arguments({
      chain: a.string().required(),
      address: a.string().required(),
    })
    .returns(a.customType({ success: a.boolean().required(), depositAddress: a.string(), error: a.string() }))
    .handler(a.handler.function(queryDepositAddress))
    .authorization((allow) => [allow.authenticated()]),

  addWhitelist: a
    .mutation()
    .arguments({
      chain: a.string().required(),
      tokenAddress: a.string().required(),
      tokenSymbol: a.string().required(),
      walletAddresses: a.string().array().required(),
    })
    .returns(a.customType({ success: a.boolean().required(), error: a.string() }))
    .handler(a.handler.function(addWhitelist))
    .authorization((allow) => [allow.authenticated()]),

  removeWhitelist: a
    .mutation()
    .arguments({
      chain: a.string().required(),
      tokenAddress: a.string().required(),
      tokenSymbol: a.string().required(),
      walletAddresses: a.string().array().required(),
      removeReason: a.string(),
    })
    .returns(a.customType({ success: a.boolean().required(), error: a.string() }))
    .handler(a.handler.function(removeWhitelist))
    .authorization((allow) => [allow.authenticated()]),

  queryTokenRules: a
    .query()
    .arguments({
      chain: a.string().required(),
      tokenAddress: a.string().required(),
    })
    .returns(a.customType({ success: a.boolean().required(), rules: a.string(), error: a.string() }))
    .handler(a.handler.function(queryTokenRules))
    .authorization((allow) => [allow.authenticated()]),
}).authorization((allow) => [allow.resource(cleanverseIdentity), allow.resource(cleanverseFaucet), allow.resource(queryDepositAddress), allow.resource(addWhitelist), allow.resource(removeWhitelist), allow.resource(queryTokenRules)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

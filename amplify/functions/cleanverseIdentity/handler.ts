import crypto from "node:crypto";
import type { Schema } from "../../data/resource.js";
import { Amplify } from "aws-amplify";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/cleanverseIdentity";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();
const IV = Buffer.alloc(16, 0);
const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;
const chainSlugs = new Set(["base", "monad"]);

type Identity = { sub?: string; username?: string } | undefined;

function actorId(identity: Identity) {
  const id = identity?.username || identity?.sub;
  if (!id) throw new Error("Authenticated user is required");
  return id;
}

function customerIdFor(userId: string) {
  return `TAMARIND${crypto.createHash("sha256").update(userId).digest("hex").slice(0, 24).toUpperCase()}`;
}

function organizationCustomerIdFor(workspaceId: string) {
  return `TAMARINDORG${crypto.createHash("sha256").update(workspaceId).digest("hex").slice(0, 22).toUpperCase()}`;
}

function identityIdFor(userId: string, chain: string) {
  return crypto.createHash("sha256").update(`${userId}:${chain}`).digest("hex");
}

function workspaceIdentityIdFor(workspaceId: string, walletIdentityId: string) {
  return crypto.createHash("sha256").update(`${workspaceId}:${walletIdentityId}`).digest("hex");
}

function organizationIdentityIdFor(workspaceId: string, chain: string) {
  return crypto.createHash("sha256").update(`${workspaceId}:${chain}`).digest("hex");
}

function normalizeChain(chain: string) {
  const value = chain.toLowerCase();
  if (!chainSlugs.has(value)) throw new Error("Unsupported Cleanverse chain");
  return value;
}

function expirationFromPassport(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("Passport expiry must use YYYY-MM-DD format");
  const timestamp = Date.parse(`${value}T23:59:59Z`);
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) throw new Error("Passport must not be expired");
  return Math.floor(timestamp / 1000);
}

function encrypt(body: object) {
  const configuredKey = env.CLEANVERSE_API_KEY.trim().replace(/^['"]|['"]$/g, "");
  const decodedKey = Buffer.from(configuredKey.replace(/\s/g, ""), "base64");
  const rawKey = Buffer.from(configuredKey, "utf8");
  const key = decodedKey.length === 32 ? decodedKey : rawKey.length === 32 ? rawKey : null;
  if (!key) throw new Error("CLEANVERSE_API_KEY must be a Base64-encoded 32-byte key (or a raw 32-byte key)");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, IV);
  return Buffer.concat([cipher.update(JSON.stringify(body), "utf8"), cipher.final()]).toString("base64");
}

async function cleanverseRequest<T>(path: string, body: object, encrypted = false): Promise<{ code: string; message: string; data: T }> {
  const response = await fetch(`${env.CLEANVERSE_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-id": env.CLEANVERSE_API_ID, "X-Request-ID": crypto.randomUUID() },
    body: JSON.stringify(encrypted ? { data: encrypt(body) } : body),
  });
  const payload = await response.json() as { code: string; message: string; data: T };
  if (!response.ok || payload.code !== "0000") throw new Error(payload.message || `Cleanverse request failed (${payload.code})`);
  return payload;
}

async function memberFor(workspaceId: string, userId: string) {
  const { data: members } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspaceId }, userId: { eq: userId } } });
  return members?.[0];
}

async function canManage(workspaceId: string, userId: string) {
  const member = await memberFor(workspaceId, userId);
  if (!member || (member.role !== "admin" && member.role !== "company") || member.status !== "active") throw new Error("Company identity access is required");
  return member;
}

async function workspaceIdentityFor(id: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: identity } = await client.models.WorkspaceIdentity.get({ id });
    if (identity) return identity;
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return null;
}

async function organizationIdentityFor(id: string) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: identity } = await client.models.OrganizationIdentity.get({ id });
    if (identity) return identity;
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
  }
  return null;
}

async function queryOrganizationIdentity(organizationIdentityId: string, actor: string, workspaceId: string) {
  const identity = await organizationIdentityFor(organizationIdentityId);
  if (!identity || identity.workspaceId !== workspaceId) throw new Error("Company identity not found");
  await canManage(workspaceId, actor);
  const result = await cleanverseRequest<{ cvRecordId?: string; tier?: string; subTier?: number; group?: string; subGroup?: string; countries?: string[]; expirationTime?: number; currentKycHash?: string; status?: number }>("/query_apass", { chain: identity.chain, address: identity.walletAddress });
  return { workspaceIdentityId: identity.id, walletAddress: identity.walletAddress, chain: identity.chain, cvRecordId: result.data?.cvRecordId, tier: result.data?.tier, subTier: result.data?.subTier, group: result.data?.group, subGroup: result.data?.subGroup, countries: result.data?.countries?.length ? result.data.countries : ["US"], expirationTime: result.data?.expirationTime, currentKycHash: result.data?.currentKycHash, cleanverseStatus: result.data?.status, internalStatus: identity.internalStatus || "pending", ownershipVerified: Boolean(identity.ownershipVerifiedAt) };
}

async function queryIdentity(workspaceIdentityId: string, actor: string, workspaceId: string) {
  const workspaceIdentity = await workspaceIdentityFor(workspaceIdentityId);
  if (!workspaceIdentity || workspaceIdentity.workspaceId !== workspaceId) {
    console.error("Workspace identity lookup failed", { workspaceIdentityId, workspaceId, actor });
    throw new Error("Identity not found");
  }
  if (workspaceIdentity.userId !== actor) await canManage(workspaceId, actor);
  const { data: identity } = await client.models.WalletIdentity.get({ id: workspaceIdentity.walletIdentityId });
  if (!identity) throw new Error("Wallet identity not found");
  const result = await cleanverseRequest<{
    cvRecordId?: string;
    tier?: string;
    subTier?: number;
    group?: string;
    subGroup?: string;
    countries?: string[];
    expirationTime?: number;
    currentKycHash?: string;
    status?: number;
  }>("/query_apass", { chain: identity.chain, address: identity.walletAddress });
  return {
    workspaceIdentityId,
    walletAddress: identity.walletAddress,
    chain: identity.chain,
    cvRecordId: result.data?.cvRecordId,
    tier: result.data?.tier,
    subTier: result.data?.subTier,
    group: result.data?.group,
    subGroup: result.data?.subGroup,
    countries: result.data?.countries || [],
    expirationTime: result.data?.expirationTime,
    currentKycHash: result.data?.currentKycHash,
    cleanverseStatus: result.data?.status,
    internalStatus: workspaceIdentity.internalStatus || "pending",
    ownershipVerified: Boolean(workspaceIdentity.ownershipVerifiedAt),
  };
}

type IdentityEvent = { arguments: Record<string, any>; identity?: Identity; info?: { fieldName?: string }; fieldName?: string };

export const handler = async (event: IdentityEvent) => {
  const actor = actorId(event.identity as Identity);
  const args = event.arguments;
  const fieldName = event.info?.fieldName || event.fieldName || (args.organization ? "generateOrganizationApass" : args.walletAddress ? "generateApass" : args.internalStatus ? "updateWalletIdentityStatus" : args.organizationIdentityId ? "queryOrganizationApass" : "queryApass");

  if (fieldName === "generateOrganizationApass") {
    const chain = normalizeChain(args.chain);
    await canManage(args.workspaceId, actor);
    const id = organizationIdentityIdFor(args.workspaceId, chain);
    const existing = await organizationIdentityFor(id);
    if (existing) return queryOrganizationIdentity(id, actor, args.workspaceId);
    await cleanverseRequest("/generate_apass", { customerId: organizationCustomerIdFor(args.workspaceId), subTier: 1, subGroup: "TM", expirationTime: Math.floor(Date.now() / 1000) + ONE_YEAR_SECONDS, wallet: { address: args.walletAddress, chain } }, true);
    const { errors } = await client.models.OrganizationIdentity.create({ id, workspaceId: args.workspaceId, createdBy: actor, walletAddress: args.walletAddress, chain, internalStatus: "pending", ownershipMessage: args.ownershipMessage, ownershipSignature: args.ownershipSignature });
    if (errors?.length) throw new Error(errors[0].message);
    return queryOrganizationIdentity(id, actor, args.workspaceId);
  }

  if (fieldName === "generateApass") {
    const chain = normalizeChain(args.chain);
    const member = await memberFor(args.workspaceId, actor);
    if (!member || member.status !== "active") throw new Error("Active workspace membership is required");
    const walletIdentityId = identityIdFor(actor, chain);
    const { data: existing } = await client.models.WalletIdentity.get({ id: walletIdentityId });
    if (existing && existing.walletAddress.toLowerCase() !== args.walletAddress.toLowerCase()) throw new Error("A different wallet is already registered for this network");
    if (!existing) {
      const issuingCountryISO2 = args.issuingCountryISO2.toUpperCase();
      if (!/^[A-Z]{2}$/.test(issuingCountryISO2)) throw new Error("Issuing country must be a two-letter ISO code");
      await cleanverseRequest("/generate_apass", {
        customerId: customerIdFor(actor),
        subTier: 1,
        subGroup: "TM",
        expirationTime: expirationFromPassport(args.validUntil),
        wallet: { address: args.walletAddress, chain },
        identityDataList: [{ idType: "PASSPORT", fullName: args.fullName, idNumber: args.passportNumber, validUntil: args.validUntil, issuingCountryISO2 }],
      }, true);
      const { errors: walletErrors } = await client.models.WalletIdentity.create({ id: walletIdentityId, userId: actor, walletAddress: args.walletAddress, chain });
      if (walletErrors?.length) {
        console.error("Wallet identity persistence failed after Cleanverse issuance", walletErrors);
        throw new Error(walletErrors[0].message);
      }
    }
    const workspaceIdentityId = workspaceIdentityIdFor(args.workspaceId, walletIdentityId);
    const { data: existingLink } = await client.models.WorkspaceIdentity.get({ id: workspaceIdentityId });
    if (existingLink) return queryIdentity(workspaceIdentityId, actor, args.workspaceId);
    const { errors: linkErrors } = await client.models.WorkspaceIdentity.create({ id: workspaceIdentityId, workspaceId: args.workspaceId, userId: actor, walletIdentityId, internalStatus: "pending", ownershipMessage: args.ownershipMessage, ownershipSignature: args.ownershipSignature });
    if (linkErrors?.length) {
      console.error("Workspace identity persistence failed after Cleanverse issuance", linkErrors);
      throw new Error(linkErrors[0].message);
    }
    return queryIdentity(workspaceIdentityId, actor, args.workspaceId);
  }

  if (fieldName === "queryApass") return queryIdentity(args.workspaceIdentityId, actor, args.workspaceId);
  if (fieldName === "queryOrganizationApass") return queryOrganizationIdentity(args.organizationIdentityId, actor, args.workspaceId);

  if (fieldName === "updateWalletIdentityStatus") {
    await canManage(args.workspaceId, actor);
    const identity = await workspaceIdentityFor(args.workspaceIdentityId);
    if (!identity || identity.workspaceId !== args.workspaceId) throw new Error("Identity not found");
    const now = new Date().toISOString();
    const { data: updated } = await client.models.WorkspaceIdentity.update({ id: args.workspaceIdentityId, internalStatus: args.internalStatus, statusNote: args.statusNote, statusUpdatedAt: now, statusUpdatedBy: actor });
    return { success: Boolean(updated), statusUpdatedAt: now };
  }

  if (fieldName === "verifyWalletIdentity") {
    await canManage(args.workspaceId, actor);
    const identity = await workspaceIdentityFor(args.workspaceIdentityId);
    if (!identity || identity.workspaceId !== args.workspaceId) throw new Error("Identity not found");
    const now = new Date().toISOString();
    const { data: updated } = await client.models.WorkspaceIdentity.update({ id: args.workspaceIdentityId, ownershipVerifiedAt: now, ownershipVerifiedBy: actor });
    return { success: Boolean(updated), verifiedAt: now };
  }

  throw new Error(`Unsupported identity operation: ${fieldName}`);
};

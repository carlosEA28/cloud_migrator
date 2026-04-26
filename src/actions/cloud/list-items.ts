"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getValidToken } from "@/helpers/refreshProviderToken";
import { createAdapter } from "@/lib/cloud-adapters/factory";
import { ProviderType } from "@/lib/cloud-adapters/types";

export async function listCloudItems(provider: ProviderType, parentId?: string, pageToken?: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    // Mapping between ProviderType and the string used in refreshProviderToken
    // Assuming google-drive maps to google and dropbox maps to dropbox
    const dbProvider = provider === "google" ? "google" : "dropbox";

    const token = await getValidToken(session.user.id, dbProvider);
    if (!token) throw new Error(`Provider ${provider} not connected`);

    const adapter = createAdapter(provider, token);
    
    // Set default parentId if not provided
    const effectiveParentId = parentId ?? (provider === "google" ? "root" : "");
    
    return await adapter.listItems(effectiveParentId, pageToken);
  } catch (error) {
    console.error("Cloud Action Error:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to list cloud items");
  }
}

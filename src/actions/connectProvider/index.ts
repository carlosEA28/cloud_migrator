"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

const providerSlugToId: Record<string, string> = {
    "google-drive": "google",
    "dropbox": "dropbox",
}

export async function connectProvider(provider: string) {
    const providerId = providerSlugToId[provider] ?? provider
    const data = await auth.api.linkSocialAccount({
        headers: await headers(),
        body: {
            provider: providerId,
            callbackURL: "/dashboard/providers/" + provider
        }
    })

    redirect(data.url)
}
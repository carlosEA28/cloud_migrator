"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getStorageDropbox } from "@/app/api/providers/dropbox"
import { getStorageGoogle } from "@/app/api/providers/googleDrive"
import { getValidToken } from "@/helpers/refreshProviderToken"
import {redis} from "@/lib/redis/redis";

const targetProviders = ["google", "dropbox"]

export async function checkProvidersStatus() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user) throw new Error("User not authenticated")

    const providers = await Promise.all(
        targetProviders.map(async (providerId) => {
            const accessToken = await getValidToken(session.user.id, providerId)

            if (!accessToken) {
                return { provider: providerId, connected: false, data: null }
            }

            const cacheKey = `storage:${session.user.id}:${providerId}`
            const cached = await redis.get(cacheKey)
            if (cached) {
                return { provider: providerId, connected: true, data: JSON.parse(cached) }
            }

            let data = null
            try {
                if (providerId === "google") {
                    data = await getStorageGoogle(accessToken)
                } else if (providerId === "dropbox") {
                    data = await getStorageDropbox(accessToken)
                }
                
                if (data) {
                    await redis.set(cacheKey, JSON.stringify(data), "EX", 300)
                }
            } catch (error) {
                const err = error as { response?: { status?: number }, isAxiosError?: boolean }
                if (!err.isAxiosError || ![401, 403].includes(err.response?.status ?? 0)) {
                    console.error(`Error fetching ${providerId} data:`, error)
                }
            }

            return { provider: providerId, connected: !!accessToken, data }
        })
    )

    return providers
}
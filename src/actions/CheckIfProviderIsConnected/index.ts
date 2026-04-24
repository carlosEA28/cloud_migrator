"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getStorageDropbox } from "@/app/api/providers/dropbox"
import { getStorageGoogle } from "@/app/api/providers/googleDrive"
import {redis} from "@/lib/redis/redis";

const targetProviders = ["google", "dropbox"]

export async function checkProvidersStatus() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user) throw new Error("User not authenticated")

    // 1 query só
    const accounts = await prisma.account.findMany({
        where: {
            userId: session.user.id,
            providerId: { in: targetProviders }
        }
    })

    const providers = await Promise.all(
        targetProviders.map(async (providerId) => {
            const account = accounts.find(a => a.providerId === providerId)
            const hasToken = !!account?.accessToken

            if (!hasToken || !account?.accessToken) {
                return { provider: providerId, connected: false, data: null }
            }

            // Checa cache antes de chamar a API
            const cacheKey = `storage:${session.user.id}:${providerId}`
            const cached = await redis.get(cacheKey)
            if (cached) {
                return { provider: providerId, connected: true, data: JSON.parse(cached) }
            }

            let data = null
            try {
                if (providerId === "google") {
                    data = await getStorageGoogle(account.accessToken)
                } else if (providerId === "dropbox") {
                    data = await getStorageDropbox(account.accessToken)
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

            return { provider: providerId, connected: hasToken, data }
        })
    )

    return providers
}
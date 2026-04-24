import { getStorageGoogle } from "@/app/api/providers/googleDrive"
import { getStorageDropbox } from "@/app/api/providers/dropbox"
import {redis} from "@/lib/redis/redis";

export async function getProviderData(
    provider: string,
    accessToken: string,
    userId: string
) {
    const cacheKey = `storage:${userId}:${provider}`

    // Checa cache
    const cached = await redis.get(cacheKey)
    if (cached) return { data: JSON.parse(cached), fromCache: true }

    //vai chama API do provedor
    const data = provider === "google"
        ? await getStorageGoogle(accessToken)
        : await getStorageDropbox(accessToken)

    // salva no Redis por 5 minutos
    await redis.set(cacheKey, JSON.stringify(data), "EX", 300)

    return { data, fromCache: false }
}
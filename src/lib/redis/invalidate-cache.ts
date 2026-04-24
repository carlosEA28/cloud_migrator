import {redis} from "@/lib/redis/redis";

export async function invalidateProviderCache(userId: string, provider: string) {
    await redis.del(`storage:${userId}:${provider}`)
}
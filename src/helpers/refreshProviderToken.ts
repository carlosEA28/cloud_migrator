import { prisma } from "@/lib/prisma";

export async function getValidToken(userId: string, providerId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, providerId },
    });

    if (!account || !account.accessToken) return null;

    return account.accessToken;
}
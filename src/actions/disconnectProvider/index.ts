"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

const providerKeyToDbMap: Record<string, string> = {
    "google-drive": "google",
    dropbox: "dropbox",
    "aws-s3": "aws",
    "azure-blob": "azure",
    "sftp-server": "sftp",
}

export async function disconnectProvider(providerKey: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) throw new Error("User not authenticated")

    const providerId = providerKeyToDbMap[providerKey]
    if (!providerId) throw new Error("Invalid provider")

    await prisma.account.deleteMany({
        where: {
            userId: session.user.id,
            providerId,
        },
    })

    await prisma.oAuthConnection.deleteMany({
        where: {
            userId: session.user.id,
            provider: providerId,
        },
    })

    return { success: true }
}
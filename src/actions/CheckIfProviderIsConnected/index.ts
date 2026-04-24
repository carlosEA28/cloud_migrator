"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getStorageDropbox } from "@/app/api/providers/dropbox"
import { getStorageGoogle } from "@/app/api/providers/googleDrive"

export async function checkProvidersStatus() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) throw new Error("User not authenticated")

    const targetProviders = ["google", "dropbox"];

    const providers = await Promise.all(
        targetProviders.map(async (providerId) => {
            const account = await prisma.account.findFirst({
                where: { userId: session.user.id, providerId },
            });

            const hasToken = account && account.accessToken && account.accessToken.length > 0;

            if (!hasToken || !account.accessToken) {
                return { provider: providerId, connected: false, data: null };
            }

            let data = null;
            try {
                if (providerId === "google") {
                    data = await getStorageGoogle(account.accessToken);
                } else if (providerId === "dropbox") {
                    data = await getStorageDropbox(account.accessToken);
                }
            } catch (error) {
                const err = error as { response?: { status?: number }, isAxiosError?: boolean }
                if (err.isAxiosError && (err.response?.status === 401 || err.response?.status === 403)) {
                } else {
                    console.error(`Error fetching ${providerId} data:`, error);
                }
            }

            return { provider: providerId, connected: hasToken, data };
        })
    );

    return providers;
}
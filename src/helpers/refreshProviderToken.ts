import axios from "axios";
import { prisma } from "@/lib/prisma";

export async function getValidToken(userId: string, providerId: string) {
    const account = await prisma.account.findFirst({
        where: { userId, providerId },
    });

    if (!account || !account.accessToken) return null;

    const isExpired = account.accessTokenExpiresAt && new Date() >= account.accessTokenExpiresAt;

    if (isExpired && account.refreshToken) {
        return await refreshToken(userId, providerId, account.refreshToken);
    }

    if (isExpired) {
        return null;
    }

    return account.accessToken;
}

async function refreshToken(userId: string, providerId: string, refreshToken: string) {
    if (!refreshToken) {
        return null;
    }
    
    try {
        if (providerId === "google") {
            return await refreshGoogleToken(userId, refreshToken);
        } else if (providerId === "dropbox") {
            return await refreshDropboxToken(userId, refreshToken);
        }
    } catch (error) {
        console.error(`Erro ao fazer refresh do token para ${providerId}:`, error);
        return null;
    }
    return null;
}

async function refreshGoogleToken(userId: string, refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refreshToken) {
        return null;
    }

    try {
        const response = await axios.post(
            "https://oauth2.googleapis.com/token",
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            })
        );

        const { access_token, expires_in } = response.data;

        await prisma.account.updateMany({
            where: { userId, providerId: "google" },
            data: {
                accessToken: access_token,
                accessTokenExpiresAt: new Date(Date.now() + (expires_in || 3600) * 1000),
            },
        });

        return access_token;
    } catch (error) {
        console.error("Erro ao fazer refresh do token Google:", error);
        return null;
    }
}

async function refreshDropboxToken(userId: string, refreshToken: string) {
    const clientId = process.env.DROPBOX_CLIENT_ID;
    const clientSecret = process.env.DROPBOX_CLIENT_SECRET;

    if (!clientId || !clientSecret || !refreshToken) {
        return null;
    }

    try {
        const response = await axios.post(
            "https://api.dropboxapi.com/oauth2/token",
            new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: "refresh_token",
            })
        );

        const { access_token, expires_in } = response.data;

        await prisma.account.updateMany({
            where: { userId, providerId: "dropbox" },
            data: {
                accessToken: access_token,
                accessTokenExpiresAt: new Date(Date.now() + (expires_in || 14400) * 1000),
            },
        });

        return access_token;
    } catch (error) {
        console.error("Erro ao fazer refresh do token Dropbox:", error);
        return null;
    }
}
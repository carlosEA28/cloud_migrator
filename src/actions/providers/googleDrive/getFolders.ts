"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getFoldersGoogle } from "@/app/api/providers/googleDrive"
import { getValidToken } from "@/helpers/refreshProviderToken"

export async function GetFolders() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    if (!session?.user) throw new Error("User not authenticated")

    const accessToken = await getValidToken(session.user.id, "google")

    if (!accessToken) {
        throw new Error("Google Drive not connected")
    }

    const folders = await getFoldersGoogle(accessToken)
    return folders
}

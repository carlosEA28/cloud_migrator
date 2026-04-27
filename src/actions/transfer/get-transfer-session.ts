"use server"

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getLatestTransferSessionSnapshot, getTransferSessionSnapshot } from "@/lib/transfers/session-query"
import type { TransferSessionSnapshot } from "@/lib/transfers/types"

export async function getTransferSession(
  sessionId: string
): Promise<TransferSessionSnapshot | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  return getTransferSessionSnapshot(session.user.id, sessionId)
}

export async function getLatestActiveTransferSession(): Promise<TransferSessionSnapshot | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  return getLatestTransferSessionSnapshot(session.user.id)
}

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getTransferSessionSnapshot } from "@/lib/transfers/session-query"

type RouteProps = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, { params }: RouteProps) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { sessionId } = await params
  const transferSession = await getTransferSessionSnapshot(session.user.id, sessionId)

  if (!transferSession) {
    return Response.json({ error: "Transfer session not found" }, { status: 404 })
  }

  return Response.json(transferSession)
}

import { notFound } from "next/navigation"

import { getTransferSession } from "@/actions/transfer/get-transfer-session"
import { TransferSessionBoard } from "@/app/dashboard/transfers/components/TransferSessionBoard"

type TransferSessionPageProps = {
  params: Promise<{ sessionId: string }>
}

export default async function TransferSessionPage({ params }: TransferSessionPageProps) {
  const { sessionId } = await params
  const session = await getTransferSession(sessionId)

  if (!session) {
    notFound()
  }

  return (
    <main className="space-y-8 p-8">
      <TransferSessionBoard initialSession={session} />
    </main>
  )
}

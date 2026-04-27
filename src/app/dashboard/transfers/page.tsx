import Link from "next/link"

import { getLatestActiveTransferSession } from "@/actions/transfer/get-transfer-session"
import { NoTransferCardComponent } from "@/app/dashboard/components/NoTransferCardComponent"
import { TransferSessionBoard } from "@/app/dashboard/transfers/components/TransferSessionBoard"
import { Button } from "@/components/ui/button"

export default async function TransfersPage() {
  const session = await getLatestActiveTransferSession()

  if (!session) {
    return (
      <main className="flex flex-1 items-center justify-center p-4">
        <NoTransferCardComponent
          title="No Active Transfers"
          description="Inicie uma nova migracao para visualizar o processo em tempo real aqui."
        />
      </main>
    )
  }

  return (
    <main className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Active Transfers</h1>
          <p className="text-sm text-[#64748B]">Monitoramento em tempo real da transferencia em andamento.</p>
        </div>
        <Link href={`/dashboard/transfers/${session.id}`}>
          <Button className="bg-[#00FFC8] text-[#0D0F1A] hover:bg-[#00e8bb]">Open Full Session</Button>
        </Link>
      </div>

      <TransferSessionBoard initialSession={session} compact />
    </main>
  )
}
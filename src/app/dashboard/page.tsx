import { getLatestActiveTransferSession } from "@/actions/transfer/get-transfer-session"
import { NoTransferCardComponent } from "@/app/dashboard/components/NoTransferCardComponent"
import { TransferSessionBoard } from "@/app/dashboard/transfers/components/TransferSessionBoard"

export default async function DashboardPage() {
  const session = await getLatestActiveTransferSession()

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <NoTransferCardComponent />
      </div>
    )
  }

  return (
    <main className="space-y-8 p-8">
      <TransferSessionBoard initialSession={session} compact />
    </main>
  )
}

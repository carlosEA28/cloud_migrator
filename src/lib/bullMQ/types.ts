import type { ProviderType } from "@/lib/cloud-adapters/types"

export type TransferJobData = {
  fileTransferId: string
  sessionId: string
  userId: string
  originProvider: ProviderType
  destinationProvider: ProviderType
}

export type TransferFileStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED"

export type TransferSessionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED"

export type TransferFileSnapshot = {
  id: string
  fileName: string
  status: TransferFileStatus
  fileSizeBytes: number
  retryCount: number
  maxRetries: number
  lastError: string | null
  completedAt: string | null
}

export type TransferSessionSnapshot = {
  id: string
  status: TransferSessionStatus
  sourceProvider: string
  destinationProvider: string
  startedAt: string | null
  completedAt: string | null
  totalFiles: number
  completedFiles: number
  failedFiles: number
  runningFiles: number
  pendingFiles: number
  totalBytes: number
  transferredBytes: number
  progressPercent: number
  speedBytesPerSecond: number | null
  etaSeconds: number | null
  files: TransferFileSnapshot[]
}

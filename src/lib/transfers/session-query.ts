import { prisma } from "@/lib/prisma"
import type { TransferSessionSnapshot } from "@/lib/transfers/types"

type SessionWithFiles = Awaited<ReturnType<typeof getRawTransferSession>>

const fileSelect = {
  id: true,
  fileName: true,
  fileSizeBytes: true,
  status: true,
  retryCount: true,
  maxRetries: true,
  lastError: true,
  completedAt: true,
} as const

const sessionSelect = {
  id: true,
  status: true,
  totalFiles: true,
  completedFiles: true,
  failedFiles: true,
  totalBytes: true,
  transferredBytes: true,
  startedAt: true,
  completedAt: true,
  sourceConnection: {
    select: {
      provider: true,
    },
  },
  destConnection: {
    select: {
      provider: true,
    },
  },
  files: {
    select: fileSelect,
    orderBy: {
      fileName: "asc" as const,
    },
  },
} as const

async function getRawTransferSession(userId: string, sessionId: string) {
  return prisma.transferSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    select: sessionSelect,
  })
}

function toNumber(value: bigint): number {
  const converted = Number(value)
  return Number.isFinite(converted) ? converted : Number.MAX_SAFE_INTEGER
}

function deriveMetrics(session: NonNullable<SessionWithFiles>) {
  const files = session.files.map((file) => ({
    id: file.id,
    fileName: file.fileName,
    status: file.status,
    fileSizeBytes: toNumber(file.fileSizeBytes),
    retryCount: file.retryCount,
    maxRetries: file.maxRetries,
    lastError: file.lastError,
    completedAt: file.completedAt?.toISOString() ?? null,
  }))

  const completedBytes = files
    .filter((file) => file.status === "COMPLETED")
    .reduce((total, file) => total + file.fileSizeBytes, 0)

  const totalBytes = toNumber(session.totalBytes)
  const transferredBytes = Math.max(toNumber(session.transferredBytes), completedBytes)

  const elapsedStart = session.startedAt?.getTime() ?? Date.now()
  const elapsedEnd = session.completedAt?.getTime() ?? Date.now()
  const elapsedSeconds = Math.max(1, (elapsedEnd - elapsedStart) / 1000)
  const speedBytesPerSecond = transferredBytes > 0 ? transferredBytes / elapsedSeconds : null

  const remainingBytes = Math.max(totalBytes - transferredBytes, 0)
  const etaSeconds =
    speedBytesPerSecond && speedBytesPerSecond > 0 && remainingBytes > 0
      ? remainingBytes / speedBytesPerSecond
      : null

  const runningFiles = files.filter((file) => file.status === "RUNNING").length
  const pendingFiles = files.filter((file) => file.status === "PENDING").length

  const progressPercent =
    totalBytes > 0
      ? Math.min((transferredBytes / totalBytes) * 100, 100)
      : session.totalFiles > 0
        ? Math.min((session.completedFiles / session.totalFiles) * 100, 100)
        : 0

  return {
    id: session.id,
    status: session.status,
    sourceProvider: session.sourceConnection.provider,
    destinationProvider: session.destConnection.provider,
    startedAt: session.startedAt?.toISOString() ?? null,
    completedAt: session.completedAt?.toISOString() ?? null,
    totalFiles: session.totalFiles,
    completedFiles: session.completedFiles,
    failedFiles: session.failedFiles,
    runningFiles,
    pendingFiles,
    totalBytes,
    transferredBytes,
    progressPercent,
    speedBytesPerSecond,
    etaSeconds,
    files,
  } satisfies TransferSessionSnapshot
}

export async function getTransferSessionSnapshot(
  userId: string,
  sessionId: string
): Promise<TransferSessionSnapshot | null> {
  const session = await getRawTransferSession(userId, sessionId)

  if (!session) {
    return null
  }

  return deriveMetrics(session)
}

export async function getLatestTransferSessionSnapshot(
  userId: string
): Promise<TransferSessionSnapshot | null> {
  const session = await prisma.transferSession.findFirst({
    where: {
      userId,
      status: {
        in: ["PENDING", "RUNNING"],
      },
    },
    orderBy: {
      startedAt: "desc",
    },
    select: sessionSelect,
  })

  if (!session) {
    return null
  }

  return deriveMetrics(session)
}

import { Worker } from "bullmq"
import { redis } from "@/lib/redis/redis"
import { prisma } from "@/lib/prisma"
import type { TransferJobData } from "@/lib/bullMQ/types"
import { getValidToken } from "@/helpers/refreshProviderToken"
import type { ProviderType } from "@/lib/cloud-adapters/types"

async function updateSessionProgress(sessionId: string) {
  const [stats, files, session] = await Promise.all([
    prisma.fileTransfer.groupBy({
      by: ["status"],
      where: { sessionId },
      _count: {
        status: true,
      },
      _sum: {
        fileSizeBytes: true,
      },
    }),
    prisma.fileTransfer.findMany({
      where: {
        sessionId,
        status: "COMPLETED",
      },
      select: {
        fileSizeBytes: true,
      },
    }),
    prisma.transferSession.findUnique({
      where: { id: sessionId },
      select: {
        totalFiles: true,
      },
    }),
  ])

  if (!session) {
    return
  }

  const completedFiles = stats.find((item) => item.status === "COMPLETED")?._count.status ?? 0
  const failedFiles = stats.find((item) => item.status === "FAILED")?._count.status ?? 0

  const transferredBytes = files.reduce((total, file) => total + file.fileSizeBytes, BigInt(0))

  const processedCount = stats.reduce((total, item) => {
    const isProcessedStatus =
      item.status === "COMPLETED" || item.status === "FAILED" || item.status === "SKIPPED"

    return total + (isProcessedStatus ? item._count.status : 0)
  }, 0)

  let status: "RUNNING" | "COMPLETED" | "FAILED" = "RUNNING"
  let completedAt: Date | null = null

  if (processedCount >= session.totalFiles) {
    status = failedFiles > 0 ? "FAILED" : "COMPLETED"
    completedAt = new Date()
  }

  await prisma.transferSession.update({
    where: { id: sessionId },
    data: {
      completedFiles,
      failedFiles,
      transferredBytes,
      status,
      completedAt,
    },
  })
}

async function downloadFromGoogle(accessToken: string, sourceFileId: string) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(sourceFileId)}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`Google download failed (${response.status}): ${errorBody}`)
  }

  return {
    content: await response.arrayBuffer(),
    mimeType: response.headers.get("content-type"),
  }
}

async function uploadToGoogle(
  accessToken: string,
  fileName: string,
  content: ArrayBuffer,
  mimeType: string | null
) {
  const metadataBlob = new Blob(
    [JSON.stringify({
      name: fileName,
    })],
    { type: "application/json" }
  )

  const fileBlob = new Blob([content], {
    type: mimeType || "application/octet-stream",
  })

  const formData = new FormData()
  formData.append("metadata", metadataBlob)
  formData.append("file", fileBlob, fileName)

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`Google upload failed (${response.status}): ${errorBody}`)
  }
}

async function downloadFromDropbox(accessToken: string, sourceFileId: string) {
  const response = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({
        path: sourceFileId,
      }),
    },
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`Dropbox download failed (${response.status}): ${errorBody}`)
  }

  return {
    content: await response.arrayBuffer(),
    mimeType: response.headers.get("content-type"),
  }
}

async function uploadToDropbox(accessToken: string, fileName: string, content: ArrayBuffer) {
  const response = await fetch("https://content.dropboxapi.com/2/files/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
      "Dropbox-API-Arg": JSON.stringify({
        path: `/${fileName}`,
        mode: "add",
        autorename: true,
        mute: false,
      }),
    },
    body: new Uint8Array(content),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "")
    throw new Error(`Dropbox upload failed (${response.status}): ${errorBody}`)
  }
}

async function transferAcrossProviders(
  originProvider: ProviderType,
  destinationProvider: ProviderType,
  sourceAccessToken: string,
  destinationAccessToken: string,
  sourceFileId: string,
  fileName: string,
  mimeType: string | null
) {
  let payload: { content: ArrayBuffer; mimeType: string | null }

  if (originProvider === "google") {
    payload = await downloadFromGoogle(sourceAccessToken, sourceFileId)
  } else {
    payload = await downloadFromDropbox(sourceAccessToken, sourceFileId)
  }

  if (destinationProvider === "google") {
    await uploadToGoogle(destinationAccessToken, fileName, payload.content, mimeType ?? payload.mimeType)
    return
  }

  await uploadToDropbox(destinationAccessToken, fileName, payload.content)
}

const globalForTransferWorker = globalThis as unknown as {
  transferWorker?: Worker<TransferJobData>
}

const hasExistingWorker = !!globalForTransferWorker.transferWorker

export const transferWorker =
  globalForTransferWorker.transferWorker ??
  new Worker<TransferJobData>(
    "file-transfer",
    async (job) => {
      const { fileTransferId, sessionId, userId, originProvider, destinationProvider } = job.data

      try {
        const [sourceAccessToken, destinationAccessToken, fileTransfer] = await Promise.all([
          getValidToken(userId, originProvider),
          getValidToken(userId, destinationProvider),
          prisma.fileTransfer.findUnique({
            where: { id: fileTransferId },
            select: {
              sourceFileId: true,
              fileName: true,
              mimeType: true,
            },
          }),
        ])

        if (!sourceAccessToken) {
          throw new Error(`Missing source token for provider ${originProvider}`)
        }

        if (!destinationAccessToken) {
          throw new Error(`Missing destination token for provider ${destinationProvider}`)
        }

        if (!fileTransfer) {
          throw new Error(`File transfer ${fileTransferId} not found`)
        }

        await prisma.fileTransfer.update({
          where: { id: fileTransferId },
          data: {
            status: "RUNNING",
          },
        })

        await updateSessionProgress(sessionId)

      await transferAcrossProviders(
        originProvider,
        destinationProvider,
        sourceAccessToken,
        destinationAccessToken,
        fileTransfer.sourceFileId,
        fileTransfer.fileName,
        fileTransfer.mimeType ?? null
      )

      await prisma.fileTransfer.update({
        where: { id: fileTransferId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          lastError: null,
        },
      })

      await prisma.transferLog.create({
        data: {
          fileTransferId,
          level: "INFO",
          message: "File transfer completed",
          occurredAt: new Date(),
        },
      })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unexpected transfer error"

        try {
          await prisma.fileTransfer.update({
            where: { id: fileTransferId },
            data: {
              status: "FAILED",
              retryCount: {
                increment: 1,
              },
              lastError: errorMessage,
            },
          })

          await prisma.transferLog.create({
            data: {
              fileTransferId,
              level: "ERROR",
              message: errorMessage,
              occurredAt: new Date(),
            },
          })
        } catch (dbError) {
          console.error("Failed to persist transfer error state", dbError)
        }

        throw error
      } finally {
        await updateSessionProgress(sessionId)
      }
    },
    {
      connection: redis,
      concurrency: 5,
    }
  )

if (!hasExistingWorker) {
  transferWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`)
  })

  transferWorker.on("failed", (job, error) => {
    console.error(`Job ${job?.id} failed:`, error.message)
  })
}

if (process.env.NODE_ENV !== "production") {
  globalForTransferWorker.transferWorker = transferWorker
}

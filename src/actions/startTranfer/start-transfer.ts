"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CloudItem, ProviderType } from "@/lib/cloud-adapters/types"
import { transferQueue } from "@/lib/bullMQ/queue"

interface StartTransferInput {
  originProvider: ProviderType
  destinationProvider: ProviderType
  selectedFiles: CloudItem[]
}

function normalizeSelectedFiles(files: CloudItem[]): CloudItem[] {
  const dedupedFiles = new Map<string, CloudItem>()

  for (const file of files) {
    if (file.type !== "file") {
      continue
    }

    dedupedFiles.set(file.id, file)
  }

  return Array.from(dedupedFiles.values())
}

export async function startTransfer({
  originProvider,
  destinationProvider,
  selectedFiles,
}: StartTransferInput) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  if (originProvider === destinationProvider) {
    throw new Error("Origin and destination providers must be different")
  }

  const normalizedFiles = normalizeSelectedFiles(selectedFiles)
  if (normalizedFiles.length === 0) {
    throw new Error("Select at least one file to start migration")
  }

  const userId = session.user.id

  const [sourceConn, destConn] = await Promise.all([
    prisma.oAuthConnection.findFirst({
      where: { userId, provider: originProvider },
    }),
    prisma.oAuthConnection.findFirst({
      where: { userId, provider: destinationProvider },
    }),
  ])

  if (!sourceConn) {
    throw new Error(`${originProvider} not connected`)
  }

  if (!destConn) {
    throw new Error(`${destinationProvider} not connected`)
  }

  const totalBytes = normalizedFiles.reduce((acc, file) => acc + (file.size ?? 0), 0)

  const transferSession = await prisma.$transaction(async (tx) => {
    const newSession = await tx.transferSession.create({
      data: {
        userId,
        sourceConnId: sourceConn.id,
        destConnId: destConn.id,
        status: "PENDING",
        totalFiles: normalizedFiles.length,
        completedFiles: 0,
        failedFiles: 0,
        totalBytes: BigInt(totalBytes),
        transferredBytes: BigInt(0),
        startedAt: new Date(),
      },
    })

    await tx.fileTransfer.createMany({
      data: normalizedFiles.map((file) => ({
        sessionId: newSession.id,
        sourceFileId: file.id,
        sourcePath: file.parentId ?? "/",
        fileName: file.name,
        fileSizeBytes: BigInt(file.size ?? 0),
        mimeType: file.mimeType,
        status: "PENDING",
      })),
    })

    return newSession
  })

  const fileTransfers = await prisma.fileTransfer.findMany({
    where: { sessionId: transferSession.id },
    select: { id: true },
  })

  await Promise.all(
    fileTransfers.map((fileTransfer) =>
      transferQueue.add(
        "transfer-file",
        {
          fileTransferId: fileTransfer.id,
          sessionId: transferSession.id,
          userId,
          originProvider,
          destinationProvider,
        },
        { jobId: fileTransfer.id }
      )
    )
  )

  await Promise.all(
    fileTransfers.map((fileTransfer) =>
      prisma.fileTransfer.update({
        where: { id: fileTransfer.id },
        data: { bullJobId: fileTransfer.id },
      })
    )
  )

  await prisma.transferSession.update({
    where: { id: transferSession.id },
    data: {
      status: "RUNNING",
    },
  })

  redirect(`/dashboard/transfers/${transferSession.id}`)
}

"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  TriangleAlert,
  XCircle,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatBytes, formatEta, formatProviderName, formatRate } from "@/lib/transfers/format"
import type {
  TransferFileSnapshot,
  TransferFileStatus,
  TransferSessionSnapshot,
  TransferSessionStatus,
} from "@/lib/transfers/types"

const TERMINAL_STATUSES: TransferSessionStatus[] = ["COMPLETED", "FAILED", "CANCELLED"]

const sessionStatusMeta: Record<
  TransferSessionStatus,
  { label: string; className: string; icon: typeof Loader2 }
> = {
  PENDING: {
    label: "Queued",
    className: "text-[#F59E0B]",
    icon: Clock3,
  },
  RUNNING: {
    label: "Running",
    className: "text-[#00FFC8]",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Completed",
    className: "text-[#00FFC8]",
    icon: CheckCircle2,
  },
  FAILED: {
    label: "Failed",
    className: "text-[#EF4444]",
    icon: XCircle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "text-[#64748B]",
    icon: TriangleAlert,
  },
}

const fileStatusMeta: Record<TransferFileStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Queued",
    className: "text-[#F59E0B]",
  },
  RUNNING: {
    label: "Transferring",
    className: "text-[#00FFC8]",
  },
  COMPLETED: {
    label: "Completed",
    className: "text-[#00FFC8]",
  },
  FAILED: {
    label: "Failed",
    className: "text-[#EF4444]",
  },
  SKIPPED: {
    label: "Skipped",
    className: "text-[#64748B]",
  },
}

interface TransferSessionBoardProps {
  initialSession: TransferSessionSnapshot
  compact?: boolean
}

function SessionFileRow({ file }: { file: TransferFileSnapshot }) {
  const status = fileStatusMeta[file.status]

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 rounded border border-[#1F1F2E] bg-[#0F1118] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm text-white">{file.fileName}</p>
        {file.lastError && <p className="truncate text-xs text-[#EF4444]">{file.lastError}</p>}
      </div>

      <p className="text-xs text-[#94A3B8]">{formatBytes(file.fileSizeBytes)}</p>
      <p className={cn("text-xs font-semibold uppercase tracking-wide", status.className)}>{status.label}</p>
    </div>
  )
}

export function TransferSessionBoard({ initialSession, compact = false }: TransferSessionBoardProps) {
  const [session, setSession] = useState(initialSession)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    if (TERMINAL_STATUSES.includes(session.status)) {
      return
    }

    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const pollSession = async () => {
      setIsRefreshing(true)
      let nextStatus: TransferSessionStatus | null = null

      try {
        const response = await fetch(`/api/transfers/${session.id}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Falha ao atualizar sessao (${response.status})`)
        }

        const payload = (await response.json()) as TransferSessionSnapshot
        nextStatus = payload.status

        if (!cancelled) {
          setSession(payload)
          setSyncError(null)
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "Erro ao atualizar dados")
        }
      } finally {
        if (!cancelled) {
          setIsRefreshing(false)

          if (!nextStatus || !TERMINAL_STATUSES.includes(nextStatus)) {
            timeoutId = setTimeout(pollSession, 2000)
          }
        }
      }
    }

    void pollSession()

    return () => {
      cancelled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [session.id, session.status])

  const status = sessionStatusMeta[session.status]
  const StatusIcon = status.icon

  const files = useMemo(
    () => (compact ? session.files.slice(0, 6) : session.files),
    [compact, session.files]
  )

  return (
    <section className="space-y-6">
      <Card className="border border-[#1F1F2E] bg-[#111118] p-6 shadow-[0_0_0_1px_rgba(0,255,200,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#64748B]">Active Transfer</p>
            <h2 className="mt-2 text-3xl font-bold text-white">{session.id.slice(0, 8)}...</h2>
            <div className="mt-3 flex items-center gap-2 text-sm text-[#94A3B8]">
              <span>{formatProviderName(session.sourceProvider)}</span>
              <ArrowRight className="size-4" />
              <span>{formatProviderName(session.destinationProvider)}</span>
            </div>
          </div>

          <div className="text-right">
            <div className={cn("inline-flex items-center gap-2 text-sm font-semibold", status.className)}>
              <StatusIcon className={cn("size-4", session.status === "RUNNING" && "animate-spin")} />
              <span>{status.label}</span>
            </div>
            <p className="mt-2 text-xs text-[#64748B]">Session ID: {session.id}</p>
          </div>
        </div>

        <Separator className="my-5 bg-[#1F1F2E]" />

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#64748B]">Transfer Progress</span>
            <span className="font-semibold text-white">{session.progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#1F1F2E]">
            <div
              className="h-full bg-gradient-to-r from-[#00FFC8] to-[#0EA5E9] transition-all duration-500"
              style={{ width: `${Math.min(session.progressPercent, 100)}%` }}
            />
          </div>
          <div className="grid gap-3 pt-2 text-xs text-[#94A3B8] sm:grid-cols-3">
            <p>{session.completedFiles}/{session.totalFiles} files</p>
            <p>{formatBytes(session.transferredBytes)} / {formatBytes(session.totalBytes)}</p>
            <p>{session.failedFiles} failed</p>
          </div>
        </div>

        <Separator className="my-5 bg-[#1F1F2E]" />

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded border border-[#1F1F2E] bg-[#0F1118] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-[#64748B]">Throughput</p>
            <p className="mt-1 font-semibold text-white">{formatRate(session.speedBytesPerSecond)}</p>
          </div>
          <div className="rounded border border-[#1F1F2E] bg-[#0F1118] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-[#64748B]">ETA</p>
            <p className="mt-1 font-semibold text-white">{formatEta(session.etaSeconds)}</p>
          </div>
          <div className="rounded border border-[#1F1F2E] bg-[#0F1118] px-3 py-2">
            <p className="text-xs uppercase tracking-wide text-[#64748B]">Queue</p>
            <p className="mt-1 font-semibold text-white">{session.pendingFiles} pending / {session.runningFiles} running</p>
          </div>
        </div>

        {syncError && <p className="mt-4 text-xs text-[#EF4444]">{syncError}</p>}
        {isRefreshing && !syncError && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-[#64748B]">
            <RefreshCw className="size-3 animate-spin" />
            Syncing latest transfer state...
          </div>
        )}
      </Card>

      <Card className="border border-[#1F1F2E] bg-[#111118] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">File Queue</h3>
          <p className="text-xs uppercase tracking-wider text-[#64748B]">{session.files.length} items</p>
        </div>

        <div className="space-y-2">
          {files.map((file) => (
            <SessionFileRow key={file.id} file={file} />
          ))}
        </div>

        {compact && session.files.length > files.length && (
          <p className="mt-3 text-xs text-[#64748B]">Showing {files.length} of {session.files.length} files</p>
        )}
      </Card>
    </section>
  )
}

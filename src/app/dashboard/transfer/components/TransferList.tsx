import { MoreVertical, Pause, Play, Trash2 } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface TransferItem {
  id: string
  source: string
  destination: string
  status: "completed" | "in_progress" | "paused" | "failed"
  progress: number
  filesTransferred: number
  totalFiles: number
  createdAt: string
}

interface TransferListProps {
  transfers: TransferItem[]
}

const statusMap = {
  completed: { label: "Completed", color: "text-[#00FFC8]" },
  in_progress: { label: "In Progress", color: "text-[#7B5CFF]" },
  paused: { label: "Paused", color: "text-[#F59E0B]" },
  failed: { label: "Failed", color: "text-[#EF4444]" },
}

export function TransferList({ transfers }: TransferListProps) {
  return (
    <div className="space-y-4">
      {transfers.map((transfer) => (
        <Card
          key={transfer.id}
          className="border-[#1F1F2E] bg-[#111118] p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#64748B]">{transfer.source}</span>
                <span className="text-[#64748B]">→</span>
                <span className="text-sm text-white">{transfer.destination}</span>
              </div>

              <span className={`text-xs ${statusMap[transfer.status].color}`}>
                {statusMap[transfer.status].label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {transfer.status === "in_progress" && (
                <Button size="icon" variant="ghost" className="size-8 text-[#F59E0B] hover:bg-[#F59E0B]/10">
                  <Pause className="size-4" />
                </Button>
              )}

              {transfer.status === "paused" && (
                <Button size="icon" variant="ghost" className="size-8 text-[#00FFC8] hover:bg-[#00FFC8]/10">
                  <Play className="size-4" />
                </Button>
              )}

              <Button size="icon" variant="ghost" className="size-8 text-[#64748B] hover:text-[#EF4444]">
                <Trash2 className="size-4" />
              </Button>

              <Button size="icon" variant="ghost" className="size-8 text-[#64748B]">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-3 bg-[#1F1F2E]" />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#64748B]">Progress</span>
              <span className="text-white">{transfer.progress}%</span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-[#1F1F2E]">
              <div
                className="h-full bg-[#7B5CFF] transition-all"
                style={{ width: `${transfer.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#64748B]">
                {transfer.filesTransferred} of {transfer.totalFiles} files
              </span>
              <span className="text-[#64748B]">{transfer.createdAt}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
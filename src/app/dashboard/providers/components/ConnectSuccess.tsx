import { CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { type ProviderKey } from "@/app/dashboard/providers/constants/providerCopy"

const titleMap: Record<ProviderKey, string> = {
  "aws-s3": "AWS S3",
  "google-drive": "Google Drive",
  "azure-blob": "Azure Blob",
  dropbox: "Dropbox",
  "sftp-server": "SFTP Server",
}

interface ConnectSuccessProps {
  providerKey: ProviderKey
}

export function ConnectSuccess({ providerKey }: ConnectSuccessProps) {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-[#0D0F1A] p-8">
      <Card className="w-full max-w-[400px] border-[#1F1F2E] bg-[#111118] p-8 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00FFC81A]">
            <CheckCircle2 className="size-8 text-[#00FFC8]" />
          </div>

          <h1 className="mb-2 text-2xl font-semibold">Connected!</h1>
          <p className="mb-6 text-[#94A3B8]">
            {titleMap[providerKey]} has been successfully connected to your account.
          </p>

          <div className="flex gap-3">
            <Link href="/dashboard/providers">
              <Button
                variant="outline"
                className="rounded-none border-[#1F1F2E] bg-transparent text-[#94A3B8] hover:bg-[#1F1F2E] hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Back to Providers
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}
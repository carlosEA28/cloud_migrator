import { Cloud, KeyRound } from "lucide-react"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { providerCopyMap, type ProviderKey } from "@/app/dashboard/providers/constants/providerCopy"
import {connectProvider} from "@/actions/connectProvider"
import { ConnectSuccess } from "../components/ConnectSuccess";

type ConnectPageProps = {
  params: Promise<{ slug: string }> | { slug: string }
  searchParams: Promise<{ success?: string }>
}

const titleMap: Record<ProviderKey, string> = {
  "aws-s3": "AWS S3",
  "google-drive": "Google Drive",
  "azure-blob": "Azure Blob",
  dropbox: "Dropbox",
  "sftp-server": "SFTP Server",
}

function isProviderKey(value: string): value is ProviderKey {
  return value in providerCopyMap
}

async function Connect({ params, searchParams }: ConnectPageProps) {
  const { slug } = await Promise.resolve(params)
  const { success } = await Promise.resolve(searchParams)

  if (!isProviderKey(slug)) {
    notFound()
  }

  if (success === "true") {
    return <ConnectSuccess providerKey={slug} />
  }

  const connectSelectedProvider = connectProvider.bind(null, slug)

  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-[#0D0F1A] p-8">
      <section className="flex h-[380px] w-full max-w-[400px] flex-col items-center justify-center border border-[#1F1F2E] bg-[#111118] p-6 text-white shadow-[0_0_0_1px_rgba(0,255,200,0.08)]">
        <div className="w-full max-w-[290px]">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-[#1F1F2E] bg-[#16161E] text-[#00FFC8]">
            <Cloud className="size-5" />
          </div>

          <h1 className="mb-6 text-center text-2xl font-semibold">Connect {titleMap[slug]}</h1>

          <form action={connectSelectedProvider}>
            <Button
              type="submit"
              className="h-10 w-full rounded-none border-0 bg-[#00FFC8] text-[#0D0F1A] hover:bg-[#00FFC8]/90"
            >
              <KeyRound className="size-4" />
              CONNECT VIA OAuth
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default Connect

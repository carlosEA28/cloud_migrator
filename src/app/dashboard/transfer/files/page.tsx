import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, FolderOpen, ArrowRight } from "lucide-react"
import googleDrive from "../../../../../public/GoogleDriveLogo.svg"
import { GetFolders } from "@/actions/providers/googleDrive/getFolders"

const titleMap: Record<string, string> = {
  "google-drive": "Google Drive",
  dropbox: "Dropbox",
}

interface FilePageProps {
  searchParams: Promise<{ source?: string }>
}

export default async function FilePage({ searchParams }: FilePageProps) {
  const { source } = await Promise.resolve(searchParams)
  const sourceName = titleMap[source || ""] || "Select Source"

  const folders = await GetFolders()

  return (
    <main className="space-y-8 p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/transfer">
          <Button variant="ghost" size="icon" className="text-[#64748B] hover:text-white">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-white">Select Files</h1>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-[#7B5CFF] bg-[#7B5CFF]/10 p-4">
        <Image src={googleDrive} alt={sourceName} width={40} height={40} />
        <div>
          <p className="text-xs text-[#7B5CFF]">SOURCE</p>
          <p className="font-medium text-white">{sourceName}</p>
        </div>
        <ArrowRight className="ml-auto size-5 text-[#7B5CFF]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(folders || []).map((folder) => (
          <button key={folder.id} type="button" className="w-full text-left">
            <Card className="cursor-pointer border border-[#1F1F2E] bg-[#111118] p-4 transition-all hover:border-[#7B5CFF]">
              <div className="flex items-center gap-3">
                <FolderOpen className="size-8 text-[#7B5CFF]" />
                <div>
                  <p className="font-medium text-white">{folder.name}</p>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </main>
  )
}
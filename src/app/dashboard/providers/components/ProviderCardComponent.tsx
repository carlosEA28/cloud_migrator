"use client"

import Image, { type StaticImageData } from "next/image"
import { Circle, EyeOff, MoreVertical, Plug } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { providerCopyMap, type ProviderKey } from "@/app/dashboard/providers/constants/providerCopy"
import { checkProvidersStatus } from "@/actions/CheckIfProviderIsConnected"
import { disconnectProvider } from "@/actions/disconnectProvider"
import { useEffect, useState } from "react"

const providerKeyToDbMap: Record<string, string> = {
    "google-drive": "google",
    dropbox: "dropbox",
    "aws-s3": "aws",
    "azure-blob": "azure",
    "sftp-server": "sftp",
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

type ProviderStatus = "connected" | "disconnected"

interface ProviderData {
    account?: string
    authType?: string
    storageUsed?: string
}

interface ProviderCardComponentProps {
    providerKey: ProviderKey
    title: string
    logo: string | StaticImageData
    imageAlt: string
}

const ProviderCardComponent = ({
                                    providerKey,
                                    title,
                                    logo,
                                    imageAlt,
                                }: ProviderCardComponentProps) => {
    const router = useRouter()
    const [status, setStatus] = useState<ProviderStatus>("disconnected")
    const [providerData, setProviderData] = useState<ProviderData>({})
    const [isLoading, setIsLoading] = useState(true)
    const copy = providerCopyMap[providerKey]

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const providers = await checkProvidersStatus()
                const dbProviderKey = providerKeyToDbMap[providerKey]
                const data = providers.find(p => p.provider === dbProviderKey)
                if (data?.connected) {
                    setStatus("connected")
                    const providerInfo = data.data
                    if (providerInfo) {
                        if (providerKey === "google-drive" && "user" in providerInfo) {
                            const googleData = providerInfo as { user: { emailAddress?: string }; storageQuota: { usage?: string } }
                            setProviderData({
                                account: googleData.user?.emailAddress,
                                authType: "OAuth 2.0",
                                storageUsed: formatBytes(parseInt(googleData.storageQuota?.usage || "0")),
                            })
                        } else if (providerKey === "dropbox" && "user" in providerInfo) {
                            const dropboxData = providerInfo as { user: { email?: string }; storage: { used?: number; allocated?: number } }
                            setProviderData({
                                account: dropboxData.user?.email,
                                authType: "OAuth 2.0",
                                storageUsed: formatBytes(dropboxData.storage?.used || 0),
                            })
                        }
                    } else {
                        setProviderData({ authType: "OAuth 2.0" })
                    }
                }
            } catch (error) {
                console.error("Error:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchStatus()
    }, [providerKey])

    const isConnected = status === "connected"

    if (isLoading) {
        return (
            <Card className="w-90 rounded-sm border border-[#1F1F2E] bg-[#111118] p-6 text-white shadow-none">
                <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#7B5CFF] border-t-transparent" />
                </div>
            </Card>
        )
    }

    const handlePrimaryAction = () => {
        if (!isConnected) {
            router.push(`/dashboard/providers/${providerKey}`)
            return
        }
    }

    const handleDisconnect = async () => {
        await disconnectProvider(providerKey)
        setStatus("disconnected")
        setProviderData({})
    }

    return (
        <Card className="w-90 rounded-sm border border-[#1F1F2E] bg-[#111118] p-6 text-white shadow-none">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <Image src={logo} alt={imageAlt} width={40} height={40} />
                    <div className="space-y-2">
                        <h3 className="text-[32px]/[1] font-semibold tracking-tight">{title}</h3>

                        <div
                            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] uppercase tracking-wide ${
                                isConnected
                                    ? "border-[#00FFC833] bg-[#00FFC81A] text-[#00FFC8]"
                                    : "border-[#64748B33] bg-[#64748B1A] text-[#94A3B8]"
                            }`}
                        >
                            <Circle className="size-2 fill-current" />
                            {isConnected ? "Connected" : "Disconnected"}
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    className="rounded-sm p-1 text-[#64748B] transition-colors hover:text-white"
                    aria-label="More options"
                >
                    <MoreVertical className="size-4" />
                </button>
            </div>

            {isConnected ? (
                <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Account:</span>
                        <span className="text-white">{providerData.account ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Auth Type:</span>
                        <span className="text-white">{providerData.authType ?? "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[#94A3B8]">Storage used:</span>
                        <span className="text-[#00FFC8]">{providerData.storageUsed ?? "-"}</span>
                    </div>
                </div>
            ) : (
                <p className="mt-5 min-h-[78px] text-sm leading-relaxed text-[#64748B]">
                    {copy.disconnectedDescription}
                </p>
            )}

            <Separator className="my-5 bg-[#1F1F2E]" />

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={handlePrimaryAction}
                    className="h-10 flex-1 rounded-none border-[#7B5CFF] bg-transparent text-[#7B5CFF] hover:bg-[#7B5CFF]/10 hover:text-[#7B5CFF]"
                >
                    {isConnected ? "MANAGE" : copy.disconnectedActionLabel}
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-none border-[#1F1F2E] bg-transparent text-[#64748B] hover:bg-[#1F1F2E] hover:text-white"
                    aria-label={isConnected ? "Hide provider" : "Connect provider"}
                    onClick={handleDisconnect}
                >
                    {isConnected ? <EyeOff className="size-4" /> : <Plug className="size-4" />}
                </Button>
            </div>
        </Card>
    )
}

export default ProviderCardComponent
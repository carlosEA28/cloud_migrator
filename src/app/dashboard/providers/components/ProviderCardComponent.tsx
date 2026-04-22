import Image from "next/image"
import { MoreVertical, Circle, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type ProviderStatus = "connected" | "disconnected"

interface ProviderCardComponentProps {
    title: string
    account: string
    authType: string
    storageUsed: string
    status?: ProviderStatus
    logo: string
    imageAlt: string
}

const ProviderCardComponent = ({
                                   title,
                                   account,
                                   authType,
                                   storageUsed,
                                   status = "connected",
                                   logo,
                                   imageAlt,
                               }: ProviderCardComponentProps) => {
    const isConnected = status === "disconnected"

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
                    aria-label="Mais opcoes"
                >
                    <MoreVertical className="size-4" />
                </button>
            </div>

            <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Account:</span>
                    <span className="text-white">{account}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Auth Type:</span>
                    <span className="text-white">{authType}</span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">Storage used:</span>
                    <span className="text-[#00FFC8]">{storageUsed}</span>
                </div>
            </div>

            <Separator className="my-5 bg-[#1F1F2E]" />

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    className="h-10 flex-1 rounded-none border-[#7B5CFF] bg-transparent text-[#7B5CFF] hover:bg-[#7B5CFF]/10 hover:text-[#7B5CFF]"
                >
                    MANAGE
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-none border-[#1F1F2E] bg-transparent text-[#64748B] hover:bg-[#1F1F2E] hover:text-white"
                    aria-label="Ocultar"
                >
                    <EyeOff className="size-4" />
                </Button>
            </div>
        </Card>
    )
}

export default ProviderCardComponent

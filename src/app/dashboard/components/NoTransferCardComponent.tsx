"use client"

import { CloudOff, PlusCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NoTransferCardComponentProps {
    title?: string
    description?: string
}

export function NoTransferCardComponent({
                                            title = "System Idle",
                                            description = "No active transfer pipelines detected. Initiate a new migration stream to begin routing data.",
                                        }: NoTransferCardComponentProps) {
    return (
        <Card className="max-w-md w-full bg-[#1c1c24]/50 border-[#2d2d3d] shadow-2xl backdrop-blur-sm">
            <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="size-20 rounded-2xl border-2 border-dashed border-[#2d2d3d] flex items-center justify-center bg-[#13131b]">
                        <CloudOff className="size-10 text-[#2d2d3d]" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h2>
                <p className="text-muted-foreground text-center text-sm leading-relaxed mb-8 px-4">
                    {description}
                </p>

                <div className="w-full bg-[#13131b] border border-[#2d2d3d] rounded-lg p-5 font-mono text-[13px] mb-8 space-y-1.5 shadow-inner">
                    <div className="flex gap-2">
                        <span className="text-[#4d4d61]">{">"}</span>
                        <span className="text-muted-foreground">status:</span>
                        <span className="text-[#00FFCC] font-bold">OK</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[#4d4d61]">{">"}</span>
                        <span className="text-muted-foreground">workers:</span>
                        <span className="text-white">0 active / 16 available</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[#4d4d61]">{">"}</span>
                        <span className="text-muted-foreground">throughput:</span>
                        <span className="text-white">0 B/s</span>
                    </div>
                </div>

                <Button 
                    className="w-full bg-[#00FFCC] hover:bg-[#00e6b8] text-black font-bold h-12 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(0,255,204,0.15)]"
                >
                    <PlusCircle className="size-5 mr-2" />
                    INITIALIZE TRANSFER
                </Button>
            </CardContent>
        </Card>
    )
}

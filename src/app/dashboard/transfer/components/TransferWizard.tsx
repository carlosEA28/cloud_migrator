"use client"

import { useState, useEffect } from "react"
import Image, { type StaticImageData } from "next/image"
import {
  Search,
  ChevronRight,
  ArrowLeft,
  FolderOpen,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react"
import { toast } from "sonner"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { checkProvidersStatus } from "@/actions/CheckIfProviderIsConnected"
import { listCloudItems } from "@/actions/cloud/list-items"
import { startTransfer } from "@/actions/startTranfer/start-transfer"
import { type ProviderKey } from "@/app/dashboard/providers/constants/providerCopy"
import { type CloudItem, type ProviderType } from "@/lib/cloud-adapters/types"
import { formatBytes } from "@/lib/transfers/format"

import googleDriveLogo from "../../../../../public/GoogleDriveLogo.svg"
import dropboxLogo from "../../../../../public/DropboxLogo.svg"

type Step = "origin" | "files" | "destination" | "summary"

interface ProviderOption {
  key: ProviderKey
  dbKey: ProviderType
  name: string
  logo: StaticImageData
  description: string
}

const PROVIDERS: ProviderOption[] = [
  {
    key: "google-drive",
    dbKey: "google",
    name: "Google Drive",
    logo: googleDriveLogo,
    description: "Cloud storage",
  },
  {
    key: "dropbox",
    dbKey: "dropbox",
    name: "Dropbox",
    logo: dropboxLogo,
    description: "Cloud storage",
  },
]

export function TransferWizard() {
  const [step, setStep] = useState<Step>("origin")
  const [search, setSearch] = useState("")
  const [fileSearch, setFileSearch] = useState("")
  const [origin, setOrigin] = useState<ProviderKey | null>(null)
  const [destination, setDestination] = useState<ProviderKey | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<CloudItem[]>([])
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingFolders, setIsFetchingFolders] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [items, setItems] = useState<CloudItem[]>([])

  useEffect(() => {
    async function loadStatus() {
      try {
        const status = await checkProvidersStatus()
        const connected = status.filter((p) => p.connected).map((p) => p.provider)
        setConnectedProviders(connected)
      } catch (error) {
        console.error("Failed to load provider status", error)
        toast.error("Nao foi possivel verificar os providers conectados.")
      } finally {
        setIsLoading(false)
      }
    }
    loadStatus()
  }, [])

  const filteredProviders = PROVIDERS.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
  )

  const isConnected = (dbKey: string) => connectedProviders.includes(dbKey)

  const selectableItems = items.filter((item) => item.type === "file")

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(fileSearch.toLowerCase())
  )

  const selectedOriginProvider = origin
    ? PROVIDERS.find((provider) => provider.key === origin) ?? null
    : null

  const selectedDestinationProvider = destination
    ? PROVIDERS.find((provider) => provider.key === destination) ?? null
    : null

  const handleContinue = async () => {
    if (step === "origin" && origin) {
      const selectedProvider = PROVIDERS.find(p => p.key === origin)
      if (selectedProvider && (selectedProvider.dbKey === "google" || selectedProvider.dbKey === "dropbox")) {
        setIsFetchingFolders(true)
        try {
          const response = await listCloudItems(selectedProvider.dbKey)
          setItems(response.items || [])
          setSelectedFiles([])
          setFileSearch("")
          setStep("files")
        } catch (error) {
          console.error("Error fetching items:", error)
          toast.error(
            error instanceof Error
              ? error.message
              : "Nao foi possivel buscar os arquivos do provider"
          )
        } finally {
          setIsFetchingFolders(false)
        }
      } else {
        setItems([])
        setStep("files")
      }
    }
    else if (step === "files" && selectedFiles.length > 0) setStep("destination")
    else if (step === "destination" && destination) setStep("summary")
  }

  const handleBack = () => {
    if (step === "files") setStep("origin")
    else if (step === "destination") setStep("files")
    else if (step === "summary") setStep("destination")
  }

  const handleStartTransfer = async () => {
    if (!origin || !destination || selectedFiles.length === 0) return
    const originDbKey = PROVIDERS.find(p => p.key === origin)?.dbKey
    const destDbKey = PROVIDERS.find(p => p.key === destination)?.dbKey
    if (!originDbKey || !destDbKey) return

    if (originDbKey === destDbKey) {
      toast.error("Selecione providers diferentes para origem e destino.")
      return
    }

    setIsStarting(true)
    try {
      await startTransfer({
        originProvider: originDbKey,
        destinationProvider: destDbKey,
        selectedFiles,
      })
    } catch (error) {
      console.error("Failed to start transfer:", error)
      toast.error(error instanceof Error ? error.message : "Falha ao iniciar migracao")
      setIsStarting(false)
    }
  }

  const totalSize = selectedFiles.reduce((acc, f) => acc + (f.size ?? 0), 0)
  const totalSizeLabel = formatBytes(totalSize)

  if (isLoading) {
    return (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#7B5CFF]" />
        </div>
    )
  }

  return (
      <div className="mx-auto max-w-4xl space-y-6">

        <div className="flex items-center gap-2 text-sm text-[#64748B]">
          <span className={step === "origin" ? "text-white" : ""}>Origin</span>
          <ChevronRight className="size-4" />
          <span className={step === "files" ? "text-white" : ""}>Files</span>
          <ChevronRight className="size-4" />
          <span className={step === "destination" ? "text-white" : ""}>Destination</span>
          <ChevronRight className="size-4" />
          <span className={step === "summary" ? "text-white" : ""}>Summary</span>
        </div>

        {step === "origin" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Select origin</h1>
                <p className="text-[#64748B]">Select the provider you want to migrate your files from.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                <Input
                    placeholder="Search your provider"
                    className="border-[#1F1F2E] bg-[#111118] pl-10 text-white placeholder:text-[#64748B] focus:border-[#7B5CFF]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {filteredProviders.map((provider) => {
                  const connected = isConnected(provider.dbKey)
                  return (
                      <button
                          key={provider.key}
                          disabled={!connected}
                          onClick={() => setOrigin(provider.key)}
                          className={`group relative w-full text-left transition-all ${!connected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Card className={`border-2 p-4 transition-all ${
                            origin === provider.key
                                ? "border-[#7B5CFF] bg-[#7B5CFF]/10"
                                : "border-[#1F1F2E] bg-[#111118] hover:border-[#1F1F2E]/80"
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-[#1F1F2E] p-2">
                              <Image src={provider.logo} alt={provider.name} width={32} height={32} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{provider.name}</p>
                              <p className="text-sm text-[#64748B]">{provider.description}</p>
                            </div>
                            {!connected && (
                                <span className="ml-auto text-[10px] text-[#EF4444] font-bold uppercase">Disconnected</span>
                            )}
                            {origin === provider.key && (
                                <CheckCircle2 className="ml-auto size-5 text-[#7B5CFF]" />
                            )}
                          </div>
                        </Card>
                      </button>
                  )
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                    disabled={!origin || isFetchingFolders}
                    onClick={handleContinue}
                    className="bg-[#7B5CFF] px-8 text-white hover:bg-[#6D4AFF]"
                >
                  {isFetchingFolders ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Loading items...
                      </>
                  ) : "Continue"}
                </Button>
              </div>
            </div>
        )}

        {step === "files" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon" onClick={handleBack} className="text-[#64748B]">
                    <ArrowLeft className="size-5" />
                  </Button>
                  <h1 className="text-3xl font-bold text-white">Select files</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B]">{selectedFiles.length} items selected</span>
                  <Button
                      variant="outline"
                      size="sm"
                      className="border-[#1F1F2E] bg-transparent text-white hover:bg-[#1F1F2E]"
                      onClick={() => {
                        if (selectedFiles.length === selectableItems.length) {
                          setSelectedFiles([])
                          return
                        }

                        setSelectedFiles(selectableItems)
                      }}
                  >
                    {selectedFiles.length === selectableItems.length && selectableItems.length > 0
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#64748B]" />
                <Input
                    placeholder="Search files or folders"
                    className="border-[#1F1F2E] bg-[#111118] pl-10 text-white placeholder:text-[#64748B] focus:border-[#7B5CFF]"
                    value={fileSearch}
                    onChange={(event) => setFileSearch(event.target.value)}
                />
              </div>

              <div className="grid gap-4">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => {
                      const isSelected = selectedFiles.some((file) => file.id === item.id)
                      const isFile = item.type === "file"

                      return (
                        <Card
                            key={item.id}
                            onClick={() => {
                              if (!isFile) {
                                return
                              }

                              setSelectedFiles((prev) =>
                                prev.find((file) => file.id === item.id)
                                  ? prev.filter((file) => file.id !== item.id)
                                  : [...prev, item]
                              )
                            }}
                            className={`cursor-pointer border-2 p-4 transition-all ${
                                isSelected
                                    ? "border-[#7B5CFF] bg-[#7B5CFF]/10"
                                    : "border-[#1F1F2E] bg-[#111118]"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="rounded bg-[#7B5CFF]/10 p-2 text-[#7B5CFF]">
                              {isFile ? <FileText className="size-6" /> : <FolderOpen className="size-6" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-white">{item.name}</p>
                              <p className="text-xs text-[#64748B]">
                                {item.type === "folder" ? "Folder" : "File"} • {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "Recent"}
                              </p>
                              {!isFile && (
                                <p className="mt-1 text-[11px] text-[#F59E0B]">
                                  Pasta nao suportada nesta etapa de migracao
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-white">{item.size ? formatBytes(item.size) : "-"}</p>
                              <p className="text-xs text-[#64748B] uppercase">{item.type}</p>
                            </div>
                            <div className={`size-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                    ? "border-[#7B5CFF] bg-[#7B5CFF]"
                                    : "border-[#1F1F2E]"
                            }`}>
                              {isSelected && <CheckCircle2 className="size-3 text-white" />}
                            </div>
                          </div>
                        </Card>
                      )
                    })
                ) : (
                    <div className="py-20 text-center">
                      <FolderOpen className="mx-auto size-12 text-[#1F1F2E]" />
                      <p className="mt-4 text-[#64748B]">No items found.</p>
                    </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                    disabled={selectedFiles.length === 0}
                    onClick={handleContinue}
                    className="bg-[#7B5CFF] px-8 text-white hover:bg-[#6D4AFF]"
                >
                  Continue
                </Button>
              </div>
            </div>
        )}

        {step === "destination" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack} className="text-[#64748B]">
                  <ArrowLeft className="size-5" />
                </Button>
                <h1 className="text-3xl font-bold text-white">Select destination</h1>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {PROVIDERS.filter(p => p.key !== origin).map((provider) => {
                  const connected = isConnected(provider.dbKey)
                  return (
                      <button
                          key={provider.key}
                          disabled={!connected}
                          onClick={() => setDestination(provider.key)}
                          className={`group relative w-full text-left transition-all ${!connected ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <Card className={`border-2 p-4 transition-all ${
                            destination === provider.key
                                ? "border-[#7B5CFF] bg-[#7B5CFF]/10"
                                : "border-[#1F1F2E] bg-[#111118] hover:border-[#1F1F2E]/80"
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className="rounded-lg bg-[#1F1F2E] p-2">
                              <Image src={provider.logo} alt={provider.name} width={32} height={32} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{provider.name}</p>
                              <p className="text-sm text-[#64748B]">{provider.description}</p>
                            </div>
                            {!connected && (
                                <span className="ml-auto text-[10px] text-[#EF4444] font-bold uppercase">Disconnected</span>
                            )}
                            {destination === provider.key && (
                                <CheckCircle2 className="ml-auto size-5 text-[#7B5CFF]" />
                            )}
                          </div>
                        </Card>
                      </button>
                  )
                })}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                    disabled={!destination}
                    onClick={handleContinue}
                    className="bg-[#7B5CFF] px-8 text-white hover:bg-[#6D4AFF]"
                >
                  Continue
                </Button>
              </div>
            </div>
        )}

        {step === "summary" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack} className="text-[#64748B]">
                  <ArrowLeft className="size-5" />
                </Button>
                <h1 className="text-3xl font-bold text-white">Review & Start</h1>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-[#1F1F2E] bg-[#111118] p-6">
                  <h3 className="mb-4 text-sm font-medium text-[#64748B] uppercase tracking-wider">Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Origin</span>
                      <div className="flex items-center gap-2">
                        {selectedOriginProvider && (
                          <Image src={selectedOriginProvider.logo} alt={selectedOriginProvider.name} width={20} height={20} />
                        )}
                        <span className="font-medium text-white">{selectedOriginProvider?.name ?? "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Destination</span>
                      <div className="flex items-center gap-2">
                        {selectedDestinationProvider && (
                          <Image
                            src={selectedDestinationProvider.logo}
                            alt={selectedDestinationProvider.name}
                            width={20}
                            height={20}
                          />
                        )}
                        <span className="font-medium text-white">{selectedDestinationProvider?.name ?? "-"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#1F1F2E] pt-4">
                      <span className="text-sm text-[#64748B]">Total Files</span>
                      <span className="font-medium text-white">{selectedFiles.length} items</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Total Size</span>
                      <span className="font-medium text-[#00FFC8]">{totalSizeLabel}</span>
                    </div>
                  </div>
                </Card>

                <Card className="border-[#1F1F2E] bg-[#111118] p-6">
                  <h3 className="mb-4 text-sm font-medium text-[#64748B] uppercase tracking-wider">Transfer Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Overwrite existing</span>
                      <span className="text-xs rounded bg-[#1F1F2E] px-2 py-1 text-white">Ask for permission</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Preserve metadata</span>
                      <span className="text-xs rounded bg-[#7B5CFF]/20 px-2 py-1 text-[#7B5CFF]">Enabled</span>
                    </div>
                  </div>
                  <div className="mt-8 rounded-lg bg-[#7B5CFF]/10 p-4 border border-[#7B5CFF]/20">
                    <p className="text-xs text-[#7B5CFF] leading-relaxed">
                      Your transfer will run in the background. You will receive a notification once it is completed.
                    </p>
                  </div>
                </Card>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                    disabled={isStarting}
                    onClick={handleStartTransfer}
                    className="bg-[#7B5CFF] px-12 h-12 text-white hover:bg-[#6D4AFF] font-bold text-lg shadow-[0_0_20px_rgba(123,92,255,0.3)]"
                >
                  {isStarting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Starting...
                      </>
                  ) : "Start Migration"}
                </Button>
              </div>
            </div>
        )}
      </div>
  )
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"]

export function formatBytes(value: number | bigint): string {
  const bytes = typeof value === "bigint" ? Number(value) : value

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B"
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )

  const size = bytes / Math.pow(1024, exponent)
  const decimals = exponent === 0 ? 0 : size < 10 ? 2 : 1

  return `${size.toFixed(decimals)} ${BYTE_UNITS[exponent]}`
}

export function formatRate(bytesPerSecond: number | null): string {
  if (!bytesPerSecond || bytesPerSecond <= 0) {
    return "-"
  }

  return `${formatBytes(bytesPerSecond)}/s`
}

export function formatEta(seconds: number | null): string {
  if (!seconds || seconds <= 0) {
    return "-"
  }

  if (seconds < 60) {
    return `${Math.ceil(seconds)}s`
  }

  if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)}m`
  }

  return `${Math.ceil(seconds / 3600)}h`
}

export function formatProviderName(provider: string): string {
  if (provider === "google") {
    return "Google Drive"
  }

  if (provider === "dropbox") {
    return "Dropbox"
  }

  return provider
}


export const DROPBOX_SCOPES = [
    "files.metadata.read",
    "files.content.read",
    "files.content.write",
] as const

export const GOOGLE_SCOPES = [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.file",
] as const
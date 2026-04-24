export type ProviderKey =
    | "aws-s3"
    | "google-drive"
    | "azure-blob"
    | "dropbox"
    | "sftp-server"

type ProviderCopy = {
    disconnectedDescription: string
    disconnectedActionLabel: string
}

export const providerCopyMap: Record<ProviderKey, ProviderCopy> = {
    "aws-s3": {
        disconnectedDescription:
            "Connect to Amazon Simple Storage Service (S3) buckets using IAM credentials or Access Keys.",
        disconnectedActionLabel: "CONNECT",
    },
    "google-drive": {
        disconnectedDescription:
            "Connect to Google Workspace or personal Drive storage via OAuth 2.0 secure authorization.",
        disconnectedActionLabel: "CONNECT",
    },
    "azure-blob": {
        disconnectedDescription:
            "Connect to Microsoft Azure Blob Storage containers using Connection String or Shared Access Signature.",
        disconnectedActionLabel: "CONNECT",
    },
    dropbox: {
        disconnectedDescription:
            "Connect to Dropbox Business or Personal accounts via OAuth 2.0 authorization flow.",
        disconnectedActionLabel: "CONNECT",
    },
    "sftp-server": {
        disconnectedDescription:
            "Connect to traditional on-premise or cloud-hosted SFTP servers using SSH key pairs or password authentication.",
        disconnectedActionLabel: "CONFIGURE",
    },
}

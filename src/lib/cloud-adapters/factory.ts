import { GoogleDriveAdapter } from "./google.adapter";
import { DropboxAdapter } from "./dropbox.adapter";
import { CloudAdapter, ProviderType } from "./types";

export function createAdapter(provider: ProviderType, accessToken: string): CloudAdapter {
  switch (provider) {
    case "google":
      return new GoogleDriveAdapter(accessToken);
    case "dropbox":
      return new DropboxAdapter(accessToken);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

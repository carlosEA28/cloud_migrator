import { CloudAdapter, CloudItem, ListItemsResponse } from "./types";

export class GoogleDriveAdapter implements CloudAdapter {
  private readonly baseUrl = "https://www.googleapis.com/drive/v3/files";

  constructor(private accessToken: string) {}

  async listItems(parentId: string = "root", pageToken?: string): Promise<ListItemsResponse> {
    const query = `'${parentId}' in parents and trashed = false`;
    const url = new URL(this.baseUrl);
    
    url.searchParams.append("q", query);
    url.searchParams.append("fields", "nextPageToken, files(id, name, mimeType, size, modifiedTime, parents)");
    url.searchParams.append("pageSize", "100");
    if (pageToken) url.searchParams.append("pageToken", pageToken);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "No error body");
        console.error(`Google Drive API Raw Error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`Google Drive API error: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();

    const items: CloudItem[] = (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === "application/vnd.google-apps.folder" ? "folder" : "file",
      size: file.size ? parseInt(file.size) : undefined,
      parentId: file.parents?.[0],
      provider: "google",
      mimeType: file.mimeType,
      updatedAt: file.modifiedTime,
    }));

    return {
      items: this.sortItems(items),
      nextPageToken: data.nextPageToken,
    };
  }

  private sortItems(items: CloudItem[]): CloudItem[] {
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
}

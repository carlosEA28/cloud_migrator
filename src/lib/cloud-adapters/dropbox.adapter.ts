import { CloudAdapter, CloudItem, ListItemsResponse } from "./types";

export class DropboxAdapter implements CloudAdapter {
  constructor(private accessToken: string) {}

  async listItems(parentId: string = "", pageToken?: string): Promise<ListItemsResponse> {
    const isContinue = !!pageToken;
    const endpoint = isContinue 
      ? "https://api.dropboxapi.com/2/files/list_folder/continue" 
      : "https://api.dropboxapi.com/2/files/list_folder";

    // Dropbox root path must be an empty string
    const normalizedPath = (parentId === "root" || !parentId) ? "" : parentId;

    const body = isContinue 
        ? { cursor: pageToken } 
        : { path: normalizedPath };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => "No error body");
        console.error(`Dropbox API Raw Error: ${response.status} ${response.statusText} - ${errorText}`);
        throw new Error(`Dropbox API error: ${response.statusText} (${errorText})`);
    }

    const data = await response.json();

    const items: CloudItem[] = (data.entries || []).map((entry: any) => ({
      id: entry.id,
      name: entry.name,
      type: entry[".tag"] === "folder" ? "folder" : "file",
      size: entry.size,
      parentId: parentId,
      provider: "dropbox",
      updatedAt: entry.server_modified,
    }));

    return {
      items: this.sortItems(items),
      nextPageToken: data.has_more ? data.cursor : undefined,
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

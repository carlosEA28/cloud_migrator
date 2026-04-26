export type ProviderType = "google" | "dropbox";

export type CloudItem = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  parentId?: string;
  provider: ProviderType;
  mimeType?: string;
  updatedAt?: string;
};

export interface ListItemsResponse {
  items: CloudItem[];
  nextPageToken?: string;
}

export interface CloudAdapter {
  listItems(parentId?: string, pageToken?: string): Promise<ListItemsResponse>;
}

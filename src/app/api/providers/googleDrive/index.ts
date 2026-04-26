import axios from "axios";
import {google} from "googleapis";
import {drive} from "googleapis/build/src/apis/drive";


type GoogleUserInfoResponse = {
    user: {
        displayName: string;
        photoLink: string;
        emailAddress: string;
    };
    storageQuota: {
        limit: string;
        usage: string;
        usageInDrive: string;
        usageInDriveTrash: string;
    };
};

export const getStorageGoogle = async (accessToken: string) => {
    try {
        const response = await axios.get<GoogleUserInfoResponse>(
            "https://www.googleapis.com/drive/v3/about",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                },
                params: {
                    fields: "user(displayName,photoLink,emailAddress),storageQuota",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Erro ao buscar dados do Google Drive:", error);
        throw error;
    }
};


export const getFoldersGoogle = async (
    accessToken: string,
    parentId: string = "root",
    pageToken?: string
) => {
    const auth = new google.auth.OAuth2();

    auth.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth });

    const res = await drive.files.list({
        q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: "nextPageToken, files(id, name, parents)",
        pageSize: 1000,
        pageToken,

        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
    });

    return {
        folders: res.data.files ?? [],
        nextPageToken: res.data.nextPageToken,
    };
};
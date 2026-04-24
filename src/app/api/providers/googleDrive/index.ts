import axios from "axios";


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
                    // É obrigatório especificar os campos desejados
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
import axios from "axios";

type DropboxData = {
    user: {
        displayName: string;
        email: string;
        profilePicUrl?: string;
    };
    storage: {
        used: number;
        allocated: number;
    };
};

export const getStorageDropbox = async (accessToken: string): Promise<DropboxData> => {
    const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
    };

    try {
        const [accountRes, spaceRes] = await Promise.all([
            axios.post("https://api.dropboxapi.com/2/users/get_current_account", null, { headers }),
            axios.post("https://api.dropboxapi.com/2/users/get_space_usage", null, { headers }),
        ]);

        return {
            user: {
                displayName: accountRes.data.name.display_name,
                email: accountRes.data.email,
                profilePicUrl: accountRes.data.profile_photo_url,
            },
            storage: {
                used: spaceRes.data.used,
                allocated: spaceRes.data.allocation.allocated,
            },
        };
    } catch (error) {
        console.error("Erro ao buscar dados do Dropbox:", error);
        throw error;
    }
};
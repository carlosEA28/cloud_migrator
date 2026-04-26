"use server";

export async function getDropboxFolders(accessToken: string, path = "") {
    const res = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            path, // "" = raiz
            recursive: false,
        }),
    });

    if (!res.ok) {
        throw new Error("Erro ao buscar pastas do Dropbox");
    }

    const data = await res.json();

    // filtra só pastas
    const folders = data.entries.filter(
        (item: any) => item[".tag"] === "folder"
    );

    return folders;
}
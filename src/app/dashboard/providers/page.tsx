import React from "react"
import Image from "next/image"

import logo from "../../../../public/Icon.svg"
import googleDrive from "../../../../public/GoogleDriveLogo.svg"
import ProviderCardComponent from "@/app/dashboard/providers/components/ProviderCardComponent";


const Providers = () => {
    return (
        <main className="space-y-8 p-8">
            <div className="flex h-17.75 items-center">
                <Image src={logo} alt="logo" width={75} height={75} />
                <h1 className="text-2xl font-bold text-white">Providers</h1>
            </div>

            <div className="flex flex-col gap-6">
                <p className="text-lg text-[#64748B]">
                    Configure and manage active connection endpoints for migration operations. Active
                    connections require valid OAuth tokens or IAM credentials.
                </p>

                <div className="grid grid-cols-4 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ProviderCardComponent
                        providerKey="google-drive"
                        title="Google Drive"
                        logo={googleDrive}
                        imageAlt="Google Drive"
                    />

                    <ProviderCardComponent
                        providerKey="dropbox"
                        title="Dropbox"
                        logo={googleDrive}
                        imageAlt="Dropbox"
                    />

                </div>
            </div>
        </main>
    )
}

export default Providers

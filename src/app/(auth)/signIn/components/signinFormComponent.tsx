"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupInput } from "@/components/ui/input-group"
import logo from "../../../../../public/Icon.svg"

export function SignInFormComponent() {
    return (
        <div className="w-full max-w-[448px] px-4">
            <div className="mb-6 text-center">
                <div className="mb-3 flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.24em] text-[#15e6c2]">
                    <Image src={logo} alt="Cloud Migrator logo" width={22} height={18} />
                    <span className="whitespace-nowrap">Cloud Migrator</span>
                </div>
                <h1 className="text-[24px] leading-[1.03] font-medium text-[#e8ecf2] md:text-[42px]">
                    Authenticate Access Node
                </h1>
                <p className="mt-3.5 font-mono text-[12px] tracking-[0.08em] text-[#8b95a6]">
                    Validate credentials to initialize secure session.
                </p>
            </div>

            <Card className="rounded-none border border-[#2b3140] bg-[#171b24] py-0 text-[#d5dbe4] ring-0 shadow-[0_18px_45px_rgba(0,0,0,0.5)]">
                <CardContent className="px-5 pt-5 pb-0 md:px-6 md:pt-6">
                    <form className="space-y-5">
                        <FieldGroup className="gap-4">
                            <Field>
                                <FieldLabel
                                    htmlFor="signin-email"
                                    className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                                >
                                    &gt; email_address
                                </FieldLabel>
                                <InputGroup className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] has-[[data-slot=input-group-control]:focus-visible]:!border-[#15e6c2]/70 has-[[data-slot=input-group-control]:focus-visible]:!ring-0">
                                    <InputGroupInput
                                        id="signin-email"
                                        type="email"
                                        placeholder="admin@system.local"
                                        autoComplete="email"
                                        className="!h-11 !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171]"
                                    />
                                </InputGroup>
                            </Field>

                            <Field>
                                <FieldLabel
                                    htmlFor="signin-secure-key"
                                    className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                                >
                                    &gt; secure_key
                                </FieldLabel>
                                <InputGroup className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] has-[[data-slot=input-group-control]:focus-visible]:!border-[#15e6c2]/70 has-[[data-slot=input-group-control]:focus-visible]:!ring-0">
                                    <InputGroupInput
                                        id="signin-secure-key"
                                        type="password"
                                        placeholder="............"
                                        autoComplete="current-password"
                                        className="!h-11 !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171]"
                                    />
                                </InputGroup>
                            </Field>
                        </FieldGroup>

                        <Button
                            type="button"
                            className="!h-11 !w-full !rounded-none !border !border-[#13d8b5]/70 !bg-[#15e6c2] !text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-[#12292a] hover:!bg-[#1ff5d2] cursor-pointer"
                        >
                            execute_login
                            <ArrowRight className="size-4" />
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex-col items-stretch gap-4 border-t-0 bg-transparent px-5 pt-4 pb-5 md:px-6 md:pb-6">
                    <div className="flex items-center gap-2">
                        <span className="h-px flex-1 bg-[#2c3240]" />
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#7f899a]">
                            OR_USE_PROVIDER
                        </span>
                        <span className="h-px flex-1 bg-[#2c3240]" />
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="!h-11 !w-full !rounded-none !border-[#2c3240] !bg-[#1d2230] !text-[11px] !font-medium !uppercase !tracking-[0.14em] !text-[#b5becd] hover:!bg-[#232a3b]"
                    >
                        <Image src="/google.svg" alt="Google" width={16} height={16} />
                        Continue with Google
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-center font-mono text-[12px] uppercase tracking-[0.12em] text-[#7e8899]">
                NEW_OPERATOR?
                <span className="ml-2 text-[#15e6c2] underline decoration-[#15e6c2] underline-offset-4">
                    INITIALIZE_NODE
                </span>
            </p>
        </div>
    )
}

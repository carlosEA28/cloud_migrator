"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth_client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import logo from "../../../../../public/Icon.svg"

const formSchema = z
  .object({
    name: z.string().min(1, "O campo nome e obrigatorio."),
    email: z
      .string()
      .min(1, "O campo email e obrigatorio.")
      .email("Email invalido."),
    secureKey: z.string().min(8, "A senha deve conter no minimo 8 caracteres."),
    verifyKey: z.string().min(8, "A senha deve conter no minimo 8 caracteres."),
  })
  .refine((data) => data.secureKey === data.verifyKey, {
    message: "As senhas nao coincidem.",
    path: ["verifyKey"],
  })

type SignUpFormValues = z.infer<typeof formSchema>

export function SignUpFormComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      secureKey: "",
      verifyKey: "",
    },
  })

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true)

    try {
      const { data } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.secureKey,
      })

      if (data?.user?.id) {
        router.push("/")
        return
      }

      toast.error("Nao foi possivel concluir o cadastro.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro inesperado.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-[12px] uppercase tracking-[0.24em] text-[#15e6c2]">
          <Image src={logo} alt="Cloud Migrator logo" width={22} height={18} />
          <span className="whitespace-nowrap">Cloud Migrator</span>
        </div>
        <h1 className="text-[24px] leading-[1.03] font-medium text-[#e8ecf2] md:text-[42px]">
          Initialize Access Node
        </h1>
        <p className="mt-3.5 font-mono text-[12px] tracking-[0.08em] text-[#8b95a6]">
          Establish credentials for secure data transit.
        </p>
      </div>

      <Card className="rounded-none border border-[#2b3140] bg-[#171b24] py-0 text-[#d5dbe4] ring-0 shadow-[0_18px_45px_rgba(0,0,0,0.5)]">
        <CardContent className="px-5 pt-5 pb-0 md:px-6 md:pt-6">
          <form
            id="signup-form"
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className="gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="signup-full-name"
                      className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                    >
                      &gt; full_name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-full-name"
                      placeholder="SysAdmin User"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171] focus-visible:!border-[#15e6c2]/70 focus-visible:!ring-0"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="signup-email"
                      className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                    >
                      &gt; email_address
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-email"
                      type="email"
                      placeholder="admin@system.local"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171] focus-visible:!border-[#15e6c2]/70 focus-visible:!ring-0"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="secureKey"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="signup-secure-key"
                      className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                    >
                      &gt; secure_key
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-secure-key"
                      type="password"
                      placeholder="............"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171] focus-visible:!border-[#15e6c2]/70 focus-visible:!ring-0"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="verifyKey"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="signup-verify-key"
                      className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#7f899a]"
                    >
                      &gt; verify_key
                    </FieldLabel>
                    <Input
                      {...field}
                      id="signup-verify-key"
                      type="password"
                      placeholder="............"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      className="!h-11 !rounded-none !border-[#2c3240] !bg-[#1a1f2b] !px-3 !text-[13px] !text-[#d5dbe4] placeholder:!text-[#586171] focus-visible:!border-[#15e6c2]/70 focus-visible:!ring-0"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              disabled={isLoading}
              className="!h-11 !w-full !rounded-none !border !border-[#13d8b5]/70 !bg-[#15e6c2] !text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-[#12292a] hover:!bg-[#1ff5d2]"
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  executing_registration
                </>
              ) : (
                <>
                  execute_registration
                  <ArrowRight className="size-4" />
                </>
              )}
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
        SESSION_ACTIVE?
        <span className="ml-2 text-[#15e6c2] underline decoration-[#15e6c2] underline-offset-4">
          TERMINAL_LOGIN
        </span>
      </p>
    </div>
  )
}

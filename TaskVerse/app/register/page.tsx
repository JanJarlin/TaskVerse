"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"
import { zodResolver } from "@hookform/resolvers/zod"
import Loading from "@/components/ui/loading"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import * as z from "zod"
import { createClientSupabaseClient } from "@/lib/supabase"

const registerSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters.",
    })
    .refine(
      (password) => {
        const hasUpperCase = /[A-Z]/.test(password)
        const hasLowerCase = /[a-z]/.test(password)
        const hasNumber = /[0-9]/.test(password)
        const hasSymbol = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        return hasUpperCase && hasLowerCase && hasNumber && hasSymbol
      },
      {
        message:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.",
      },
    ),
})

const RegisterPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientSupabaseClient()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    mode: "onChange", // Trigger validation on every input change
  })

  // Modificar la función onSubmit para mejorar la redirección
  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)

    try {
      // Registrar usuario con Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Registration successful! Please check your email to confirm your account.",
      })

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push("/login")
      }, 500)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* Botón de volver a la página principal en la parte superior izquierda */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="outline" size="sm" className="border">
            <ArrowLeft className="w-4 h-4 mr-0" style={{ color: "hsl(var(--primary))" }} />
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-[500px] px-4"
      >
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center space-y-2 pb-2 relative">
            <CardTitle className="text-2xl font-bold tracking-tight text-center">Register</CardTitle>
            <CardDescription className="text-center">Create an account to start organizing your tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Name</FormLabel>
                      <FormControl>
                        <Input id="name" placeholder="Enter name" type="text" className="text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <FormControl>
                        <Input id="email" placeholder="Enter email" type="email" className="text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="password">Password</FormLabel>
                      <FormControl>
                        <Input
                          id="password"
                          placeholder="Enter password"
                          type="password"
                          className="text-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className="w-full mt-4" type="submit" disabled={isLoading}>
                  {isLoading ? <Loading /> : "Register"}
                </Button>
              </form>
            </Form>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterPage

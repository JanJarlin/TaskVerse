"use client"

import type { User } from "@supabase/supabase-js"

interface UserAvatarProps {
  user: User | null
}

export function UserAvatar({ user }: UserAvatarProps) {
  // Obtener las iniciales del nombre del usuario
  const getInitials = () => {
    if (!user) return "?"

    // Intentar obtener el nombre de los metadatos del usuario
    const name = (user.user_metadata?.name as string) || ""

    if (name) {
      // Si hay un nombre, obtener las iniciales
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    // Si no hay nombre, usar la primera letra del email
    return user.email?.charAt(0).toUpperCase() || "?"
  }

  // Obtener el nombre completo o el email si no hay nombre
  const getDisplayName = () => {
    if (!user) return "Usuario"

    const name = user.user_metadata?.name as string
    return name || user.email?.split("@")[0] || "Usuario"
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium hidden sm:inline">{getDisplayName()}</span>
      <div className="h-10 w-10 bg-primary rounded-md flex items-center justify-center text-lg text-white font-semibold">
        {getInitials()}
      </div>
    </div>
  )
}

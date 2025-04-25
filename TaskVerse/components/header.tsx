"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <div className="absolute top-4 left-4">
      <Link href="/">
        <Button variant="outline" size="sm" className="border">
          <ArrowLeft className="w-4 h-4 mr-0" style={{ color: "hsl(var(--primary))" }} />
        </Button>
      </Link>
    </div>
  )
}

"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function ModeToggle({
  className,
  variant = "outline",
}: {
  className?: string
  variant?: "outline" | "ghost"
}) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant={variant}
      size="icon"
      className={cn("relative cursor-pointer", className)}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <MoonIcon className="scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <SunIcon className="absolute scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export { ModeToggle }

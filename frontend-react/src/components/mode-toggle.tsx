import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

import { useTheme } from "@/components/theme-provider"




export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const isDark = theme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="!bg-transparent border-[var(--muted)]"
    >
      {isDark ? (
        <Sun className="h-[1.2rem] w-[1.2rem] " />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] " />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
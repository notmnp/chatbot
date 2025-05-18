import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "./theme-provider"
import blackLogo from "@/assets/images/black_logo.png"
import whiteLogo from "@/assets/images/white_logo.png"

export function Navbar() {
  const { resolvedTheme } = useTheme()
  const logoSrc = resolvedTheme === 'dark' ? whiteLogo : blackLogo

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={logoSrc} alt="Logo" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
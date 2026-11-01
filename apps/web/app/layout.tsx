import { Geist_Mono, Roboto } from "next/font/google"

import "@aqardesk/ui/globals.css"
import { Toaster } from "@aqardesk/ui/components/toaster"
import { TooltipProvider } from "@aqardesk/ui/components/tooltip"
import { cn } from "@aqardesk/ui/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        roboto.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

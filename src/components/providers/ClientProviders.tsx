"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import WalletContextProvider from "./WalletProvider"

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { signIn, useSession, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Wallet, Shield, ArrowRight } from 'lucide-react'
import { SigninMessage } from '@/lib/auth/SigninMessage'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { wallet, publicKey, signMessage } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If user is already authenticated, redirect appropriately
    if (session && session.user && session.user.id !== 'new-user') {
      const dashboardPath = session.user.role === 'FREELANCER' 
        ? '/dashboard/freelancer' 
        : session.user.role === 'HIRER' 
        ? '/dashboard/hirer'
        : '/dashboard'
      router.push(dashboardPath)
    } else if (session && session.user && session.user.id === 'new-user') {
      // New user should go to onboarding
      router.push('/onboarding')
    }
  }, [session, router])

  const handleWalletConnect = async () => {
    if (!wallet) {
      setVisible(true)
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Wait for wallet connection
      if (!publicKey) {
        setVisible(true)
        return
      }

      await authenticateWithWallet()
    } catch (error) {
      console.error('Wallet connection error:', error)
      setError('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const authenticateWithWallet = async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not properly connected')
      return
    }

    setIsSigningIn(true)
    setError(null)

    try {
      // Create signin message
      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: publicKey.toBase58(),
        nonce: SigninMessage.generateNonce(),
        statement: 'Sign this message to authenticate with TaskFi',
      })

      const messageString = message.prepare()
      const messageBytes = new TextEncoder().encode(messageString)
      
      // Request signature from wallet
      const signature = await signMessage(messageBytes)
      const signatureBase58 = Buffer.from(signature).toString('base64')
      
      // Sign in with NextAuth
      const result = await signIn('credentials', {
        message: JSON.stringify({
          domain: message.domain,
          publicKey: message.publicKey,
          nonce: message.nonce,
          statement: message.statement,
        }),
        signature: signatureBase58,
        redirect: false,
      })

      if (result?.error) {
        setError('Authentication failed. Please try again.')
        console.error('Sign in error:', result.error)
        return
      }

      // Refresh session to get updated user data
      const updatedSession = await getSession()
      
      if (updatedSession?.user?.id === 'new-user') {
        // New user - redirect to onboarding
        router.push('/onboarding')
      } else if (updatedSession?.user) {
        // Existing user - redirect to appropriate dashboard
        const dashboardPath = updatedSession.user.role === 'FREELANCER' 
          ? '/dashboard/freelancer' 
          : updatedSession.user.role === 'HIRER' 
          ? '/dashboard/hirer'
          : '/dashboard'
        router.push(dashboardPath)
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message || 'Failed to authenticate. Please try again.')
    } finally {
      setIsSigningIn(false)
    }
  }

  useEffect(() => {
    // Auto-authenticate when wallet connects
    if (publicKey && !session && !isSigningIn) {
      authenticateWithWallet()
    }
  }, [publicKey, session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-md web3-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TaskFi</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Connect your Solana wallet to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Wallet Connection Status */}
          {publicKey ? (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">Wallet Connected</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {publicKey.toBase58()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-muted/50 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No Wallet Connected</p>
                  <p className="text-xs text-muted-foreground">Click below to connect</p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <Shield className="h-4 w-4 text-primary" />
              <span>Secure wallet authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <Zap className="h-4 w-4 text-secondary" />
              <span>Access Web3 freelance marketplace</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <ArrowRight className="h-4 w-4 text-accent" />
              <span>Start earning or hiring today</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Connect Button */}
          <Button
            onClick={handleWalletConnect}
            loading={isConnecting || isSigningIn}
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={!wallet && !visible}
          >
            {isSigningIn ? 'Signing In...' : 
             isConnecting ? 'Connecting...' : 
             publicKey ? 'Sign In with Wallet' : 'Connect Wallet'}
          </Button>

          {/* Wallet Options */}
          {!publicKey && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Supported wallets: Phantom, Solflare, Backpack, Glow, and more
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
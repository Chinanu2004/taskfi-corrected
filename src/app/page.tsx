'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { signIn, signOut, useSession, getSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { SigninMessage } from '@/lib/auth/SigninMessage'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Shield, Zap, Users, TrendingUp } from 'lucide-react'
import bs58 from 'bs58'

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Initialize wallet hook after component mounts to prevent hydration issues
  const wallet = useWallet()
  const { publicKey, signMessage, connected } = mounted ? wallet : { publicKey: null, signMessage: null, connected: false }
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleWalletAuth = async () => {
    if (!publicKey || !signMessage) return
    
    setIsSigningIn(true)
    try {
      const message = new SigninMessage({
        domain: window.location.host,
        publicKey: publicKey.toString(),
        nonce: Math.random().toString(36).substring(7),
        statement: 'Sign this message to authenticate with TaskFi'
      })

      const messageToSign = message.prepare()
      const signature = await signMessage(new TextEncoder().encode(messageToSign))
      const signatureBase58 = bs58.encode(signature)

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
        console.error('Sign in error:', result.error)
        toast({
          title: 'Authentication Failed',
          description: 'Please try connecting your wallet again.',
          variant: 'destructive'
        })
        return
      }

      // Force session update to get the latest user data
      const updatedSession = await getSession()
      
      if (updatedSession?.user?.id === 'new-user') {
        router.push('/onboarding')
      } else if (updatedSession?.user) {
        const dashboardPath = updatedSession.user.role === 'ADMIN' ? '/dashboard/admin' : 
                              updatedSession.user.role === 'FREELANCER' ? '/dashboard/freelancer' : '/dashboard/hirer'
        router.push(dashboardPath)
      }
      
    } catch (error) {
      console.error('Authentication error:', error)
      toast({
        title: 'Error',
        description: 'Failed to authenticate. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSigningIn(false)
    }
  }

  useEffect(() => {
    // Only attempt authentication if component is mounted, wallet is connected, has public key, no existing session, and not currently loading
    if (mounted && connected && publicKey && !session && status === 'unauthenticated' && !isSigningIn) {
      handleWalletAuth()
    }
  }, [mounted, connected, publicKey, session, status, isSigningIn])

  if (session && session.user.id === 'new-user') {
    // Redirect to onboarding for new users
    router.push('/onboarding')
    return null
  }

  if (session && session.user.id !== 'new-user') {
    // Redirect to dashboard for existing users
    const dashboardPath = session.user.role === 'ADMIN' ? '/dashboard/admin' : 
                          session.user.role === 'FREELANCER' ? '/dashboard/freelancer' : '/dashboard/hirer'
    router.push(dashboardPath)
    return null
  }

  // Show loading state while hydrating to prevent wallet context errors
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold gradient-text">TaskFi</span>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">TaskFi</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <Button onClick={() => signOut()} variant="outline">Sign Out</Button>
            ) : (
              <WalletMultiButton className="btn-glow" />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fadeIn">
            The Future of{' '}
            <span className="gradient-text">Web3 Freelancing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fadeIn">
            Connect with elite Web3 talent on Solana. Secure escrow payments, 
            exclusive job assignments, and a premium decentralized experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fadeIn">
            {!connected ? (
              <WalletMultiButton className="bg-gradient-primary hover:scale-105 transition-transform btn-glow" />
            ) : (
              <Button 
                onClick={handleWalletAuth} 
                loading={isSigningIn}
                variant="gradient"
                size="xl"
                className="hover:scale-105 transition-transform"
              >
                {isSigningIn ? 'Authenticating...' : 'Enter TaskFi'}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="xl" 
              className="border-primary/50"
              onClick={() => {
                if (!publicKey) {
                  toast({
                    title: "Connect Wallet",
                    description: "Please connect your wallet to browse gigs",
                    variant: "destructive"
                  })
                  return
                }
                router.push('/browse/gigs')
              }}
            >
              Browse Gigs
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="card-hover web3-card">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4 mx-auto" />
                <CardTitle>Secure Escrow</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Smart contract-powered escrow ensures safe payments. 
                  Funds are released only when work is completed.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover web3-card">
              <CardHeader>
                <Users className="h-12 w-12 text-secondary mb-4 mx-auto" />
                <CardTitle>Elite Talent</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access verified Web3 developers, designers, and specialists. 
                  Quality over quantity, every time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover web3-card">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-accent mb-4 mx-auto" />
                <CardTitle>Instant Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get paid instantly in USDC on Solana. 
                  No waiting, no intermediaries, just pure efficiency.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl p-8 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">10K+</div>
                <div className="text-muted-foreground">Active Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">$2M+</div>
                <div className="text-muted-foreground">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">500+</div>
                <div className="text-muted-foreground">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-2">99%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of Web3 professionals building the future.
            </p>
            {!connected && (
              <WalletMultiButton className="bg-gradient-primary btn-glow" />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold gradient-text">TaskFi</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border/20 text-center text-sm text-muted-foreground">
            © 2024 TaskFi. Built on Solana. Powered by Web3.
          </div>
        </div>
      </footer>
    </div>
  )
}

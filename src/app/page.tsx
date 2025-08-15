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

  // Handle navigation for authenticated users
  useEffect(() => {
    if (session && session.user.id === 'new-user') {
      router.push('/onboarding')
    } else if (session && session.user.id !== 'new-user') {
      const dashboardPath = session.user.role === 'ADMIN' ? '/dashboard/admin' : 
                            session.user.role === 'FREELANCER' ? '/dashboard/freelancer' : '/dashboard/hirer'
      router.push(dashboardPath)
    }
  }, [session, router])

  if (session && session.user.id === 'new-user') {
    // Show loading while redirecting to onboarding
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold gradient-text">TaskFi</span>
          <p className="text-muted-foreground mt-2">Redirecting to setup...</p>
        </div>
      </div>
    )
  }

  if (session && session.user.id !== 'new-user') {
    // Show loading while redirecting to dashboard
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="h-5 w-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-bold gradient-text">TaskFi</span>
          <p className="text-muted-foreground mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    )
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
      {/* Premium Header */}
      <header className="nav-premium border-b border-white/10">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-premium">TaskFi</span>
              <div className="text-xs text-muted-foreground font-medium tracking-wider">DECENTRALIZED MARKETPLACE</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <Button onClick={() => signOut()} className="btn-premium" size="lg">Sign Out</Button>
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
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm text-lg px-12 py-4 rounded-full transition-all duration-300"
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
              🎯 Explore Marketplace
            </Button>
          </div>

          {/* Premium Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 grid-premium">
            <Card className="premium-card float-premium">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-premium">Secure Escrow</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed">
                  🔐 Smart contract-powered escrow ensures bulletproof payments. 
                  Funds are cryptographically secured and released only upon work completion.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="premium-card float-premium" style={{animationDelay: '1s'}}>
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-premium">Elite Talent</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed">
                  ⭐ Access hand-picked Web3 developers, designers, and blockchain specialists. 
                  Premium quality, verified expertise, every single time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="premium-card float-premium" style={{animationDelay: '2s'}}>
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-premium">Instant Payments</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-lg leading-relaxed">
                  ⚡ Lightning-fast USDC payments on Solana blockchain. 
                  No delays, no intermediaries, just pure Web3 efficiency.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Premium Stats */}
          <div className="glass-premium rounded-3xl p-12 mb-20 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="stat-premium">
                <div className="stat-number">25K+</div>
                <div className="text-muted-foreground text-lg font-medium">Elite Freelancers</div>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mt-3 rounded-full"></div>
              </div>
              <div className="stat-premium">
                <div className="stat-number">$10M+</div>
                <div className="text-muted-foreground text-lg font-medium">Volume Processed</div>
                <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-blue-500 mx-auto mt-3 rounded-full"></div>
              </div>
              <div className="stat-premium">
                <div className="stat-number">5K+</div>
                <div className="text-muted-foreground text-lg font-medium">Projects Delivered</div>
                <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto mt-3 rounded-full"></div>
              </div>
              <div className="stat-premium">
                <div className="stat-number">99.8%</div>
                <div className="text-muted-foreground text-lg font-medium">Success Rate</div>
                <div className="w-12 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-3 rounded-full"></div>
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

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  DollarSign,
  Star,
  TrendingUp,
  Eye,
  MessageCircle,
  Calendar,
  Clock,
  Award,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
} from 'lucide-react'

interface Gig {
  id: string
  title: string
  status: 'ACTIVE' | 'PAUSED' | 'INACTIVE'
  rating: number
  orderCount: number
  viewCount: number
  packages: any[]
  minPrice: number
  maxPrice: number
  createdAt: string
  gallery: string[]
}

interface JobApplication {
  id: string
  isAccepted: boolean | null
  proposedBudget: number
  estimatedDays: number
  createdAt: string
  job: {
    id: string
    title: string
    budget: number
    status: string
    hirer: {
      name: string
      username: string
      avatarUrl?: string
    }
  }
}

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  gig?: {
    title: string
  }
  job?: {
    title: string
  }
}

export default function FreelancerDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeGigs: 0,
    completedJobs: 0,
    rating: 0,
    pendingApplications: 0,
    escrowBalance: 0,
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard/freelancer')
      return
    }

    if (session.user.role !== 'FREELANCER') {
      router.push('/dashboard')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [gigsRes, paymentsRes] = await Promise.all([
        fetch('/api/gigs?freelancer=' + session?.user.id),
        fetch('/api/payments'),
      ])

      if (gigsRes.ok) {
        const gigsData = await gigsRes.json()
        setGigs(gigsData.gigs || [])
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json()
        setPayments(paymentsData.payments || [])
        
        // Calculate stats
        setStats({
          totalEarnings: session?.user.totalEarned || 0,
          activeGigs: gigsData.gigs?.filter((g: Gig) => g.status === 'ACTIVE').length || 0,
          completedJobs: session?.user.completedJobs || 0,
          rating: session?.user.rating || 0,
          pendingApplications: 0, // Will be updated when we fetch applications
          escrowBalance: paymentsData.stats?.totalInEscrow || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PAUSED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      ESCROW: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      RELEASED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.INACTIVE}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Premium Header */}
        <div className="premium-card glass-premium p-8 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                👋 Welcome back, {session?.user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                💼 Manage your gigs, track earnings, and scale your freelance empire
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => router.push('/browse/jobs')}
                className="btn-premium px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:from-emerald-500/20 hover:to-green-500/20 transition-all duration-300 font-medium"
              >
                🔍 Browse Jobs
              </button>
              <button 
                onClick={() => router.push('/dashboard/freelancer/gigs/create')}
                className="btn-premium px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
              >
                ➕ Create Gig
              </button>
            </div>
          </div>
        </div>

        {/* Premium Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-500 float-premium">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">💰 Total Earnings</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  ${stats.totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">+12% this month</p>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-500 float-premium" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">💼 Active Gigs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {stats.activeGigs}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">{stats.activeGigs > 0 ? 'High demand!' : 'Ready to create?'}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-500 float-premium" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-2">🏆 Completed Jobs</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {stats.completedJobs}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">{stats.completedJobs > 5 ? 'Experienced' : 'Building portfolio'}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl group hover:shadow-2xl transition-all duration-500 float-premium" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-2">⭐ Your Rating</p>
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {stats.rating > 0 ? stats.rating.toFixed(1) : '5.0'}
                  </p>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Top-tier freelancer</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium Escrow Balance Alert */}
        {stats.escrowBalance > 0 && (
          <div className="mb-8 premium-card glass-premium p-8 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-xl shadow-xl bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-2xl shadow-lg">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    🔒 Funds in Secure Escrow
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mt-1 text-lg">
                    <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      ${stats.escrowBalance.toLocaleString()}
                    </span> waiting to be released upon job completion
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    ✨ Your funds are safely protected by our smart contract escrow system
                  </p>
                </div>
              </div>
              <button 
                onClick={() => router.push('/dashboard/freelancer/payments')}
                className="btn-premium px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                View Details <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Premium Gigs Management */}
            <div className="premium-card glass-premium rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl">
              <div className="p-8 border-b border-gradient-to-r from-purple-200/50 to-blue-200/50 dark:border-purple-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                      💼 My Premium Gigs
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Manage your service offerings and track performance
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/freelancer/gigs/create')}
                    className="btn-premium px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-3"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create Premium Gig</span>
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                {gigs.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-6">💼</div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Ready to Launch Your First Gig?
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                      Create premium service offerings to attract high-value clients and build your freelance empire
                    </p>
                    <button 
                      onClick={() => router.push('/dashboard/freelancer/gigs/create')}
                      className="btn-premium px-12 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      ✨ Create Your First Premium Gig
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gigs.slice(0, 5).map((gig, index) => (
                      <div key={gig.id} className="premium-card glass-premium p-6 rounded-xl border border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {gig.title}
                              </h3>
                              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                gig.status === 'ACTIVE' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                                gig.status === 'PAUSED' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                                'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                              }`}>
                                {gig.status === 'ACTIVE' ? '✅ ACTIVE' : gig.status === 'PAUSED' ? '⏸️ PAUSED' : '❌ INACTIVE'}
                              </div>
                            </div>
                            <div className="flex items-center space-x-8 text-sm">
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 px-3 py-2 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                                <DollarSign className="w-4 h-4 text-emerald-500" />
                                <span className="font-bold text-emerald-700 dark:text-emerald-300">${gig.minPrice} - ${gig.maxPrice}</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-3 py-2 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                                <Eye className="w-4 h-4 text-blue-500" />
                                <span className="font-medium text-blue-700 dark:text-blue-300">{gig.viewCount} views</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 py-2 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="font-bold text-yellow-700 dark:text-yellow-300">{gig.rating > 0 ? gig.rating.toFixed(1) : '5.0'}</span>
                              </div>
                              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 px-3 py-2 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
                                <Calendar className="w-4 h-4 text-purple-500" />
                                <span className="font-medium text-purple-700 dark:text-purple-300">{gig.orderCount} orders</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 ml-6">
                            <button 
                              onClick={() => router.push(`/gigs/${gig.id}`)}
                              className="p-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300"
                              title="View gig"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => router.push(`/dashboard/freelancer/gigs/${gig.id}/edit`)}
                              className="p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/50 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 hover:from-blue-500/20 hover:to-indigo-500/20 transition-all duration-300"
                              title="Edit gig"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {gigs.length > 5 && (
                  <div className="p-6 text-center">
                    <button 
                      onClick={() => router.push('/dashboard/freelancer/gigs')}
                      className="btn-premium px-8 py-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 font-bold"
                    >
                      📊 View All {gigs.length} Gigs
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Recent Payments */}
            <div className="premium-card glass-premium rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl">
              <div className="p-8 border-b border-gradient-to-r from-emerald-200/50 to-green-200/50 dark:border-emerald-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent flex items-center gap-3">
                      💳 Recent Payments
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Track your earnings and payment history
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/dashboard/freelancer/payments')}
                    className="btn-premium px-6 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all duration-300 font-bold"
                  >
                    View All Payments
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                {payments.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-6xl mb-6">💳</div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                      Your Payments Journey Starts Here
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto text-lg">
                      Complete projects and build your payment history to track your freelance success
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments.slice(0, 5).map((payment, index) => (
                      <div key={payment.id} className="premium-card glass-premium p-6 rounded-xl border border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-300" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${
                              payment.status === 'RELEASED' ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                              payment.status === 'ESCROW' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500'
                            }`}>
                              <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-lg text-gray-800 dark:text-white">
                                {payment.gig?.title || payment.job?.title || 'Premium Payment'}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                📅 {new Date(payment.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                              ${payment.amount.toLocaleString()} {payment.currency}
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                              payment.status === 'RELEASED' ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white' :
                              payment.status === 'ESCROW' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                              'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                            }`}>
                              {payment.status === 'RELEASED' ? '✅ COMPLETED' :
                               payment.status === 'ESCROW' ? '🔒 IN ESCROW' :
                               '⏳ PENDING'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/browse/jobs')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Browse Jobs</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Find new opportunities</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/freelancer/gigs/create')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Create New Gig</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Offer your services</div>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push('/dashboard/freelancer/profile')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Edit3 className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Edit Profile</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Update your information</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Profile Completion</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Response Rate</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">On-time Delivery</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">98%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
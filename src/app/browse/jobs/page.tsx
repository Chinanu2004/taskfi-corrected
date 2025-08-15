'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, Clock, DollarSign, MapPin, User, Zap, Star, Eye, Users } from 'lucide-react'

interface Job {
  id: string
  title: string
  description: string
  requirements: string[]
  budget: number
  deadline: string
  status: string
  isUrgent: boolean
  tags: string[]
  viewCount: number
  applicantCount: number
  hirer: {
    id: string
    name: string
    username: string
    avatarUrl: string
    rating: number
    isVerified: boolean
  }
  category: {
    id: string
    name: string
    icon: string
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  icon: string
}

export default function BrowseJobsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchJobs()
    fetchCategories()
  }, [searchTerm, selectedCategory, budgetMin, budgetMax, sortBy])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        budgetMin: budgetMin,
        budgetMax: budgetMax,
        sortBy: sortBy,
        status: 'OPEN'
      })
      
      const response = await fetch(`/api/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleApplyToJob = async (jobId: string) => {
    if (!session?.user) {
      router.push('/')
      return
    }

    if (session.user.role !== 'FREELANCER') {
      alert('Only freelancers can apply to jobs')
      return
    }

    router.push(`/jobs/${jobId}/apply`)
  }

  const timeAgo = (date: string) => {
    const now = new Date()
    const posted = new Date(date)
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just posted'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setBudgetMin('')
    setBudgetMax('')
    setSortBy('newest')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-blue-900/10">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-purple-600/90 to-blue-600/90 dark:from-purple-800/90 dark:to-blue-800/90 backdrop-blur-sm border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">
                💼 Browse Premium Jobs
              </h1>
              <p className="text-purple-100 text-lg font-medium">
                Discover high-value Web3 opportunities • {jobs.length} premium jobs available
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => router.push('/browse/gigs')} 
                className="btn-premium glass-premium backdrop-blur-md border border-white/20 text-white hover:bg-white/10"
                variant="outline"
              >
                🎯 Browse Gigs
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="btn-premium bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 text-white hover:from-white/30 hover:to-white/20"
              >
                📊 Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Premium Filters Sidebar */}
          <div className="w-80 space-y-6">
            <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl">
              <div className="mb-6">
                <h3 className="text-premium text-xl font-bold flex items-center gap-3">
                  <span className="text-2xl">🔍</span>
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Premium Filters</span>
                </h3>
              </div>
              <div className="space-y-6">
                {/* Premium Search */}
                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                    🔍 Search Premium Jobs
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title, skills, technology..."
                      className="input-premium w-full pl-12 pr-4 py-4 rounded-xl glass-premium border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Premium Category */}
                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                    🎯 Select Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="input-premium w-full px-4 py-4 rounded-xl glass-premium border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300"
                  >
                    <option value="">🌐 All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Premium Budget Range */}
                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                    💰 Budget Range (USD)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Min ($)"
                      className="input-premium flex-1 px-4 py-3 rounded-xl glass-premium border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                    />
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Max ($)"
                      className="input-premium flex-1 px-4 py-3 rounded-xl glass-premium border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Premium Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-3">
                    ✨ Sort & Prioritize
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-premium w-full px-4 py-4 rounded-xl glass-premium border border-purple-200/50 dark:border-purple-800/50 backdrop-blur-sm text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 transition-all duration-300"
                  >
                    <option value="newest">🔥 Newest First</option>
                    <option value="budget_high">💵 Highest Budget</option>
                    <option value="budget_low">💳 Lowest Budget</option>
                    <option value="deadline">⏰ Deadline Soon</option>
                    <option value="popular">🔥 Most Applications</option>
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="btn-premium w-full py-4 rounded-xl bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:from-red-500/20 hover:to-pink-500/20 transition-all duration-300 font-medium backdrop-blur-sm"
                >
                  🗑️ Clear All Filters
                </button>
              </div>
            </div>

            {/* Premium Quick Stats */}
            <div className="premium-card glass-premium p-6 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl">
              <div className="mb-4">
                <h3 className="text-premium text-lg font-bold flex items-center gap-2">
                  <span className="text-xl">📈</span>
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Market Insights</span>
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-800/50">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    💼 Total Opportunities
                  </span>
                  <span className="font-bold text-blue-800 dark:text-blue-200 text-lg">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    💰 Average Budget
                  </span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-200 text-lg">
                    ${jobs.length > 0 ? (jobs.reduce((sum, job) => sum + job.budget, 0) / jobs.length).toLocaleString() : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300 flex items-center gap-2">
                    ⚡ Urgent Opportunities
                  </span>
                  <span className="font-bold text-orange-800 dark:text-orange-200 text-lg">
                    {jobs.filter(job => job.isUrgent).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Jobs List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <div className="loading-premium w-20 h-20 rounded-full border-4 border-purple-200 dark:border-purple-800"></div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-t-purple-600 animate-spin"></div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="premium-card glass-premium p-12 rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl text-center">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                  No Premium Jobs Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters or check back later for new high-value opportunities.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-premium px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                >
                  🔄 Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {jobs.map((job, index) => (
                  <div 
                    key={job.id} 
                    className="premium-card glass-premium rounded-2xl border border-white/20 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group float-premium"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 
                              className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors cursor-pointer"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                            >
                              {job.title}
                            </h3>
                            {job.isUrgent && (
                              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg">
                                <Zap className="h-4 w-4" />
                                URGENT
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 text-lg leading-relaxed">
                            {job.description}
                          </p>
                        </div>
                        <div className="text-right ml-8">
                          <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            ${job.budget.toLocaleString()}
                          </div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                            💰 Fixed Budget
                          </div>
                        </div>
                      </div>

                      {/* Premium Requirements */}
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                          🎯 Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 font-medium hover:shadow-md transition-all duration-300"
                            >
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className="text-purple-600 dark:text-purple-400 text-sm font-medium bg-purple-50 dark:bg-purple-900/30 px-3 py-2 rounded-xl">
                              +{job.requirements.length - 3} more skills
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Premium Tags */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-3">
                          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                            {job.category.icon} {job.category.name}
                          </span>
                          {job.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-300"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Premium Footer */}
                      <div className="flex justify-between items-center pt-6 border-t border-gradient-to-r from-purple-200/50 to-blue-200/50 dark:border-purple-800/50">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={job.hirer.avatarUrl || '/avatars/blockchain-architect.png'}
                                alt={job.hirer.name}
                                className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                              />
                              {job.hirer.isVerified && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">✓</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 dark:text-white">{job.hirer.name}</span>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                {job.hirer.rating || 4.8}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-3 py-2 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">{timeAgo(job.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 px-3 py-2 rounded-lg">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium text-emerald-700 dark:text-emerald-300">{job.applicantCount} proposals</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/30 dark:to-indigo-900/30 px-3 py-2 rounded-lg">
                            <Eye className="h-4 w-4 text-purple-500" />
                            <span className="font-medium text-purple-700 dark:text-purple-300">{job.viewCount} views</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => router.push(`/jobs/${job.id}`)}
                            className="btn-premium px-6 py-3 rounded-xl border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300 font-medium backdrop-blur-sm"
                          >
                            🔍 View Details
                          </button>
                          {session?.user?.role === 'FREELANCER' && (
                            <button
                              onClick={() => handleApplyToJob(job.id)}
                              className="btn-premium px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              🚀 Apply Now
                            </button>
                          )}
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
    </div>
  )
}
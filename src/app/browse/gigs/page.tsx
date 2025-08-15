'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, Star, Eye, ShoppingCart, Clock, User, Zap, Award } from 'lucide-react'

interface GigPackage {
  name: string
  description: string
  price: number
  deliveryTime: number
  revisions: number
  features: string[]
}

interface Gig {
  id: string
  title: string
  description: string
  deliverables: string[]
  packages: GigPackage[]
  gallery: string[]
  tags: string[]
  status: string
  viewCount: number
  orderCount: number
  rating: number
  freelancer: {
    id: string
    name: string
    username: string
    avatarUrl: string
    rating: number
    isVerified: boolean
    totalEarned: number
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

export default function BrowseGigsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  const [deliveryTime, setDeliveryTime] = useState('')

  useEffect(() => {
    fetchGigs()
    fetchCategories()
  }, [searchTerm, selectedCategory, priceMin, priceMax, sortBy, deliveryTime])

  const fetchGigs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        priceMin: priceMin,
        priceMax: priceMax,
        sortBy: sortBy,
        deliveryTime: deliveryTime,
        status: 'ACTIVE'
      })
      
      const response = await fetch(`/api/gigs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setGigs(data.gigs || [])
      }
    } catch (error) {
      console.error('Failed to fetch gigs:', error)
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

  const handlePurchaseGig = async (gigId: string, packageIndex: number = 0) => {
    if (!session?.user) {
      router.push('/')
      return
    }

    if (session.user.role !== 'HIRER') {
      alert('Only hirers can purchase gigs')
      return
    }

    router.push(`/gigs/${gigId}/purchase?package=${packageIndex}`)
  }

  const getStartingPrice = (packages: GigPackage[]) => {
    return Math.min(...packages.map(pkg => pkg.price))
  }

  const getFastestDelivery = (packages: GigPackage[]) => {
    return Math.min(...packages.map(pkg => pkg.deliveryTime))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceMin('')
    setPriceMax('')
    setDeliveryTime('')
    setSortBy('popular')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/20 dark:to-purple-950/10">
      {/* Premium Header */}
      <div className="nav-premium border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-premium bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 Elite Gigs Marketplace
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Discover world-class Web3 services • <span className="text-premium font-semibold">{gigs.length}</span> premium gigs available
              </p>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => router.push('/browse/jobs')} 
                className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-sm px-6 py-3"
              >
                💼 Browse Jobs
              </Button>
              <Button 
                onClick={() => router.push('/dashboard')}
                className="btn-premium px-6 py-3"
              >
                🏠 Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
          <div className="flex gap-10">
            {/* Premium Filters Sidebar */}
            <div className="w-80 space-y-8">
              <Card className="premium-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Filter className="h-4 w-4 text-white" />
                    </div>
                    Smart Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Enhanced Search */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      🔍 Search Gigs
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by title, skills..."
                        className="input-premium pl-12 h-12 text-base"
                      />
                    </div>
                  </div>

                  {/* Enhanced Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      🎯 Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full input-premium h-12 text-base appearance-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Enhanced Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      💰 Price Range
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="Min"
                        className="input-premium h-12"
                      />
                      <Input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="Max"
                        className="input-premium h-12"
                      />
                    </div>
                  </div>

                  {/* Enhanced Delivery Time */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      ⚡ Delivery Time
                    </label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="w-full input-premium h-12 text-base appearance-none cursor-pointer"
                    >
                      <option value="">Any Time</option>
                      <option value="1">⚡ Express (1 Day)</option>
                      <option value="3">🚀 Fast (3 Days)</option>
                      <option value="7">📅 Standard (1 Week)</option>
                      <option value="14">📋 Extended (2 Weeks)</option>
                      <option value="30">🏗️ Complex (1 Month)</option>
                    </select>
                  </div>

                  {/* Enhanced Sort By */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      📊 Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full input-premium h-12 text-base appearance-none cursor-pointer"
                    >
                      <option value="popular">🔥 Most Popular</option>
                      <option value="newest">✨ Newest First</option>
                      <option value="price_low">💵 Lowest Price</option>
                      <option value="price_high">💎 Highest Price</option>
                      <option value="rating">⭐ Highest Rated</option>
                      <option value="orders">🛒 Most Orders</option>
                    </select>
                  </div>

                  <Button 
                    onClick={clearFilters} 
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl font-semibold transition-all duration-300"
                  >
                    🔄 Clear Filters
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Quick Stats */}
              <Card className="premium-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-premium">📈 Marketplace Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="stat-premium py-4">
                    <div className="text-2xl font-bold text-premium mb-1">{gigs.length}</div>
                    <div className="text-sm text-muted-foreground">Active Gigs</div>
                  </div>
                  <div className="stat-premium py-4">
                    <div className="text-2xl font-bold text-premium mb-1">
                      ${gigs.length > 0 ? (gigs.reduce((sum, gig) => sum + getStartingPrice(gig.packages), 0) / gigs.length).toFixed(0) : '0'}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Price</div>
                  </div>
                  <div className="stat-premium py-4">
                    <div className="text-2xl font-bold text-premium mb-1">
                      {gigs.filter(gig => gig.rating >= 4.5).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Top Rated</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Gigs Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="loading-premium">
                    <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-lg font-medium text-muted-foreground">Loading premium gigs...</p>
                  </div>
                </div>
              ) : gigs.length === 0 ? (
                <Card className="premium-card">
                  <CardContent className="text-center py-20">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      <span className="text-4xl">🔍</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No gigs found</h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      No matching services found. Try adjusting your filters or explore different categories.
                    </p>
                    <Button 
                      onClick={clearFilters}
                      className="btn-premium px-8 py-3"
                    >
                      🔄 Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {gigs.map((gig, index) => (
                    <Card key={gig.id} className="premium-card group cursor-pointer" style={{animationDelay: `${index * 100}ms`}}>
                      <div 
                        className="relative overflow-hidden rounded-t-3xl"
                        onClick={() => router.push(`/gigs/${gig.id}`)}
                      >
                        {gig.gallery.length > 0 ? (
                          <img
                            src={gig.gallery[0]}
                            alt={gig.title}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-56 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center relative overflow-hidden">
                            <span className="text-white text-6xl z-10">{gig.category.icon}</span>
                            <div className="absolute inset-0 bg-black/20"></div>
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className="glass-premium text-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {gig.category.name}
                          </span>
                        </div>
                        {gig.rating >= 4.5 && (
                          <div className="absolute top-4 right-4">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                              <Award className="h-3.5 w-3.5" />
                              Elite
                            </span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-8">
                        {/* Premium Freelancer Info */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <img
                              src={gig.freelancer.avatarUrl || '/avatars/blockchain-architect.png'}
                              alt={gig.freelancer.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                            />
                            {gig.freelancer.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                              {gig.freelancer.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              {renderStars(gig.freelancer.rating)}
                              <span className="text-sm text-gray-500 font-medium">
                                ({gig.freelancer.rating.toFixed(1)})
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Premium Gig Title & Description */}
                        <h3 
                          className="font-bold text-xl text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight"
                          onClick={() => router.push(`/gigs/${gig.id}`)}
                        >
                          {gig.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-base mb-6 line-clamp-2 leading-relaxed">
                          {gig.description}
                        </p>

                        {/* Premium Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                          {gig.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="glass-premium text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        {/* Premium Stats */}
                        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-500" />
                            {gig.viewCount}
                          </div>
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4 text-green-500" />
                            {gig.orderCount}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            {getFastestDelivery(gig.packages)}d
                          </div>
                        </div>

                        {/* Premium Pricing & CTA */}
                        <div className="flex justify-between items-center pt-6 border-t border-white/10">
                          <div>
                            <span className="text-sm text-muted-foreground font-medium">Starting at</span>
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ${getStartingPrice(gig.packages)}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => router.push(`/gigs/${gig.id}`)}
                              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-gray-900 dark:text-white px-6 py-2.5"
                            >
                              👀 View Details
                            </Button>
                            {session?.user?.role === 'HIRER' && (
                              <Button
                                onClick={() => handlePurchaseGig(gig.id)}
                                className="btn-premium px-6 py-2.5"
                              >
                                🚀 Order Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
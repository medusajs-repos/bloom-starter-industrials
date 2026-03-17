import { Link, useLoaderData, useSearch } from "@tanstack/react-router"
import { HttpTypes } from "@medusajs/types"
import { ProductCard } from "@/components/product-card"
import { PublicProductCard } from "@/components/public-product-card"
import { MagnifyingGlass, Funnel, ChevronRight, Spinner } from "@medusajs/icons"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useCategories } from "@/lib/hooks/use-categories"
import { useProducts } from "@/lib/hooks/use-products"

interface StorePageData {
  products: HttpTypes.StoreProduct[]
  count: number
  region: HttpTypes.StoreRegion
  countryCode: string
}

export function StorePage() {
  const loaderData = useLoaderData({ strict: false }) as StorePageData | undefined
  const { products = [], count = 0, region, countryCode = "us" } = loaderData || {}
  const searchParams = useSearch({ strict: false }) as { category?: string } | undefined
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams?.category ?? null)
  const [sortOrder, setSortOrder] = useState("-created_at")
  const { isAuthenticated, isLoading } = useAuth()

  // Debounce search input for server-side queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])
  
  // Fetch categories dynamically
  const { data: categories = [] } = useCategories({
    queryParams: {
      include_ancestors_tree: false,
    },
  })

  // Public store page - uses loader data with client-side filtering and sorting
  const publicFilteredProducts = useMemo(() => products
    .filter(product => {
      const matchesSearch = !searchInput || 
        product.title?.toLowerCase().includes(searchInput.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchInput.toLowerCase())
      const matchesCategory = !selectedCategory || 
        product.categories?.some(cat => cat.id === selectedCategory)
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "title":
          return (a.title ?? "").localeCompare(b.title ?? "")
        case "-title":
          return (b.title ?? "").localeCompare(a.title ?? "")
        case "created_at":
          return (a.created_at ?? "").localeCompare(b.created_at ?? "")
        case "-created_at":
        default:
          return (b.created_at ?? "").localeCompare(a.created_at ?? "")
      }
    }), [products, searchInput, selectedCategory, sortOrder])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-8 lg:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
              <Link to={"/$countryCode" as string} params={{ countryCode }} className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">Equipment Catalog</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Equipment Catalog
            </h1>
            <p className="text-slate-300 max-w-2xl">
              Browse our selection of industrial equipment. Sign in to view pricing.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors cursor-pointer">
                <Funnel className="w-4 h-4" />
                Filters
              </button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="-created_at">Sort: Newest</option>
                <option value="created_at">Sort: Oldest</option>
                <option value="title">Name: A-Z</option>
                <option value="-title">Name: Z-A</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                !selectedCategory 
                  ? "bg-teal-600 text-white" 
                  : "bg-white border border-gray-200 text-gray-600 hover:border-teal-600 hover:text-teal-600"
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button 
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === category.id 
                    ? "bg-teal-600 text-white" 
                    : "bg-white border border-gray-200 text-gray-600 hover:border-teal-600 hover:text-teal-600"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {publicFilteredProducts.length} products
            </p>
            <Link
              to={"/$countryCode/account/login" as string} params={{ countryCode }}
              className="text-xs font-medium text-teal-600 hover:text-teal-700"
            >
              Sign in for pricing
            </Link>
          </div>

          {/* Product Grid */}
          {publicFilteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {publicFilteredProducts.map((product, index) => (
                <PublicProductCard
                  key={product.id}
                  product={product}
                  isNew={index < 2}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MagnifyingGlass className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No products found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchInput 
                  ? `No results for "${searchInput}".`
                  : "No products available."
                }
              </p>
              {searchInput && (
                <button 
                  onClick={() => setSearchInput("")}
                  className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Product count footer */}
          {publicFilteredProducts.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Showing {publicFilteredProducts.length} products
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <section className="bg-slate-900 py-10 mt-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              Create a business account to access fleet pricing and request quotes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={"/$countryCode/account/register" as string} params={{ countryCode }}
                className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
              >
                Create Account
              </Link>
              <Link
                to={"/$countryCode/account/login" as string} params={{ countryCode }}
                className="px-5 py-2.5 border-2 border-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Use infinite query for authenticated users
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
  } = useProducts({
    query_params: {
      limit: 24,
      fields: "*variants.calculated_price,*categories,*images",
      order: sortOrder,
      ...(selectedCategory && { category_id: [selectedCategory] }),
      ...(debouncedSearch && { q: debouncedSearch }),
    },
    region_id: region?.id,
  })

  // Flatten products from all pages
  const allProducts = infiniteData?.pages.flatMap((page) => page.products) ?? []
  const totalCount = infiniteData?.pages[0]?.count ?? 0

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [handleObserver])

  // Authenticated store page layout (existing dashboard style)
  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="p-8">
        {/* Page Title & Search */}
        <div className="mb-6">
          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
              <option value="-created_at">Sort: Newest</option>
              <option value="created_at">Sort: Oldest</option>
              <option value="title">Name: A-Z</option>
              <option value="-title">Name: Z-A</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer transition-colors ${
              !selectedCategory 
                ? "bg-accent text-white" 
                : "bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent"
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button 
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === category.id 
                  ? "bg-accent text-white" 
                  : "bg-surface border border-border text-text-secondary hover:border-accent hover:text-accent"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-lg border border-border overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : allProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {allProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  regionId={region?.id || ""}
                  countryCode={countryCode}
                />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex items-center gap-2 text-text-secondary">
                  <Spinner className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              ) : hasNextPage ? (
                <p className="text-sm text-text-muted">Scroll for more</p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlass className="w-8 h-8 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">No products found</h3>
            <p className="text-text-secondary mb-6">
              {searchInput 
                ? `No results for "${searchInput}". Try a different search term.`
                : "No products are currently available."
              }
            </p>
            {searchInput && (
              <button 
                onClick={() => { setSearchInput(""); setDebouncedSearch("") }}
                className="px-5 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StorePage

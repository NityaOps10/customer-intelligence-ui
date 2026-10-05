import React, { useEffect, useMemo, useState } from 'react';
import { 
  Search, 
  Filter, 
  Menu, 
  RotateCcw, 
  AlertCircle, 
  ChevronDown,
  ArrowLeft,
  Upload
} from 'lucide-react';
import { Insight } from './types.ts';
import { getInsights, getProducts, uploadDataset, setActiveDatasetId, getDatasetStatus, ProductCard } from './api.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { InsightCard } from './components/InsightCard.tsx';
import { EvidenceDrawer } from './components/EvidenceDrawer.tsx';
import { SkeletonCard } from './components/SkeletonCard.tsx';
import { ProductCards } from './components/ProductCards.tsx';
import { MarketingPanel } from './components/MarketingPanel.tsx';
import { UploadModal, type UploadPayload } from './components/UploadModal.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

function CustomerIntelligenceApp() {
  // Product cards page
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [productTab, setProductTab] = useState<'insights' | 'marketing'>('insights');

  // Upload form and analysis progress
  const [uploadOpen, setUploadOpen] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const handleUpload = async (payload: UploadPayload) => {
    const result = await uploadDataset(payload);
    setActiveDatasetId(result.dataset_id);
    setSelectedProduct(null);
    setInsights([]);
    await loadProductsData();
    setAnalysisError(null);
    setAnalysisStage('tagging');
  };

  // Insights for the chosen product
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [selectedAspect, setSelectedAspect] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rate-desc' | 'rate-asc' | 'count-desc' | 'count-asc' | 'claim'>('count-desc');
  const [hideLowData, setHideLowData] = useState<boolean>(false);

  // Selected Insight for Evidence Drawer
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Mobile sidebar open state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const loadProductsData = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const loadInsightsData = async (product: string | null = selectedProduct) => {
    if (!product) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getInsights(product);
      setInsights(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer insights');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedAspect('all');
    setSelectedSentiment('all');
    setSearchQuery('');
    setHideLowData(false);
  };

  // Load the product cards once
  useEffect(() => {
    loadProductsData();
  }, []);

  // Watch the analysis that runs after an upload
  useEffect(() => {
    if (analysisStage !== 'tagging' && analysisStage !== 'building') return;
    const timer = setInterval(async () => {
      try {
        const s = await getDatasetStatus();
        if (s.stage === 'done') {
          setAnalysisStage('done');
          loadProductsData();
        } else if (s.stage === 'error') {
          setAnalysisStage('error');
          setAnalysisError(s.error || 'The analysis failed.');
        } else if (s.stage === 'tagging' || s.stage === 'building') {
          setAnalysisStage(s.stage);
        }
      } catch {
        // a missed check is fine, the next one will retry
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [analysisStage]);

  // Load insights whenever a different product is chosen
  useEffect(() => {
    if (selectedProduct) {
      resetFilters();
      setInsights([]);
      loadInsightsData(selectedProduct);
    }
  }, [selectedProduct]);

  const handleSelectProduct = (productFamily: string) => {
    setProductTab('insights');
    setSelectedProduct(productFamily);
  };

  const handleBackToProducts = () => {
    setDrawerOpen(false);
    setSelectedInsight(null);
    setSelectedProduct(null);
  };

  // Compute counts for sidebar
  const aspectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    insights.forEach((item) => {
      counts[item.aspect] = (counts[item.aspect] || 0) + 1;
    });
    return counts;
  }, [insights]);

  const sentimentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    insights.forEach((item) => {
      counts[item.sentiment] = (counts[item.sentiment] || 0) + 1;
    });
    return counts;
  }, [insights]);

  // Filtered & sorted insights
  const filteredInsights = useMemo(() => {
    return insights.filter((item) => {
      if (selectedAspect !== 'all' && item.aspect.toLowerCase() !== selectedAspect.toLowerCase()) {
        return false;
      }
      if (selectedSentiment !== 'all' && item.sentiment.toLowerCase() !== selectedSentiment.toLowerCase()) {
        return false;
      }
      if (hideLowData && item.low_data) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesClaim = item.claim.toLowerCase().includes(query);
        const matchesAspect = item.aspect.toLowerCase().includes(query);
        const matchesSentiment = item.sentiment.toLowerCase().includes(query);
        if (!matchesClaim && !matchesAspect && !matchesSentiment) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'rate-desc') return Number(b.rate) - Number(a.rate);
      if (sortBy === 'rate-asc') return Number(a.rate) - Number(b.rate);
      if (sortBy === 'count-desc') return b.count - a.count;
      if (sortBy === 'count-asc') return a.count - b.count;
      if (sortBy === 'claim') return a.claim.localeCompare(b.claim);
      return 0;
    });
  }, [insights, selectedAspect, selectedSentiment, hideLowData, searchQuery, sortBy]);

  const isFiltered =
    selectedAspect !== 'all' ||
    selectedSentiment !== 'all' ||
    searchQuery.trim() !== '' ||
    hideLowData;

  const handleSelectInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const totalMentions = useMemo(() => {
    return insights.reduce((acc, curr) => acc + curr.count, 0);
  }, [insights]);

  const lowDataCount = useMemo(() => {
    return insights.filter((i) => i.low_data).length;
  }, [insights]);

  const inProductView = selectedProduct !== null;
  const showInsightsTab = inProductView && productTab === 'insights';
  const showMarketingTab = inProductView && productTab === 'marketing';

  return (
    <div className="min-h-screen bg-zinc-100/70 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800">
      {/* LEFT SIDEBAR (only inside a product) */}
      {inProductView && (
        <Sidebar
          selectedAspect={selectedAspect}
          onSelectAspect={setSelectedAspect}
          selectedSentiment={selectedSentiment}
          onSelectSentiment={setSelectedSentiment}
          aspectCounts={aspectCounts}
          sentimentCounts={sentimentCounts}
          totalCount={insights.length}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onRefresh={() => loadInsightsData()}
          isRefreshing={loading}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {inProductView && (
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </button>
            )}
            {inProductView && (
              <button
                type="button"
                onClick={handleBackToProducts}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>All products</span>
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                {inProductView ? selectedProduct : 'Customer Intelligence'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                {inProductView
                  ? 'What customers say about this product, with the reviews behind every claim'
                  : 'Pick a product to see what customers like and what they complain about'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs">
            <button
              type="button"
              onClick={() => setUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              <Upload size={13} />
              <span>Upload data</span>
            </button>

            {showInsightsTab && (
              <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 font-mono text-[11px]">
                <div>
                  <span className="text-zinc-400">Total:</span>{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{insights.length} claims</span>
                </div>
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <div>
                  <span className="text-zinc-400">Mentions:</span>{' '}
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalMentions}</span>
                </div>
                {lowDataCount > 0 && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">·</span>
                    <div className="text-amber-600 dark:text-amber-400 font-sans">
                      {lowDataCount} low data
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={() => (inProductView ? loadInsightsData() : loadProductsData())}
              disabled={inProductView ? loading : productsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors disabled:opacity-50"
              title="Refresh from the backend"
            >
              <RotateCcw size={13} className={(inProductView ? loading : productsLoading) ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* ANALYSIS PROGRESS BANNER */}
        {analysisStage && (
          <div
            className={`px-4 sm:px-6 py-2.5 text-xs flex items-center justify-between gap-3 border-b ${
              analysisStage === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
                : analysisStage === 'done'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {(analysisStage === 'tagging' || analysisStage === 'building') && (
                <RotateCcw size={12} className="animate-spin" />
              )}
              {analysisStage === 'error' && <AlertCircle size={13} />}
              <span>
                {analysisStage === 'tagging' && 'Reading your reviews and tagging what customers talk about. This takes a minute or two.'}
                {analysisStage === 'building' && 'Building insights from the tagged reviews...'}
                {analysisStage === 'done' && 'Analysis finished. Your insights are ready.'}
                {analysisStage === 'error' && `Analysis failed: ${analysisError}`}
              </span>
            </div>
            {(analysisStage === 'done' || analysisStage === 'error') && (
              <button
                type="button"
                onClick={() => setAnalysisStage(null)}
                className="underline underline-offset-2 hover:no-underline"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* PRODUCT CARDS PAGE */}
        {!inProductView && (
          <section className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <ProductCards
              products={products}
              loading={productsLoading}
              error={productsError}
              onSelect={handleSelectProduct}
              onRetry={loadProductsData}
            />
          </section>
        )}

        {/* PRODUCT TABS */}
        {inProductView && (
          <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setProductTab('insights')}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                productTab === 'insights'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Insights
            </button>
            <button
              type="button"
              onClick={() => setProductTab('marketing')}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                productTab === 'marketing'
                  ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              Marketing ideas
            </button>
          </nav>
        )}

        {/* PRODUCT DETAIL: marketing ideas */}
        {showMarketingTab && selectedProduct && (
          <section className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            <MarketingPanel product={selectedProduct} />
          </section>
        )}

        {/* PRODUCT DETAIL: filters */}
        {showInsightsTab && (
          <section className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search claims by keyword (e.g. price, quality, support)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedAspect}
                    onChange={(e) => setSelectedAspect(e.target.value)}
                    className="appearance-none text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer"
                    aria-label="Filter by aspect"
                  >
                    <option value="all">All Aspects</option>
                    <option value="delivery">Delivery</option>
                    <option value="price">Price</option>
                    <option value="quality">Quality</option>
                    <option value="support">Support</option>
                    <option value="onboarding">Onboarding</option>
                    <option value="packaging">Packaging</option>
                    <option value="usability">Usability</option>
                    <option value="reliability">Reliability</option>
                    <option value="features">Features</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                </div>

                <div className="relative">
                  <select
                    value={selectedSentiment}
                    onChange={(e) => setSelectedSentiment(e.target.value)}
                    className="appearance-none text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer"
                    aria-label="Filter by sentiment"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="negative">Negative</option>
                    <option value="positive">Positive</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none text-xs rounded-md bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 pl-2.5 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-400 cursor-pointer"
                    aria-label="Sort insights"
                  >
                    <option value="count-desc">Most Mentions</option>
                    <option value="count-asc">Least Mentions</option>
                    <option value="rate-desc">Highest Rate</option>
                    <option value="rate-asc">Lowest Rate</option>
                    <option value="claim">Claim Name</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                </div>

                {isFiltered && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <RotateCcw size={11} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <div className="flex items-center gap-2">
                <span>
                  Showing <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{filteredInsights.length}</strong> of {insights.length} insights
                </span>
                {isFiltered && (
                  <span className="text-[11px] font-mono text-zinc-400">(filtered)</span>
                )}
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  checked={hideLowData}
                  onChange={(e) => setHideLowData(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span>Hide low data items</span>
              </label>
            </div>
          </section>
        )}

        {/* PRODUCT DETAIL: insights grid */}
        {showInsightsTab && (
          <section className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {loading && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                  <RotateCcw size={12} className="animate-spin text-zinc-400" />
                  <span>Loading insights...</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))}
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="my-8 max-w-xl mx-auto p-6 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 text-center space-y-3">
                <AlertCircle size={32} className="mx-auto text-rose-500" />
                <h3 className="text-base font-semibold">Failed to fetch insights</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 max-w-md mx-auto">{error}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => loadInsightsData()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-xs"
                  >
                    <RotateCcw size={13} />
                    <span>Retry Request</span>
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && filteredInsights.length === 0 && (
              <div className="my-12 max-w-md mx-auto p-8 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3">
                <Filter size={32} className="mx-auto text-zinc-400 dark:text-zinc-600" />
                <h3 className="text-base font-medium text-zinc-900 dark:text-zinc-100">
                  No matching insights found
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isFiltered
                    ? 'No claims match your selected aspect, sentiment, or search criteria. Try clearing some filters.'
                    : 'No insights have been generated for this product yet.'}
                </p>
                {isFiltered && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs"
                    >
                      <RotateCcw size={12} />
                      <span>Reset All Filters</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading && !error && filteredInsights.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isSelected={selectedInsight?.id === insight.id && drawerOpen}
                      onClick={() => handleSelectInsight(insight)}
                    />
                  ))}
                </div>

                <div className="pt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  <span>Click any insight card to open the supporting customer evidence drawer</span>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* UPLOAD MODAL */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSubmit={handleUpload}
      />

      {/* EVIDENCE DRAWER */}
      <EvidenceDrawer
        insight={selectedInsight}
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CustomerIntelligenceApp />
    </ThemeProvider>
  );
}
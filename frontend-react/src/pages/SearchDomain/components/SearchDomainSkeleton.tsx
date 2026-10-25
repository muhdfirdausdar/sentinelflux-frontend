interface SearchDomainSkeletonProps {
  /** Number of table rows to display (default: 5) */
  rows?: number;
  /** Additional className for styling */
  className?: string;
  /** Whether to show the skeleton */
  isLoading?: boolean;
}

function SearchDomainSkeleton({ 
  rows = 5, 
  className = "",
  isLoading = true 
}: SearchDomainSkeletonProps) {
  
  if (!isLoading) return null;

  return (
    <div className={`w-full space-y-6 p-4 ${className}`}>
      {/* Page Header Skeleton */}
      <div className="space-y-3">
        <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="w-96 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Search Controls Skeleton */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="w-full max-w-md h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        
        {/* Column Selection */}
        <div className="w-52 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>

      {/* Table Rows Skeleton - 5 rectangular rows */}
      <div className="w-full space-y-2">
        {/* Table Header (desktop only) */}
        <div className="hidden md:block w-full h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse border" />
        
        {/* Use individual divs for better control */}
        <div className="space-y-2">
          {Array.from({ length: rows }, (_, index) => (
            <div 
              key={index}
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse
                         h-16 sm:h-14 md:h-12 lg:h-12 xl:h-12
                         transition-all duration-200"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
        </div>
      </div>

      {/* Pagination Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        {/* Results count */}
        <div className="w-40 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        
        {/* Pagination buttons */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default SearchDomainSkeleton;

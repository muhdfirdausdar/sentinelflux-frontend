import { Skeleton } from "@/components/ui/skeleton";

function StatsLoadingSkeleton() {
    return (
        <div className='flex flex-col gap-8 items-center p-4 lg:p-8 bg-[var(--section-container)] rounded-lg m-2 md:m-14 w-[98vw] h-auto lg:h-auto'>
            {/* Header skeleton */}
            <div className="flex flex-col items-center gap-4 w-full">
                <Skeleton className="h-6 w-96 max-w-full" />
                <Skeleton className="h-4 w-48" />
            </div>
            
            {/* Main content skeleton */}
            <div className='flex flex-col lg:flex-row gap-0 w-full h-full'>
                {/* Number cards skeleton - Left side */}
                <div className="flex flex-row flex-wrap w-full gap-2 lg:w-2/5 lg:gap-4 h-auto justify-center">
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton 
                            key={index}
                            className="h-24 w-40 md:w-44 lg:w-48 rounded-lg" 
                        />
                    ))}
                </div>
                
                {/* Charts skeleton - Right side */}
                <div className="flex flex-col lg:flex-row w-full lg:w-3/5 lg:h-full h-auto lg:pt-0 pt-4">
                    {/* Radial charts skeleton */}
                    <div className="flex flex-row lg:flex-col flex-wrap gap-2 lg:gap-4 items-center justify-center">
                        <Skeleton className="w-48 h-48 lg:w-56 lg:h-56 rounded-full" />
                        <Skeleton className="w-48 h-48 lg:w-56 lg:h-56 rounded-full" />
                    </div>
                    
                    {/* Pie charts skeleton */}
                    <div className="w-full h-full gap-4 flex flex-row flex-wrap lg:flex-col lg:flex-row items-center lg:pt-0 pt-4 justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="w-65 h-65 lg:w-90 lg:h-90 rounded-lg" />
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="w-65 h-65 lg:w-90 lg:h-90 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatsLoadingSkeleton;

import { Skeleton } from "@/components/ui/skeleton";

function StatsSkeleton() {
    return (
        <div className="w-full p-6 space-y-8">
            {/* Header Section with timestamp */}
            <div className="text-center space-y-3 animate-pulse">
                <Skeleton className="h-8 w-[500px] max-w-full mx-auto rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted" 
                    style={{ animationDelay: '0ms' }} />
                <Skeleton className="h-5 w-[280px] max-w-full mx-auto rounded-md" 
                    style={{ animationDelay: '100ms' }} />
            </div>

            {/* Top Stats Cards - 6 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div 
                        key={`stat-${i}`}
                        className="relative overflow-hidden rounded-xl bg-card border p-5 space-y-2 group hover:shadow-lg transition-all duration-300"
                        style={{ 
                            animationDelay: `${i * 80}ms`,
                            animation: 'fadeIn 0.6s ease-out forwards',
                            opacity: 0
                        }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                            style={{ animationDelay: `${i * 150}ms` }} />
                        
                        <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-br from-primary/20 to-primary/5" />
                        <Skeleton className="h-4 w-3/4 mx-auto rounded-md" />
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Two Radial Charts */}
                {[0, 1].map((i) => (
                    <div 
                        key={`radial-${i}`}
                        className="relative overflow-hidden rounded-xl bg-card border p-6 space-y-4 group hover:shadow-lg transition-all duration-300"
                        style={{ 
                            animationDelay: `${(i + 6) * 80}ms`,
                            animation: 'fadeIn 0.6s ease-out forwards',
                            opacity: 0
                        }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                            style={{ animationDelay: `${(i + 6) * 150}ms` }} />
                        
                        {/* Chart circle */}
                        <div className="flex items-center justify-center">
                            <Skeleton className="h-40 w-40 rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative">
                                <div className="absolute inset-4 rounded-full bg-card" />
                            </Skeleton>
                        </div>
                        
                        {/* Label */}
                        <Skeleton className="h-4 w-3/4 mx-auto rounded-md" />
                    </div>
                ))}

                {/* Two Pie Charts */}
                {[0, 1].map((i) => (
                    <div 
                        key={`pie-${i}`}
                        className="relative overflow-hidden rounded-xl bg-card border p-6 space-y-4 group hover:shadow-lg transition-all duration-300"
                        style={{ 
                            animationDelay: `${(i + 8) * 80}ms`,
                            animation: 'fadeIn 0.6s ease-out forwards',
                            opacity: 0
                        }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" 
                            style={{ animationDelay: `${(i + 8) * 150}ms` }} />
                        
                        {/* Legend dots */}
                        <div className="flex justify-center gap-4 mb-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16 rounded-sm" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <Skeleton className="h-3 w-16 rounded-sm" />
                            </div>
                        </div>

                        {/* Pie chart circle */}
                        <div className="flex items-center justify-center">
                            <Skeleton className="h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20" />
                        </div>
                        
                        {/* Title */}
                        <Skeleton className="h-5 w-2/3 mx-auto rounded-md" />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shimmer {
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}

export default StatsSkeleton;
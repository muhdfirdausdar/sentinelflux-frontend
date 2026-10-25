// React import not required with modern JSX transform
import { useMemo, useState, useEffect } from 'react';
import NumberCard from './stats-comp/number-card';
import { RadialChart } from '@/pages/Home/stats-comp/radial-chart';
import { PieChartComponent } from '@/components/ui/pie-chart-memo';
import StatsSkeleton from './stats-skeleton';
import { 
  useDNSLookups,
  useTotalTasks,
  useUniqueDomains,
  useUniqueNameservers,
  useUniqueIPs,
  useTotalSources,
  useUniqueMaliciousDomains,
  useUniqueFastfluxDomains,
  useSingleFlux,
  useNameFlux,
  useDoubleFlux,
  useDomainsWith3IPsChange,
  useDomainsWith4IPsChange,
  useDomainsWith5IPsChange,
  useMetricsLastUpdated,
  useMetricsData
} from './useMetrics';

// Static configuration objects to prevent re-creation on every render
const PIECHART_DESIGN = {
    metrics : {label: "domains  : "},
    single_flux: {label: "Single Flux", color: "var(--chart-1)"},
    name_flux: {label: "Name Flux", color: "var(--chart-2)"},
    double_flux: {label: "Double Flux", color: "var(--chart-3)"}
};

const IP_REUSE_DESIGN = {
    metrics : {label: "domains  : "},
    three_ips_change: {label: "3 IPs", color: "var(--chart-1)"},
    four_ips_change: {label: "4 IPs", color: "var(--chart-2)"},
    five_ips_change: {label: "5 or Above IPs", color: "var(--chart-3)"}
};





// legacy static fallbacks removed — dynamic selectors are used instead

function Stats() {
    // Start shared poller
    const metricsData = useMetricsData();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Check if we have real data (not fallback)
    useEffect(() => {
        if (metricsData?.data) {
            // Add a small delay to show the skeleton animation smoothly
            const timer = setTimeout(() => {
                setIsInitialLoad(false);
            }, 1200); // 1.2 seconds to showcase the skeleton
            return () => clearTimeout(timer);
        }
    }, [metricsData]);

    // Use individual metric hooks instead of selectors
    const dns_lookups = useDNSLookups();
    const total_tasks = useTotalTasks();
    const unique_domains = useUniqueDomains();
    const unique_ns = useUniqueNameservers();
    const unique_ips = useUniqueIPs();
    const total_sources = useTotalSources();
    const unique_malicious_domains = useUniqueMaliciousDomains();
    const unique_fastflux_domains = useUniqueFastfluxDomains();
    const single_flux = useSingleFlux();
    const name_flux = useNameFlux();
    const double_flux = useDoubleFlux();
    const domains_with_3_ips_change = useDomainsWith3IPsChange();
    const domains_with_4_ips_change = useDomainsWith4IPsChange();
    const domains_with_5_ips_change = useDomainsWith5IPsChange();

    // console.log('Current metrics:', {
    //     dns_lookups,
    //     unique_domains,
    //     running: sseStatus.running,
    //     unique_malicious_domains
    // });

    // normalize *_flux and domains_* fields: if null or 0, use 1 to avoid
    // zero-values that can break ratios or charts.
    const singleFluxVal = (single_flux == null || single_flux === 0) ? 1 : single_flux;
    const nameFluxVal = (name_flux == null || name_flux === 0) ? 1 : name_flux;
    const doubleFluxVal = (double_flux == null || double_flux === 0) ? 1 : double_flux;


    
    const domains3Val = (domains_with_3_ips_change == null || domains_with_3_ips_change === 0) ? 1 : domains_with_3_ips_change;
    const domains4Val = (domains_with_4_ips_change == null || domains_with_4_ips_change === 0) ? 1 : domains_with_4_ips_change;
    const domains5Val = (domains_with_5_ips_change == null || domains_with_5_ips_change === 0) ? 1 : domains_with_5_ips_change;

    const mal_domain = useMemo(() => ({
        domains: Math.floor((unique_malicious_domains / Math.max(1, unique_domains)) * 100),
        fill: "var(--chart-1)",
        total: 100,
    }), [unique_malicious_domains, unique_domains]);

    const fastflux = useMemo(() => ({
        domains: Math.floor((unique_fastflux_domains / Math.max(1, unique_domains)) * 100),
        fill: "var(--chart-1)",
        total: 100,
    }), [unique_fastflux_domains, unique_domains]);

    const piechart_data_dynamic = useMemo(() => [
        { name: "Single Flux", metrics: singleFluxVal, fill: "var(--chart-3)" },
        { name: "Name Flux", metrics: nameFluxVal, fill: "var(--chart-2)" },
        { name: "Double Flux", metrics: doubleFluxVal, fill: "var(--chart-1)" },
    ], [singleFluxVal, nameFluxVal, doubleFluxVal]);

    const ip_reuse_data_dynamic = useMemo(() => [
        { name: "3 IPs", metrics: domains3Val, fill: "var(--chart-1)" },
        { name: "4 IPs", metrics: domains4Val, fill: "var(--chart-2)" },
        { name: "5 or Above IPs", metrics: domains5Val, fill: "var(--chart-3)" },
    ], [domains3Val, domains4Val, domains5Val]);

    const lastUpdated = useMetricsLastUpdated();
    const lastUpdatedText = lastUpdated ? new Date(lastUpdated).toLocaleString() : '—';

    // Show skeleton during initial load
    if (isInitialLoad) {
        return <StatsSkeleton />;
    }

    return (
        <div className='relative flex flex-col gap-8 items-center p-4 lg:p-8 bg-gradient-to-br from-[var(--section-container)] via-[var(--section-container)] to-[var(--section-container)]/90 rounded-2xl m-2 md:m-14 w-[98vw] h-auto lg:h-auto shadow-2xl border border-border/50 overflow-hidden' >
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col gap-8 items-center w-full">
                {/* Header with enhanced styling */}
                <div className="flex flex-col gap-3 items-center animate-fadeIn">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-primary to-primary rounded-full animate-pulse" />
                        <h2 className='font-bold text-base text-center md:text-lg lg:text-2xl bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text'>
                            Real-time insights from our ongoing Fast Flux analysis pipeline
                        </h2>
                        <div className="h-1 w-12 bg-gradient-to-r from-primary to-transparent rounded-full animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border/50 backdrop-blur-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <p className='text-xs md:text-sm text-[var(--muted-foreground)]'>
                            Last updated: <span className="font-semibold text-foreground">{lastUpdatedText}</span>
                        </p>
                    </div>
                </div>

                <div className='flex flex-col gap-4 lg:gap-6 w-full h-full'>
                    {/* Stats cards with staggered animation */}
                    <div className="flex flex-row flex-wrap w-full gap-2 lg:gap-2 xl:gap-3 2xl:gap-4 h-auto justify-center items-start">
                        <NumberCard title="DNS Lookup Performed Today" value={dns_lookups} index={0} />
                        <NumberCard title="Tasks in Processing Queue" value={total_tasks} index={1} />
                        <NumberCard title="Unique Domains Analyzed" value={unique_domains} index={2} />
                        <NumberCard title="Unique Nameservers Observed" value={unique_ns} index={3} />
                        <NumberCard title="Unique IPs Observed" value={unique_ips} index={4} />
                        <NumberCard title="Total Data Sources" value={total_sources} index={5} />
                    </div>
                {/* Charts section with enhanced styling */}
                <div className="flex flex-col lg:flex-row lg:flex-wrap w-full lg:h-full h-auto pt-4 lg:pt-0 gap-4 lg:gap-6 items-center justify-center">
                    {/* Radial Charts */}
                    <div className="flex flex-row flex-wrap gap-2 lg:gap-4 items-center justify-center w-full lg:w-auto">
                        <div className="group w-70 h-64 max-w-xs lg:max-w-md aspect-square min-w-[180px] min-h-[180px] flex items-center justify-center animate-fadeIn hover:scale-105 transition-transform duration-300" style={{ animationDelay: '400ms' }}>
                            <RadialChart
                                data={[mal_domain]}
                                valueKey="domains"
                                totalKey='total'
                                label="%"
                                footerPrimary={<>
                                    of Analyzed Domains are Malicious <br />  &#91; {unique_malicious_domains} &#93;
                                </>}
                                footerSecondary=""
                                barColor="var(--chart-1)"
                                containerClassName="bg-gradient-to-br from-[var(--section-children)] to-[var(--section-children)]/80 items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-2 md:p-6 w-full h-full mx-2 border-2 border-border/30 hover:border-primary/30"
                                contentClassName="p-0 aspect-square flex items-center justify-center w-45 h-45"
                                labelClassName="font-semibold tracking-wide w-70 text-xl text-center md:text-4xl"
                            />
                        </div>
                        <div className="group w-70 h-64 max-w-xs lg:max-w-md aspect-square min-w-[180px] min-h-[180px] flex items-center justify-center animate-fadeIn hover:scale-105 transition-transform duration-300" style={{ animationDelay: '500ms' }}>
                            <RadialChart
                                data={[fastflux]}
                                valueKey="domains"
                                totalKey='total'
                                label="%"
                                footerPrimary={<>
                                    of Analyzed Domains are Fast Flux <br /> &#91; {unique_fastflux_domains} &#93;
                                </>}
                                footerSecondary=""
                                barColor="var(--chart-2)"
                                containerClassName="bg-gradient-to-br from-[var(--section-children)] to-[var(--section-children)]/80 items-center justify-center rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-2 md:p-6 w-full h-full mx-2 border-2 border-border/30 hover:border-secondary/30"
                                contentClassName="p-0 aspect-square flex items-center justify-center w-45 h-45"
                                labelClassName="font-semibold tracking-wide w-70 text-xl text-center md:text-4xl"
                            />
                        </div>
                    </div>
                    
                    {/* Pie Charts */}
                    <div className="w-full lg:w-auto h-full gap-4 flex flex-row flex-wrap items-center justify-center">
                        <div className="animate-fadeIn hover:scale-105 transition-transform duration-300" style={{ animationDelay: '600ms' }}>
                            <PieChartComponent PieChartConfig={PIECHART_DESIGN} dataKey="metrics" PieChartData={piechart_data_dynamic} className="flex flex-col w-65 h-65 lg:w-90 lg:h-90 bg-gradient-to-br from-[var(--section-children)] to-[var(--section-children)]/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 justify-center items-center border-2 border-border/30 hover:border-accent/30">
                                <div className="flex items-center justify-center">
                                    <p className='text-sm lg:text-base text-[var(--muted-foreground)] font-semibold'> Fast Flux Type Frequency </p>
                                </div>
                            </PieChartComponent>
                        </div>
                        <div className="animate-fadeIn hover:scale-105 transition-transform duration-300" style={{ animationDelay: '700ms' }}>
                            <PieChartComponent PieChartConfig={IP_REUSE_DESIGN} dataKey="metrics" PieChartData={ip_reuse_data_dynamic} className="flex flex-col w-65 h-65 lg:w-90 lg:h-90 bg-gradient-to-br from-[var(--section-children)] to-[var(--section-children)]/80 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 justify-center items-center border-2 border-border/30 hover:border-accent/30">
                                <div className="flex items-center justify-center">
                                    <p className='text-sm md:text-base text-[var(--muted-foreground)] font-semibold'> IP Reuse Frequency </p>
                                </div>
                            </PieChartComponent>  
                        </div>           
                    </div>

                </div>
            </div>
            </div>
            
            {/* Animation styles */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}


export default Stats;




// For reference, below is json response when fetching from stats or dnflux/metrics endpoint
/*
{
	"status": "good",
	"remark": "Periodic update",
	"data": {
		"ts": "2025-08-25T07:32:09.222958+00:00",
		"dns_lookups": 1970,
		"unique_domains": 29523,
		"unique_ns": 7383,
		"unique_ips": 24869,
		"total_tasks": 97,
		"total_sources": 4,
		"unique_malicious_domains": 27664,
		"unique_fastflux_domains": 0,
		"single_flux": 0,
		"name_flux": 0,
		"double_flux": 0,
		"domains_with_3_ips_change": 0,
		"domains_with_4_ips_change": 0,
		"domains_with_5_ips_change": 0,
		"fetch_timestamp": "2025-08-25T07:32:25.273540"
	}
}

*/
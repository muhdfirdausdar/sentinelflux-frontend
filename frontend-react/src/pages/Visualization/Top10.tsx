import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Top10.css';
import { useTop10Stats } from './Top10/getTop10';

const Top10 = () => {
    const { data, loading, error } = useTop10Stats();
    const location = useLocation();

    // Handle scrolling to hash anchor
    useEffect(() => {
        if (location.hash && !loading) {
            // Wait a bit for the content to render, then scroll
            const timer = setTimeout(() => {
                const id = location.hash.replace('#', '');
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [location.hash, loading]);

    if (loading) {
        return (
            <div className="top10-page">
                <header className="hero-section">
                    <div className="overlay">
                        <h1><span className="highlight">TOP 10</span> Things About Fast Flux</h1>
                        <p>Stay One Step Ahead: Know the Top 10 Fast Flux Elements Driving Cybercrime!</p>
                    </div>
                </header>
                <section className="container">
                    <div className="main-card">
                        <p style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>Loading Top 10 statistics...</p>
                    </div>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="top10-page">
                <header className="hero-section">
                    <div className="overlay">
                        <h1><span className="highlight">TOP 10</span> Things About Fast Flux</h1>
                        <p>Stay One Step Ahead: Know the Top 10 Fast Flux Elements Driving Cybercrime!</p>
                    </div>
                </header>
                <section className="container">
                    <div className="main-card">
                        <p style={{ color: '#ff2b2b', textAlign: 'center', padding: '40px' }}>Error: {error}</p>
                    </div>
                </section>
            </div>
        );
    }

    // Convert the data objects to arrays for easier rendering
    const countries = data?.top10_geoip ? Object.entries(data.top10_geoip).map(([rank, location]) => ({
        rank,
        country: formatCountryName(location.country),
        countryCode: getCountryCode(location.country)
    })) : [];

    const ipAddresses = data?.top10_ips ? Object.entries(data.top10_ips).map(([rank, ip]) => ({
        rank,
        ip
    })) : [];

    const nameServers = data?.top10_nameserver ? Object.entries(data.top10_nameserver).map(([rank, ns]) => ({
        rank,
        ns
    })) : [];

    return (
        <div className="top10-page">
            <header className="hero-section">
                <div className="overlay">
                    <h1><span className="highlight">TOP 10</span> Things About Fast Flux</h1>
                    <p>Stay One Step Ahead: Know the Top 10 Fast Flux Elements Driving Cybercrime!</p>
                </div>
            </header>

            <section className="container">
                {/* Top 10 Countries */}
                <div className="main-card" id="countries">
                    <div className="title-section">
                        <div className="icon">
                            <img src="/picture/SentinelFluxLogo1.png" alt="SentinelFlux Logo" />
                        </div>
                        <h2><span className="highlight">TOP 10</span> <span className="white">Fast Flux Countries</span></h2>
                        <p>Exploring the Global Landscape: The Top 10 Countries Leading in Fast Flux!</p>
                    </div>

                    <div className="countries">
                        <div className="column">
                            {countries.slice(0, 5).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span>
                                    {item.countryCode && (
                                        <img 
                                            src={`https://flagcdn.com/w40/${item.countryCode}.png`} 
                                            alt={`${item.country} flag`} 
                                        />
                                    )}
                                    {item.country}
                                </div>
                            ))}
                        </div>

                        <div className="column">
                            {countries.slice(5, 10).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span>
                                    {item.countryCode && (
                                        <img 
                                            src={`https://flagcdn.com/w40/${item.countryCode}.png`} 
                                            alt={`${item.country} flag`} 
                                        />
                                    )}
                                    {item.country}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Top 10 IP Addresses */}
                <div className="main-card" id="ips">
                    <div className="title-section">
                        <div className="icon">
                            <img src="/picture/SentinelFluxLogo1.png" alt="SentinelFlux Logo" />
                        </div>
                        <h2><span className="highlight">TOP 10</span> <span className="white">Fast Flux IP Address</span></h2>
                        <p>Stay Informed: The Top 10 Fast Flux IPs You Need to Watch!</p>
                    </div>

                    <div className="countries">
                        <div className="column">
                            {ipAddresses.slice(0, 5).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span> {item.ip}
                                </div>
                            ))}
                        </div>

                        <div className="column">
                            {ipAddresses.slice(5, 10).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span> {item.ip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Top 10 Name Servers */}
                <div className="main-card" id="nameservers">
                    <div className="title-section">
                        <div className="icon">
                            <img src="/picture/SentinelFluxLogo1.png" alt="SentinelFlux Logo" />
                        </div>
                        <h2><span className="highlight">TOP 10</span> <span className="white">Fast Flux Name Server</span></h2>
                        <p>Backbone of Fast Flux: Discover the Top 10 Name Servers Powering Cyber Threats!</p>
                    </div>

                    <div className="countries">
                        <div className="column">
                            {nameServers.slice(0, 5).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span> {item.ns}
                                </div>
                            ))}
                        </div>

                        <div className="column">
                            {nameServers.slice(5, 10).map((item) => (
                                <div className="country" key={item.rank}>
                                    <span className="rank">{item.rank}.</span> {item.ns}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Helper function to format country names for display
function formatCountryName(countryName: string): string {
    const nameMap: Record<string, string> = {
        'Korea (the Republic of)': 'Korea',
        'Korea, Republic of': 'Korea',
        'Republic of Korea': 'Korea',
        'United States of America': 'United States',
        'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
        'Russian Federation': 'Russia',
        'Viet Nam': 'Vietnam',
        'Iran (Islamic Republic of)': 'Iran',
        // Add more display name mappings as needed
    };

    return nameMap[countryName] || countryName;
}

// Helper function to convert country names to ISO country codes for flags
function getCountryCode(countryName: string): string {
    const countryMap: Record<string, string> = {
        'India': 'in',
        'Indonesia': 'id',
        'Russia': 'ru',
        'Russian Federation': 'ru',
        'Burkina Faso': 'bf',
        'Malaysia': 'my',
        'United States': 'us',
        'United States of America': 'us',
        'Australia': 'au',
        'Brazil': 'br',
        'Qatar': 'qa',
        'France': 'fr',
        'Ukraine': 'ua',
        'China': 'cn',
        'Germany': 'de',
        'United Kingdom': 'gb',
        'United Kingdom of Great Britain and Northern Ireland': 'gb',
        'Great Britain': 'gb',
        'England': 'gb',
        'Canada': 'ca',
        'Japan': 'jp',
        'South Korea': 'kr',
        'Korea (the Republic of)': 'kr',
        'Korea, Republic of': 'kr',
        'Republic of Korea': 'kr',
        'Netherlands': 'nl',
        'Singapore': 'sg',
        'Thailand': 'th',
        'Vietnam': 'vn',
        'Viet Nam': 'vn',
        'Philippines': 'ph',
        'Turkey': 'tr',
        'Poland': 'pl',
        'Spain': 'es',
        'Italy': 'it',
        'Mexico': 'mx',
        'Argentina': 'ar',
        'South Africa': 'za',
        'Egypt': 'eg',
        'Nigeria': 'ng',
        'Kenya': 'ke',
        'Ireland': 'ie',
        'Sweden': 'se',
        'Norway': 'no',
        'Denmark': 'dk',
        'Finland': 'fi',
        'Belgium': 'be',
        'Austria': 'at',
        'Switzerland': 'ch',
        'Portugal': 'pt',
        'Greece': 'gr',
        'Czech Republic': 'cz',
        'Czechia': 'cz',
        'Romania': 'ro',
        'Hungary': 'hu',
        'Bulgaria': 'bg',
        'Croatia': 'hr',
        'Slovakia': 'sk',
        'Slovenia': 'si',
        'Lithuania': 'lt',
        'Latvia': 'lv',
        'Estonia': 'ee',
        'Iceland': 'is',
        'Luxembourg': 'lu',
        'Malta': 'mt',
        'Cyprus': 'cy',
        'Taiwan': 'tw',
        'Hong Kong': 'hk',
        'Macao': 'mo',
        'New Zealand': 'nz',
        'Pakistan': 'pk',
        'Bangladesh': 'bd',
        'Sri Lanka': 'lk',
        'Myanmar': 'mm',
        'Cambodia': 'kh',
        'Laos': 'la',
        'Iran': 'ir',
        'Iran (Islamic Republic of)': 'ir',
        'Iraq': 'iq',
        'Saudi Arabia': 'sa',
        'United Arab Emirates': 'ae',
        'Israel': 'il',
        'Jordan': 'jo',
        'Lebanon': 'lb',
        'Syria': 'sy',
        'Yemen': 'ye',
        'Kuwait': 'kw',
        'Oman': 'om',
        'Bahrain': 'bh',
        'Morocco': 'ma',
        'Algeria': 'dz',
        'Tunisia': 'tn',
        'Libya': 'ly',
        'Sudan': 'sd',
        'Ethiopia': 'et',
        'Ghana': 'gh',
        'Tanzania': 'tz',
        'Uganda': 'ug',
        'Mozambique': 'mz',
        'Zimbabwe': 'zw',
        'Zambia': 'zm',
        'Angola': 'ao',
        'Chile': 'cl',
        'Peru': 'pe',
        'Colombia': 'co',
        'Venezuela': 've',
        'Ecuador': 'ec',
        'Bolivia': 'bo',
        'Paraguay': 'py',
        'Uruguay': 'uy',
        // Add more country mappings as needed
    };

    // Try exact match first
    if (countryMap[countryName]) {
        return countryMap[countryName];
    }

    // Try case-insensitive match
    const lowerCaseName = countryName.toLowerCase();
    for (const [key, value] of Object.entries(countryMap)) {
        if (key.toLowerCase() === lowerCaseName) {
            return value;
        }
    }

    // Log missing country for debugging
    console.warn(`Country code not found for: "${countryName}"`);
    return '';
}

export default Top10;

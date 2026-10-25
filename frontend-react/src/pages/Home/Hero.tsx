import GeoGlobe from "./geo-globe/GeoGlobe";
import { useMediaQuery } from "react-responsive";
import LinkButton from "@/components/ui/link-button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";
import "./Hero.css";


function Hero() {
  // Responsive globe sizing based on Tailwind breakpoints
  const isLg = useMediaQuery({ minWidth: 1024 });
  const isMd = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  let globeWidth = 470, globeHeight = 490, globeMarginLeft = "ml-[480px]";
  if (isLg) {
    globeWidth = 520;
    globeHeight = 520;
    globeMarginLeft = "ml-[480px]";
  } else if (isMd) {
    globeWidth = 250;
    globeHeight = 260;
    globeMarginLeft = "ml-[270px]";
  } else {
    globeWidth = 200;
    globeHeight = 200;
    globeMarginLeft = "ml-[170px]";
  }

  return (
    <div className="hero w-full min-h-98 lg:min-h-170 bg-[var(--secondary-background)] relative flex items-center py-8">
      {/* Geo Globe Animation */}
      <div
        className="absolute left-0 top-1/2  lg:left-8 md:left-14 -translate-y-1/2 z-0"
        style={{ width: globeWidth, height: globeHeight }}
      >
        <GeoGlobe width={globeWidth} height={globeHeight} />
      </div>
      {/* Hero Text */}
      <div className={`w-full z-10 p-4 flex flex-col items-center gap-4 lg:gap-8`}>
        <div className="tagline flex mt-8 md:mt-12 lg:mt-16">
          <h1 className="text-center font-semibold md:text-md lg:text-2xl">Track the Past, Monitor the Present, Visualize the Threat
            <br />
            All in One Platform 
          </h1>
        </div>
        <p className="text-center text-sm lg:text-lg">A Tool for Fast Flux Analysis and Visualization is Here!</p>
        <p className="text-center text-xs hidden sm:block lg:text-sm">
          Leverage DNS insights and powerful visualizations to uncover Fast Flux activity.
          <br/>
          Supercharge your investigations with DNS intelligence and dynamic visual graphs.
        </p>
        <div className="mt-1.5 sm:mt-6 md:mt-4 flex flex-col sm:flex-row gap-3 sm:gap-[4vw] md:gap-[10vw] w-full sm:w-auto items-center">
          <LinkButton size="responsive" className="w-1/2 sm:w-auto" asChild>
            <Link to={ROUTES.FASTFLUXLOOKUP} className="text-xs md:text-sm lg:text-base">Track History</Link>
          </LinkButton>
          <LinkButton size="responsive" className="w-1/2 sm:w-auto" asChild>
            <Link to={ROUTES.SEARCH_DOMAIN} className="text-xs md:text-sm lg:text-base">Monitor Activity</Link>
          </LinkButton>
          <LinkButton size="responsive" className="w-1/2 sm:w-auto" asChild>
            <Link to={ROUTES.LIVEMAP} className="text-xs md:text-sm lg:text-base">Visualize Threat</Link>
          </LinkButton>
        </div>
        <div className="mt-2 sm:mt-4 mb-4 sm:mb-6 flex flex-col items-center gap-3 max-w-5xl mx-auto w-full px-4">
          <div className="relative group">
            {/* Subtle glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            
            {/* Main container */}
            <div className="relative bg-[rgba(30,41,59,0.6)] border border-[rgba(100,116,139,0.3)] rounded-2xl p-4 md:p-6 lg:p-8 w-full backdrop-blur-sm shadow-xl hover:border-[rgba(139,92,246,0.4)] transition-all duration-300">
              {/* Content */}
              <p className="text-center font-semibold mb-4">
                <span className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Curious about the 
                </span>
                <span className="text-2xl md:text-3xl lg:text-4xl text-white"> Dark Side</span>
                <span className="text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {" "}of DNS? 🔍
                </span>
              </p>
              <p className="text-center text-xs lg:text-sm text-gray-400 max-w-2xl mx-auto mb-6 leading-relaxed">
                Discover how cybercriminals use Fast Flux to evade detection and hide malicious infrastructure
              </p>
              <div className="flex justify-center">
                <LinkButton size="responsive" className="w-auto" asChild>
                  <Link to={ROUTES.ABOUT_FASTFLUX} className="text-xs md:text-sm lg:text-base px-6">Uncover the Secrets</Link>
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
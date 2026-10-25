import React from 'react';
import MobileNav from './MobileNav';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';   
import { X, Menu } from "lucide-react"
import { AnimatePresence, motion } from 'framer-motion';
// import { ModeToggle } from "@/components/mode-toggle"



import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"


const tools_items: { title: string; link: string; description: string }[] = [
  {
    title: "Auto DNS Dig",
    link: ROUTES.AUTODNSDIG,
    description: "Schedule and automate DNS queries for your chosen domains",
  },
  {
    title: "Fast Flux Lookup",
    link: ROUTES.FASTFLUXLOOKUP,
    description: "Search any domain for quick insights into potential Fast Flux activity and DNS behavior",
  },
];

const visualization_items: { title: string; link: string; description: string }[] = [
  {
    title: "Live Map",
    link: ROUTES.LIVEMAP,
    description: "Real-time visualization of active Fast Flux domains displayed on an interactive world map",
  },
  {
    title: "Top 10",
    link: ROUTES.TOP10,
    description: "Highlights the top 10 Fast Flux activity across categories such as domains, nameservers, and IPs",
  },
];

function Logo() {
  return (
    <div className="h-8 cursor-pointer flex items-center gap-2 flex-shrink-0 2xl:mr-1 mr-6 ">
      <img className="h-full w-auto object-contain shrink-0" src="/sentinelflux-nobg.png" alt="Logo" />
      <h2 className="text-lg font-bold text-[var(--foreground)]">SentinelFlux</h2>
    </div>
  )
}




function Nav() {
  // Only render the desktop nav on lg and up, mobile nav otherwise
  return (
    <>
      {/* Desktop Nav: hidden on <lg, block on lg+ */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>
      {/* Mobile Nav: block on <lg, hidden on lg+ */}
      <div className="block md:hidden">
        <MobileNav tools={tools_items}  visualization={visualization_items} />
      </div>
    </>
  );
}

// Extracted DesktopNav for clarity and reusability
function DesktopNav() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [isAnimating, setIsAnimating] = React.useState(false);

  function NavOpen() {
    return (
      <motion.div
        layout
        key="navopen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, opacity: { duration: 0.15 } }}
        onAnimationComplete={() => setIsAnimating(false)}
        style={{ position: 'fixed', zIndex: 50 }}
        className="top-3 left-1/2 -translate-x-1/2 backdrop-blur-xl px-6 py-3 shadow-xl rounded-2xl border border-[var(--nav-border)] w-full max-w-[90vw] md:w-auto z-50"
      >
        <div className="absolute inset-0 bg-[var(--nav-background)] rounded-2xl"></div>
        <NavigationMenu viewport={false}>
          <NavigationMenuList  className="whitespace-nowrap gap-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
              <NavigationMenuContent >
                <div className="flex flex-col min-w-[220px] p-2 bg-[var(--nav-background)] rounded-lg shadow-lg">
                  {tools_items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.link}
                      className="block px-4 py-2 rounded-md hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors cursor-pointer"
                    >
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Visualization</NavigationMenuTrigger>
              <NavigationMenuContent className="z-[60]">
                <div className="flex flex-col min-w-[220px] p-2 bg-[var(--nav-background)] rounded-lg shadow-lg">
                  {visualization_items.map((item) => (
                    <Link
                      key={item.title}
                      to={item.link}
                      className="block px-4 py-2 rounded-md hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors cursor-pointer"
                    >
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </Link>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem >
              <NavigationMenuLink asChild className=''>
                <Link to={ROUTES.HOME} >
                  <div>
                    <Logo />
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild className='ml-6'>
                <Link to={ROUTES.SEARCH_DOMAIN}>
                  Search Domain
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link to={ROUTES.ABOUT_US}>
                  About Us
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            {/*
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <div>
                  <ModeToggle />
                </div>
              </NavigationMenuLink>
            </NavigationMenuItem>
            */}
            <NavigationMenuItem>
              <div className='mx-2'>
                <div className="bg-gray-500/50 h-8 mx-1 w-2/5 rounded"></div>
              </div>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <button
                onClick={() => {
                  setIsAnimating(true);
                  setIsOpen(false);
                }}
                disabled={isAnimating}
                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </motion.div>
    );
  }

  function NavClose() {
    return (
      <motion.button
        key="navclose"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={() => {
          setIsAnimating(true);
          setIsOpen(true);
        }}
        onAnimationComplete={() => setIsAnimating(false)}
        disabled={isAnimating}
        className={`fixed top-4 right-3 z-50 p-3 rounded-full bg-[var(--nav-background)] shadow-xl border border-[var(--nav-border)] ${isAnimating ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Open navigation"
      >
        <Menu size={24} />
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isOpen && <NavOpen key="navopen" />}
      {!isOpen && <NavClose key="navclose" />}
    </AnimatePresence>
  );
}

export default Nav;

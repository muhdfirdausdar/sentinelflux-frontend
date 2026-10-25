import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { Link } from "react-router-dom";
// import { ModeToggle } from "../mode-toggle";
import { ROUTES } from "@/constants";
import { Separator } from "@radix-ui/react-dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type NavItem = {
  title: string;
  link: string;
  description: string;
};

type MobileNavProps = {
  tools: NavItem[];
  visualization: NavItem[];
};





function MobileNav({ tools, visualization }: MobileNavProps) {
	const [isOpen, setIsOpen] = React.useState(false);

	function MobileNavOpen() {
		return (
			<motion.div
				key="mobilenavopen"
				initial={{ x: "-100%" }}
				animate={{ x: 0 }}
				exit={{ x: "-100%" }}
				transition={{ duration: 0.15 }}
				className="fixed top-0 left-0 h-full w-[90vw] bg-[var(--mobile-nav-background)] shadow-xl z-50 flex flex-col"
			>

				<div className="flex-1 flex flex-col items-center justify-centerw-[90vw] mx-4 p-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 left-4 z-50 p-2 "
                        aria-label="Close navigation"
                    >
                        <X size={24} />
                    </button>
                    {/*
                    <div className="absolute top-4 right-4 z-50">
                        <ModeToggle />
                    </div>
                    */}
					<div className="flex flex-col gap-2 mx-6 my-6 pt-12 w-full h-full justify-items-start p-3">
                        <Link to={ROUTES.HOME} onClick={() => setIsOpen(false)}>
                            Home
                        </Link>
                        <Separator className="my-2 bg-[var(--separator)] h-[1px]" />
                        <Link to={ROUTES.SEARCH_DOMAIN} onClick={() => setIsOpen(false)}>
                            Search Domain
                        </Link>
                        <Separator className="my-2 bg-[var(--separator)] h-[1px]" />
                        <Link to={ROUTES.ABOUT_US} onClick={() => setIsOpen(false)}>
                            About Us
                        </Link>
                        <Separator className="my-2 bg-[var(--separator)] h-[1px]" />
                        <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="list-1" className="w-full">
                            <AccordionTrigger className="text-md md: text-lg" >Tools</AccordionTrigger>
                            {tools.map((item) => (
                                <AccordionContent key={item.title} className="p-3">
                                    <Link
                                        to={item.link}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 rounded-md hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors cursor-pointer"
                                    >
                                        <div className="text-xs md:text-2xl font-semibold">{item.title}</div>
                                        <div className="text-[0.65rem]  md:text-lg text-muted-foreground">{item.description}</div>
                                    </Link>
                                </AccordionContent>
                            ))}
                        </AccordionItem>
                        
                        </Accordion>
                        <Accordion type="single" collapsible>
                        <AccordionItem value="list-2" className="w-full">
                            <AccordionTrigger className="text-md md: text-lg" >Visualization</AccordionTrigger>
                            {visualization.map((item) => (
                                <AccordionContent key={item.title} className="p-3">
                                    <Link
                                        to={item.link}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2 rounded-md hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors cursor-pointer"
                                    >
                                        <div className="text-xs md:text-2xl font-semibold">{item.title}</div>
                                        <div className="text-[0.65rem]  md:text-lg text-muted-foreground">{item.description}</div>
                                    </Link>
                                </AccordionContent>
                            ))}
                        </AccordionItem>
                        </Accordion>

                    </div>
				</div>
			</motion.div>
		);
	}

	function MobileNavClosed() {
		return (
			<motion.button
				key="mobilenavclosed"
				initial={{ x: -60, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -60, opacity: 0 }}
				transition={{ duration: 0.15 }}
				onClick={() => setIsOpen(true)}
				className="fixed top-4 left-4 z-50 p-3 rounded-full bg-[var(--nav-background)] shadow-xl border border-[var(--nav-border)]"
				aria-label="Open navigation"
			>
				<Menu size={24} />
			</motion.button>
		);
	}

	return (
		<AnimatePresence mode="wait" initial={false}>
			{isOpen ? <MobileNavOpen key="mobilenavopen" /> : <MobileNavClosed key="mobilenavclosed" />}
		</AnimatePresence>
	);
}

export default MobileNav;
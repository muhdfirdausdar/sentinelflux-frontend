
interface NumCardProps {
    title: string;
    value: number;
    index?: number;
}

import React, { useEffect, useState } from 'react';

function NumberCard(props: NumCardProps){
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Animated counter effect
    useEffect(() => {
        setIsVisible(true);
        const duration = 1000; // 1 second animation
        const steps = 30;
        const increment = props.value / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= props.value) {
                setDisplayValue(props.value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [props.value]);

    const delay = (props.index ?? 0) * 80;

   return (
    <div 
        className="
            group relative overflow-hidden
            flex flex-col gap-2 md:gap-4 lg:gap-3 xl:gap-4
            pt-4 md:pt-8 lg:pt-6 xl:pt-8
            p-2 md:p-4 lg:p-3 xl:p-4
            w-38 h-26
            md:w-56 md:h-32
            lg:min-w-[160px] lg:max-h-[120px] lg:w-[calc(33.333%-0.5rem)] lg:h-auto lg:aspect-[5/3]
            xl:min-w-[180px] xl:max-h-[130px] xl:w-[calc(33.333%-0.75rem)] xl:aspect-[5/3]
            2xl:min-w-[180px] 2xl:max-h-[130px] 2xl:w-[calc(16.666%-1rem)] 2xl:aspect-[5/3]
            border-2 border-[var(--children-border)]
            bg-gradient-to-br from-[var(--section-children)] to-[var(--section-children)]/80
            rounded-xl shadow-lg
            transition-all duration-300 ease-out
            hover:shadow-2xl hover:scale-105 hover:-translate-y-1
            hover:border-primary/50
            cursor-pointer
            animate-fadeIn
        "
        style={{ 
            animationDelay: `${delay}ms`,
            opacity: isVisible ? 1 : 0
        }}
    >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-300 rounded-xl" />
        
        {/* Shine effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-2 md:gap-4 lg:gap-3 xl:gap-4">
            <p className="text-lg md:text-2xl lg:text-xl xl:text-2xl 2xl:text-3xl font-bold text-center bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text transition-all duration-300 group-hover:scale-110">
                {displayValue.toLocaleString()}
            </p>
            <h3 className="text-xs md:text-base lg:text-xs xl:text-sm 2xl:text-sm font-semibold text-[var(--muted-foreground)] text-center leading-tight transition-colors duration-300 group-hover:text-foreground/90">
                {props.title}
            </h3>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    );
}

export default React.memo(NumberCard);
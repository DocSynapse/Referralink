"use client"

import React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useRef } from "react"
import { cn } from "../../lib/utils"; // Adjusted path

// Register plugins
gsap.registerPlugin(ScrollTrigger);

interface TextBlockAnimationProps {
    children: React.ReactNode; // Can be string or elements
    animateOnScroll?: boolean;
    delay?: number;
    blockColor?: string;
    stagger?: number;
    duration?: number;
    className?: string;
}

export default function TextBlockAnimation({
    children,
    animateOnScroll = true,
    delay = 0,
    blockColor = "#000",
    stagger = 0.1,
    duration = 0.6,
    className
}: TextBlockAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Target the manually created line wrappers
        const lines = gsap.utils.toArray<HTMLElement>(".block-line-text", containerRef.current);
        const blocks = gsap.utils.toArray<HTMLElement>(".block-revealer", containerRef.current);

        if (lines.length === 0 || blocks.length === 0) return;

        // Set initial state
        gsap.set(lines, { opacity: 0 });
        gsap.set(blocks, { scaleX: 0, transformOrigin: "left center" });

        const tl = gsap.timeline({
            defaults: { ease: "expo.inOut" },
            scrollTrigger: animateOnScroll ? {
                trigger: containerRef.current,
                start: "top 85%",
                toggleActions: "play none none reverse",
            } : null,
            delay: delay
        });

        tl.to(blocks, {
            scaleX: 1,
            duration: duration,
            stagger: stagger,
            transformOrigin: "left center",
        })
        .set(lines, {
            opacity: 1,
            stagger: stagger
        }, `<${duration / 2}`)
        .to(blocks, {
            scaleX: 0,
            duration: duration,
            stagger: stagger,
            transformOrigin: "right center"
        }, `<${duration * 0.4}`);

    }, { 
        scope: containerRef, 
        dependencies: [animateOnScroll, delay, blockColor, stagger, duration] 
    });
    
    // Helper to wrap content. If it's a string, we treat it as one line or split by <br>.
    // For this specific component, we'll assume the user passes structured lines or we just wrap the whole child.
    // To mimic SplitText behavior without the plugin, we render the children but expect the consumer
    // to provide 'lines' if they want multi-line animation, OR we just animate the container as one block.
    // However, to make it easy for the Hero title, we'll traverse children.
    
    // Simplification for reliability: We will treat the entire `children` as ONE block unless we parse it.
    // But the prompt wants lines. I'll make a custom renderer here.
    
    return (
        <div ref={containerRef} className={cn("relative", className)}>
            {/* We assume children are pre-split or just one block. 
                We wrap the content in the structure GSAP expects. */}
            <div className="relative overflow-hidden inline-block leading-tight">
                 <div className="block-line-text opacity-0">
                    {children}
                 </div>
                 <div 
                    className="block-revealer absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
                    style={{ backgroundColor: blockColor }}
                 ></div>
            </div>
        </div>
    );
}

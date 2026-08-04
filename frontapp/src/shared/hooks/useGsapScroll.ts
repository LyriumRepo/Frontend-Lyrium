'use client';

import { useEffect, type RefObject } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/shared/lib/gsap';

type TriggerOptions = {
    /** Element that drives the scroll progress; defaults to the target itself. */
    trigger?: RefObject<Element | null>;
    start?: string;
    end?: string;
    scrub?: boolean | number;
};

/**
 * Moves a ref'd element on a parallax curve as its trigger scrolls through the viewport.
 * Use for hero backgrounds, decorative orbs/blobs, and depth layers — never for content
 * the user reads, since parallax offsets can hurt legibility.
 */
export function useScrollParallax(
    target: RefObject<Element | null>,
    vars: { yPercent?: number; xPercent?: number },
    options: TriggerOptions = {}
) {
    useEffect(() => {
        if (prefersReducedMotion() || !target.current) return;

        const ctx = gsap.context(() => {
            gsap.to(target.current, {
                yPercent: vars.yPercent ?? 0,
                xPercent: vars.xPercent ?? 0,
                ease: 'none',
                scrollTrigger: {
                    trigger: options.trigger?.current ?? target.current,
                    start: options.start ?? 'top bottom',
                    end: options.end ?? 'bottom top',
                    scrub: options.scrub ?? true,
                },
            });
        });

        return () => {
            ctx.revert();
        };
    }, [target, vars.yPercent, vars.xPercent, options.trigger, options.start, options.end, options.scrub]);
}

/**
 * Reveals a ref'd element with a clip-path/mask wipe as it scrolls into view — an
 * alternative to a plain fade for a hero image, feature panel, or section divider
 * that deserves a more considered entrance.
 */
export function useScrollReveal(
    target: RefObject<Element | null>,
    options: TriggerOptions & { from?: string; to?: string } = {}
) {
    useEffect(() => {
        if (prefersReducedMotion() || !target.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                target.current,
                { clipPath: options.from ?? 'inset(0 0 100% 0 round 1.5rem)' },
                {
                    clipPath: options.to ?? 'inset(0 0 0% 0 round 1.5rem)',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: options.trigger?.current ?? target.current,
                        start: options.start ?? 'top 85%',
                        end: options.end ?? 'top 35%',
                        scrub: options.scrub ?? true,
                    },
                }
            );
        });

        return () => {
            ctx.revert();
        };
    }, [target, options.from, options.to, options.trigger, options.start, options.end, options.scrub]);
}

/**
 * Grows a ref'd bar/line from 0 to full scaleY as its trigger scrolls through view —
 * for progress indicators, connector lines in timelines/acrostics, and reading-progress
 * accents. The element should start with `style={{ transform: 'scaleY(0)' }}` and a
 * `transformOrigin: 'top'` (set inline or via CSS) to avoid a flash of full size on load.
 */
export function useScrollProgressLine(
    target: RefObject<Element | null>,
    options: TriggerOptions = {}
) {
    useEffect(() => {
        if (prefersReducedMotion() || !target.current) return;

        const ctx = gsap.context(() => {
            gsap.fromTo(
                target.current,
                { scaleY: 0 },
                {
                    scaleY: 1,
                    ease: 'none',
                    transformOrigin: 'top',
                    scrollTrigger: {
                        trigger: options.trigger?.current ?? target.current,
                        start: options.start ?? 'top 70%',
                        end: options.end ?? 'bottom 60%',
                        scrub: options.scrub ?? true,
                    },
                }
            );
        });

        return () => {
            ctx.revert();
        };
    }, [target, options.trigger, options.start, options.end, options.scrub]);
}

/**
 * Escape hatch for bespoke sequences (pinning, multi-step timelines) that the hooks
 * above don't cover. Pass a builder that receives the live `gsap` and `ScrollTrigger`
 * instances; the returned cleanup runs `ctx.revert()` and kills any leftover triggers
 * scoped to `scope` automatically.
 */
export function useGsapContext(
    scope: RefObject<Element | null>,
    build: (gsapInstance: typeof gsap, scrollTrigger: typeof ScrollTrigger) => void,
    deps: ReadonlyArray<unknown> = []
) {
    useEffect(() => {
        if (prefersReducedMotion() || !scope.current) return;

        const ctx = gsap.context(() => build(gsap, ScrollTrigger), scope.current);

        return () => {
            ctx.revert();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- deps is an intentional caller-supplied array, mirroring useEffect's own contract
    }, deps);
}

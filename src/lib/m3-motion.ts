/**
 * Material 3 Expressive — Motion Tokens
 *
 * Centralized spring / eased / elastic motion presets for Framer Motion.
 * Reference: https://m3.material.io/styles/motion/overview
 */

// ── Spring presets ──────────────────────────────────────────────
/** Standard M3 spring — good default for most transitions */
export const M3_SPRING = { type: "spring" as const, stiffness: 400, damping: 28 };

/** Gentle spring for large shared-element transitions */
export const M3_SPRING_GENTLE = { type: "spring" as const, stiffness: 260, damping: 24 };

/** Snappy spring for micro-feedback (e.g. button taps) */
export const M3_SPRING_SNAPPY = { type: "spring" as const, stiffness: 500, damping: 30 };

// ── Eased presets (cubic-bezier) ────────────────────────────────
/** M3 Standard easing — symmetric, good for non-emphasized transitions */
export const M3_EASED = { duration: 0.3, ease: [0.2, 0, 0, 1] as [number, number, number, number] };

/** M3 Emphasized easing — used for enter/exit, hero transitions */
export const M3_EMPHASIZED = { duration: 0.5, ease: [0.2, 0, 0, 1] as [number, number, number, number] };

/** M3 Emphasized Decelerate — for entering elements */
export const M3_DECELERATE = { duration: 0.4, ease: [0, 0, 0, 1] as [number, number, number, number] };

/** M3 Emphasized Accelerate — for exiting elements */
export const M3_ACCELERATE = { duration: 0.2, ease: [0.3, 0, 1, 1] as [number, number, number, number] };

// ── Tap / Press feedback ────────────────────────────────────────
/** Squish-and-stretch for Mint / Bid CTAs */
export const M3_SQUISH_TAP = { scaleX: 1.04, scaleY: 0.96 };

/** Subtle press feedback for general interactive elements */
export const M3_PRESS_TAP = { scale: 0.97 };

// ── Shared Element / Layout transition config ───────────────────
/** Config for NFT card → detail view shared element transition */
export const M3_SHARED_LAYOUT = {
    type: "spring" as const,
    stiffness: 350,
    damping: 30,
    mass: 1,
};

// ── Stagger children preset ────────────────────────────────────
export const M3_STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

export const M3_STAGGER_ITEM = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: M3_EASED,
    },
};

/** Hover lift — subtle float-up for cards / interactive elements */
export const M3_HOVER_LIFT = { y: -4, transition: { ...M3_SPRING_SNAPPY } };
export const M3_HOVER_RESET = { y: 0, transition: { ...M3_SPRING } };

/** Scale pop — for badges, icons, success states */
export const M3_POP_IN = { scale: [0, 1.08, 1], transition: { duration: 0.4, ease: [0.2, 0, 0, 1] } };

/** Entrance stagger (fade + slide) — faster variant */
export const M3_QUICK_STAGGER_CONTAINER = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
};

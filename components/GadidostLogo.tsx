import React from "react";

interface GadidostLogoProps {
    /** Height in px — width scales proportionally (aspect ~4.4:1) */
    height?: number;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Official gadidost logo — exact replica of the brand image.
 * Blue G + Green D monogram, then "gadidost" wordmark in dark navy
 * with a green dot inside the "o".
 *
 * Always renders the horizontal full logo (icon + wordmark together).
 * Use `height` to scale; default is 40px tall.
 */
const GadidostLogo: React.FC<GadidostLogoProps> = ({
    height = 40,
    className = "",
    style,
}) => {
    // The viewBox is 530 × 120, so width = height * (530/120)
    const width = Math.round(height * (530 / 120));

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 530 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            aria-label="gadidost"
            role="img"
        >
            {/* Blue G — rounded letterform */}
            <path
                d="
                  M 52 14
                  C 28 14 8 34 8 58
                  C 8 82 28 102 52 102
                  C 66 102 78 96 86 86
                  L 86 62
                  L 60 62
                  L 60 76
                  L 73 76
                  C 68 82 61 86 52 86
                  C 36 86 22 73 22 58
                  C 22 43 36 30 52 30
                  C 60 30 67 33 72 39
                  L 83 29
                  C 74 20 64 14 52 14
                  Z
                "
                fill="#3B82C4"
            />

            {/* ═══════════════════════════════════════
                GREEN  D
            ═══════════════════════════════════════ */}
            {/*
              D shape: vertical bar on left + curved arc on right.
              Positioned slightly overlapping / touching G on right.
            */}
            <path
                d="
                  M 98 14
                  L 112 14
                  L 112 102
                  L 98 102
                  Z
                "
                fill="#3DB54A"
            />
            <path
                d="
                  M 112 14
                  C 138 14 158 34 158 58
                  C 158 82 138 102 112 102
                  L 112 88
                  C 130 88 144 75 144 58
                  C 144 41 130 28 112 28
                  Z
                "
                fill="#3DB54A"
            />

            {/* ═══════════════════════════════════════
                WORDMARK  "gadidost"
                Dark navy text, green dot on the 'o'
            ═══════════════════════════════════════ */}
            <text
                x="178"
                y="82"
                fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
                fontSize="62"
                fontWeight="600"
                fill="#1E2D40"
                letterSpacing="-1"
            >
                gadi
            </text>
            {/* "d" */}
            <text
                x="326"
                y="82"
                fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
                fontSize="62"
                fontWeight="600"
                fill="#1E2D40"
                letterSpacing="-1"
            >
                d
            </text>
            {/* "o" — the green dot sits inside the counter of the 'o' */}
            <text
                x="361"
                y="82"
                fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
                fontSize="62"
                fontWeight="600"
                fill="#1E2D40"
                letterSpacing="-1"
            >
                o
            </text>
            {/* Green dot inside the 'o' — centred in the letter counter */}
            <circle cx="386" cy="58" r="8" fill="#3DB54A" />
            {/* "st" */}
            <text
                x="403"
                y="82"
                fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
                fontSize="62"
                fontWeight="600"
                fill="#1E2D40"
                letterSpacing="-1"
            >
                st
            </text>
        </svg>
    );
};

export default GadidostLogo;

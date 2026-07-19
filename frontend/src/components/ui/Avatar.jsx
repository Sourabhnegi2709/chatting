import React from "react";
import { cn } from "../../utils/cn";

const SIZE_MAP = {
    xs: "w-7 h-7 text-[11px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
};

const DOT_MAP = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-3.5 h-3.5",
};

// Deterministic, pleasant color from a name so the same person
// always gets the same fallback color across sessions.
const PALETTE = [
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-indigo-500",
    "from-rose-400 to-pink-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-cyan-500",
];

const colorFor = (name = "") => {
    const idx = name.charCodeAt(0) % PALETTE.length || 0;
    return PALETTE[idx >= 0 ? idx : 0];
};

const Avatar = ({ src, name = "", size = "md", status, className }) => {
    const initials = name
        .trim()
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("") || "?";

    return (
        <div className={cn("relative flex-shrink-0", SIZE_MAP[size], className)}>
            {/* Animated presence ring — signature element for online contacts */}
            {status === "online" && (
                <span
                    aria-hidden
                    className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-emerald-400 via-emerald-300 to-teal-400 opacity-70 blur-[2px] animate-pulse"
                />
            )}

            <div className="relative w-full h-full rounded-full ring-2 ring-white overflow-hidden">
                {src ? (
                    <img
                        src={src}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                    />
                ) : (
                    <div
                        className={cn(
                            "w-full h-full flex items-center justify-center font-semibold text-white bg-gradient-to-br",
                            colorFor(name)
                        )}
                    >
                        {initials}
                    </div>
                )}
            </div>

            {status === "online" && (
                <span
                    className={cn(
                        "absolute bottom-0 right-0 rounded-full bg-emerald-500 ring-2 ring-white",
                        DOT_MAP[size]
                    )}
                />
            )}
        </div>
    );
};

export default Avatar;

import React from "react";
import { cn } from "../../utils/cn";

const VARIANTS = {
    ghost: "text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200",
    solid: "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm",
    danger: "text-zinc-600 hover:bg-red-50 hover:text-red-600 active:bg-red-100",
    subtle: "bg-white/10 text-white hover:bg-white/20 active:bg-white/30",
};

const IconButton = ({
    children,
    className,
    variant = "ghost",
    "aria-label": ariaLabel,
    ...props
}) => {
    return (
        <button
            aria-label={ariaLabel}
            className={cn(
                "min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
                "active:scale-90",
                VARIANTS[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default IconButton;

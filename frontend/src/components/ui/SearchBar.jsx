import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

const SearchBar = ({ value, onChange, placeholder = "Search or start new chat", className }) => {
    return (
        <div className={cn("group relative transition-transform duration-150 focus-within:scale-[1.01]", className)}>
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                <Search size={18} />
            </span>

            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={cn(
                    "w-full pl-10 pr-9 py-2.5 bg-zinc-100 border border-transparent rounded-xl",
                    "text-sm text-zinc-900 placeholder:text-zinc-400",
                    "outline-none transition-all duration-150",
                    "focus:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/10"
                )}
            />

            {value?.length > 0 && (
                <button
                    type="button"
                    onClick={() => onChange({ target: { value: "" } })}
                    aria-label="Clear search"
                    className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default SearchBar;

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../../utils/cn';

const SearchBar = ({ value, onChange, placeholder = "Search or start new chat", className }) => {
    return (
        <div className={cn("relative", className)}>
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
                <Search size={18} />
            </span>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-lg border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-500"
            />
        </div>
    );
};
export default SearchBar;
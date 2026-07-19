import React from "react";
import { Menu as MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="w-full h-16 bg-white/90 backdrop-blur-lg border-b border-zinc-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-emerald-500/30">
                    C
                </div>
                <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">
                    Chattify
                </h1>
            </div>

            {/* User Menu */}
            <Link
                to="/menu"
                aria-label="Open menu"
                className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 active:scale-90 transition-all duration-150"
            >
                <MenuIcon size={22} />
            </Link>
        </div>
    );
};

export default Navbar;

import React from "react";
import { Search, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <div className="w-full h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-5">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    W
                </div>
                <h1 className="text-xl font-semibold text-zinc-800">
                    Chattify..
                </h1>
            </div>

            {/* Search */}
            <div className="hidden md:flex items-center bg-zinc-100 px-3 py-2 rounded-lg w-[300px]">
                <Search size={18} className="text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="bg-transparent outline-none ml-2 w-full"
                />
            </div>

            {/* User Menu */}
            <Link to="/menu" className="p-2 rounded-full hover:bg-zinc-100">
                <Menu size={22} />
            </Link>
        </div>
    );
};

export default Navbar;
import React from "react";
import { MessageCircle, Video, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";

const TABS = [
    { to: "/", label: "Chats", icon: MessageCircle, match: (p) => p === "/" },
    { to: "/call", label: "Calls", icon: Video, match: (p) => p.startsWith("/call") || p.startsWith("/video") },
    { to: "/settings", label: "Settings", icon: Settings, match: (p) => p.startsWith("/settings") },
];

const BottomBar = () => {
    const { pathname } = useLocation();

    return (
        <nav
            className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-lg border-t border-zinc-200 flex items-center justify-around z-30"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
            {TABS.map(({ to, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                    <Link
                        key={to}
                        to={to}
                        className="relative flex flex-col items-center justify-center gap-1 flex-1 h-16 min-w-[56px]"
                    >
                        {active && (
                            <span className="absolute top-1.5 w-10 h-10 rounded-2xl bg-emerald-50 transition-all duration-200" />
                        )}
                        <Icon
                            size={22}
                            className={cn(
                                "relative transition-colors duration-150",
                                active ? "text-emerald-600" : "text-zinc-400"
                            )}
                        />
                        <span
                            className={cn(
                                "relative text-[11px] font-medium transition-colors duration-150",
                                active ? "text-emerald-600" : "text-zinc-500"
                            )}
                        >
                            {label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
};

export default BottomBar;

import React from "react";
import { cn } from "../../utils/cn";

const Avatar = ({ src, name, size = "md", status, className }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
    };

    return (
        <div
            className={cn(
                "relative flex-shrink-0",
                sizeClasses[size],
                className
            )}
        >
            <img
                src={src}
                alt={name}
                className="w-full h-full rounded-full object-cover"
            />

            {status === "online" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
        </div>
    );
};

export default Avatar;
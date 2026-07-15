import React from 'react';
import { cn } from '../../utils/cn';

const IconButton = ({ children, className, ...props }) => {
    return (
        <button className={cn("p-2 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600", className)} {...props}>
            {children}
        </button>
    );
};

export default IconButton;

import React from 'react';
import { useOS } from '../context/OSContext';
import { cn } from '../utils/cn';

export function AppIcon({ icon: Icon, name }: { icon: any, name: string }) {
    const { iconStyle } = useOS();

    // Mapping app names to specific colors for "Colorful" mode
    const getIconColor = () => {
        if (iconStyle === 'monochrome') return 'text-white';

        switch (name) {
            case 'Settings': return 'text-gray-300';
            case 'Browser': return 'text-blue-400';
            case 'Notes': return 'text-yellow-400';
            case 'Clock': return 'text-red-400';
            case 'Assistant': return 'text-purple-400';
            default: return 'text-white';
        }
    };

    return <Icon className={cn("w-6 h-6", getIconColor())} />;
}

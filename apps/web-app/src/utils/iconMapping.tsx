import { Landmark, Mountain, Anchor, Flag, Map, Trophy, CheckCircle, MapPin, Circle } from 'lucide-react';
import React from 'react';

export const ICON_MAP: Record<string, React.ReactNode> = {
    'Landmark': <Landmark className="w-full h-full" />,
    'Mountain': <Mountain className="w-full h-full" />,
    'Anchor': <Anchor className="w-full h-full" />,
    'Flag': <Flag className="w-full h-full" />,
    'Map': <Map className="w-full h-full" />,
    'Trophy': <Trophy className="w-full h-full" />,
    'CheckCircle': <CheckCircle className="w-full h-full" />,
    'MapPin': <MapPin className="w-full h-full" />,
    'Circle': <Circle className="w-full h-full" />
};

export const renderLucideIcon = (icon: string | React.ReactNode, className?: string) => {
    if (typeof icon === 'string') {
        const IconComponent = ICON_MAP[icon];
        if (IconComponent) {
            return <div className={className || "w-6 h-6"}>{IconComponent}</div>;
        }
        return <span className={className}>{icon}</span>;
    }
    return icon;
};

'use client';

import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
}

interface LiveMapProps {
    currentPos: Point;
    path: Point[];
}

export default function LiveMap({ currentPos, path }: LiveMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // WRO Table dimensions are 2370 x 1143 mm
    // Scaling to fit canvas
    const DRAW_SCALE = 0.2;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        canvas.width = canvas.parentElement?.clientWidth || 800;
        canvas.height = canvas.parentElement?.clientHeight || 400;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < canvas.width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw Arena Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Draw Path
        if (path.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw Interest Points (Heritage Sites)
        const sites = [
            { x: 100, y: 100, label: 'Tràng An' },
            { x: 500, y: 150, label: 'Cột Cờ' },
            { x: 300, y: 300, label: 'Chùa Một Cột' }
        ];

        sites.forEach(site => {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.2)';
            ctx.beginPath();
            ctx.arc(site.x, site.y, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fac415';
            ctx.stroke();

            ctx.fillStyle = '#fac415';
            ctx.font = 'bold 10px Arial';
            ctx.fillText(site.label, site.x - 20, site.y - 25);
        });

        // Draw Current Robot Position
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Robot Pulse
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(currentPos.x, currentPos.y, 15, 0, Math.PI * 2);
        ctx.stroke();

    }, [currentPos, path]);

    return (
        <div className="w-full h-full p-4 relative">
            <canvas ref={canvasRef} className="w-full h-full touch-none" />
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arena Coordinate Space</span>
                <span className="text-[8px] font-mono text-slate-600">640px x 480px normalized</span>
            </div>
        </div>
    );
}

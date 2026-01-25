'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

const HUB_IP = process.env.NEXT_PUBLIC_HUB_IP || 'localhost';
const WS_URL = `ws://${HUB_IP}:8765`;

export default function VisionPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState('Initializing...');
    const [wsStatus, setWsStatus] = useState('Disconnected');
    const [isVisionActive, setIsVisionActive] = useState(true);
    const [detectedSite, setDetectedSite] = useState<string | null>(null);
    const [fps, setFps] = useState(0);

    // Sites Mapping
    const SITES: Record<number, string> = {
        0: "Tràng An",
        1: "Cột Cờ Kỳ Đài",
        2: "Chùa Một Cột",
        17: "Test Marker (17)",
        34: "Test Marker (34)",
        42: "Test Marker (42)"
    };

    // WebSocket Persistence
    useEffect(() => {
        const connectWs = () => {
            const socket = new WebSocket(WS_URL);
            socket.onopen = () => setWsStatus('Connected');
            socket.onclose = () => {
                setWsStatus('Disconnected');
                setTimeout(connectWs, 2000); // Auto reconnect
            };
            wsRef.current = socket;
        };
        connectWs();
        return () => wsRef.current?.close();
    }, []);

    const sendWsCommand = (command: string, params: object = {}) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ command, params }));
        }
    };

    // Camera Access
    useEffect(() => {
        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: 640, height: 480 },
                    audio: false
                });
                if (videoRef.current) videoRef.current.srcObject = stream;
                setStatus('Camera Live');
            } catch (err) {
                console.error("Camera Error:", err);
                setStatus('Camera Failed');
            }
        }
        startCamera();
        return () => {
            const stream = videoRef.current?.srcObject as MediaStream;
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []);

    // ArUco Detection Loop
    const handleDetection = () => {
        // @ts-ignore (Loaded from CDN)
        if (!window.AR || !videoRef.current || !canvasRef.current || !isVisionActive) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        // Sync canvas size
        canvas.width = 640;
        canvas.height = 480;

        let lastTime = performance.now();
        let frameCount = 0;

        const detect = () => {
            if (!isVisionActive) return;

            // Draw video to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // ArUco Detector
            // @ts-ignore
            const detector = new AR.Detector();
            const markers = detector.detect(imageData);

            // Calculation status
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }

            // Visual Rendering & Logic
            if (markers.length > 0) {
                setDetectedSite(null);
                markers.forEach((marker: any) => {
                    const id = marker.id;
                    const siteName = SITES[id] || `Unknown (${id})`;

                    // Draw box
                    context.strokeStyle = "#00FF00";
                    context.lineWidth = 4;
                    context.beginPath();
                    marker.corners.forEach((c: any, i: number) => {
                        if (i === 0) context.moveTo(c.x, c.y);
                        else context.lineTo(c.x, c.y);
                    });
                    context.closePath();
                    context.stroke();

                    // Draw label
                    context.fillStyle = "yellow";
                    context.font = "bold 24px Arial";
                    context.fillText(`${siteName}`, marker.corners[0].x, marker.corners[0].y - 10);

                    // COMMAND LOGIC: Send 'stop' to robot
                    setDetectedSite(siteName);
                    sendWsCommand('stop');
                });
            } else {
                setDetectedSite(null);
            }

            requestAnimationFrame(detect);
        };
        detect();
    };

    return (
        <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
            {/* ArUco CDN Scripts */}
            <Script src="https://cdn.jsdelivr.net/gh/jared-hughes/js-aruco/src/cv.js" strategy="afterInteractive" />
            <Script
                src="https://cdn.jsdelivr.net/gh/jared-hughes/js-aruco/src/aruco.js"
                strategy="afterInteractive"
                onLoad={() => setStatus('Ready with AI Brain')}
            />

            {/* VIDEO FEED */}
            <video
                ref={videoRef}
                className="hidden"
                autoPlay
                playsInline
                onLoadedMetadata={handleDetection}
            />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50 grayscale contrast-125"
                style={{ filter: 'brightness(1.2)' }}
            />

            {/* UI OVERLAY */}
            <div className="absolute inset-0 flex flex-col pointer-events-none">
                {/* Header Status */}
                <div className="p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black italic tracking-tighter">ROBOT EYES</span>
                            <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${wsStatus === 'Connected' ? 'bg-green-500 shadow-green-500' : 'bg-red-500 shadow-red-500'}`} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Hub: {HUB_IP} | FPS: {fps}</span>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/test-control')}
                        className="pointer-events-auto px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-bold"
                    >
                        BACK TO PAD
                    </button>
                </div>

                {/* Recognition Alert */}
                <div className="flex-1 flex items-center justify-center p-8">
                    {detectedSite && (
                        <div className="bg-yellow-400 text-black px-12 py-6 rounded-3xl animate-bounce shadow-[0_0_50px_rgba(250,204,21,0.5)] flex flex-col items-center">
                            <span className="text-sm font-black uppercase tracking-widest opacity-60">Heritage Detected</span>
                            <h2 className="text-4xl font-black italic tracking-tighter">{detectedSite}</h2>
                            <span className="mt-2 px-3 py-1 bg-black/10 rounded-full text-[10px] font-bold">ROBOT STOPPED 🛑</span>
                        </div>
                    )}
                </div>

                {/* Bottom Controls (Manual Fallback) */}
                <div className="p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
                    <div className="flex justify-between items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vision Brain</span>
                            <button
                                onClick={() => setIsVisionActive(!isVisionActive)}
                                className={`px-6 py-3 rounded-2xl font-black italic tracking-tighter transition-all ${isVisionActive ? 'bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-slate-800 text-slate-500'}`}
                            >
                                {isVisionActive ? 'AI MODULE: ON' : 'AI MODULE: OFF'}
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onTouchStart={() => sendWsCommand('move', { direction: 'forward', speed: 100 })}
                                onTouchEnd={() => sendWsCommand('stop')}
                                className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center active:bg-blue-500/30 active:scale-95 transition-all"
                            >
                                <span className="text-2xl">↑</span>
                            </button>
                            <button
                                onTouchStart={() => sendWsCommand('move', { direction: 'backward', speed: 100 })}
                                onTouchEnd={() => sendWsCommand('stop')}
                                className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center active:bg-blue-500/30 active:scale-95 transition-all"
                            >
                                <span className="text-2xl">↓</span>
                            </button>
                            <button
                                onClick={() => sendWsCommand('emergency')}
                                className="px-6 py-3 bg-red-600 rounded-2xl font-black text-sm animate-pulse"
                            >
                                STOP
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function json(obj: object) {
    return JSON.stringify(obj);
}

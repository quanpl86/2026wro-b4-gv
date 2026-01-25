'use client';

import { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const DEFAULT_HUB_IP = process.env.NEXT_PUBLIC_HUB_IP || 'localhost';

export default function VisionPage() {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wsRef = useRef<WebSocket | null>(null);

    const [status, setStatus] = useState('Initializing QR Brain...');
    const [wsStatus, setWsStatus] = useState('Disconnected');
    const [isVisionActive, setIsVisionActive] = useState(true);
    const [detectedSite, setDetectedSite] = useState<string | null>(null);
    const [fps, setFps] = useState(0);
    const [isDebugView, setIsDebugView] = useState(false);
    const [hubIp, setHubIp] = useState<string | null>(null);

    // Fetch Dynamic Hub IP from Supabase
    useEffect(() => {
        const getHubIp = async () => {
            try {
                const { data, error } = await supabase
                    .from('robot_profiles')
                    .select('hub_ip')
                    .eq('is_active', true)
                    .single();

                if (data && data.hub_ip) {
                    console.log(`[Vision] Using Hub IP: ${data.hub_ip}`);
                    setHubIp(data.hub_ip);
                } else {
                    console.warn(`[Vision] No active profile IP found, using default: ${DEFAULT_HUB_IP}`);
                    setHubIp(DEFAULT_HUB_IP);
                }
            } catch (err) {
                console.error("[Vision] Error fetching hub IP:", err);
                setHubIp(DEFAULT_HUB_IP);
            }
        };
        getHubIp();
    }, []);

    // WebSocket Persistence (Depends on hubIp)
    useEffect(() => {
        if (!hubIp) return;

        const connectWs = () => {
            const socket = new WebSocket(`ws://${hubIp}:8765`);
            socket.onopen = () => setWsStatus('Connected');
            socket.onclose = () => {
                setWsStatus('Disconnected');
                setTimeout(connectWs, 2000);
            };
            wsRef.current = socket;
        };
        connectWs();
        return () => wsRef.current?.close();
    }, [hubIp]);

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

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play();
                        setStatus('QR Engine Live');
                    };
                }
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

    // QR Detection Loop
    useEffect(() => {
        let frameCount = 0;
        let lastTime = performance.now();
        let animationFrameId: number;

        const detect = () => {
            if (!isVisionActive || !videoRef.current || !canvasRef.current) {
                animationFrameId = requestAnimationFrame(detect);
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d', { willReadFrequently: true });

            if (!context || video.readyState < 2) {
                animationFrameId = requestAnimationFrame(detect);
                return;
            }

            // Sync size
            if (canvas.width !== video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            // Draw frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert",
            });

            if (code) {
                const siteName = code.data;

                // Draw QR location
                context.strokeStyle = "#00FF00";
                context.lineWidth = 4;
                context.beginPath();
                context.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                context.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                context.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                context.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                context.closePath();
                context.stroke();

                // Draw label
                context.fillStyle = "yellow";
                context.font = "bold 24px Arial";
                context.fillText(siteName, code.location.topLeftCorner.x, code.location.topLeftCorner.y - 10);

                if (siteName !== detectedSite) {
                    console.log(`%c[QR] DETECTED: ${siteName}`, "color: #00ff00; font-weight: bold; font-size: 14px;");
                    setDetectedSite(siteName);
                    sendWsCommand('stop');
                }
            } else {
                setDetectedSite(null);
            }

            // FPS
            frameCount++;
            const now = performance.now();
            if (now - lastTime >= 1000) {
                setFps(frameCount);
                frameCount = 0;
                lastTime = now;
            }

            animationFrameId = requestAnimationFrame(detect);
        };

        detect();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isVisionActive, detectedSite]);

    return (
        <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden select-none touch-none">
            <video ref={videoRef} className="absolute opacity-0 pointer-events-none" autoPlay playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-contain" />

            <div className="absolute inset-0 flex flex-col pointer-events-none">
                <div className="p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-black italic tracking-tighter">QR VISION</span>
                            <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${wsStatus === 'Connected' ? 'bg-green-500 shadow-green-500' : 'bg-red-500 shadow-red-500'}`} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                            FPS: {fps} | Status: <span className="text-yellow-400">{status}</span>
                        </span>
                    </div>

                    <button onClick={() => router.push('/dashboard/test-control')} className="pointer-events-auto px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-xs font-bold">
                        BACK TO PAD
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    {detectedSite && (
                        <div className="bg-green-500 text-black px-12 py-6 rounded-3xl animate-bounce shadow-[0_0_50px_rgba(34,197,94,0.5)] flex flex-col items-center">
                            <span className="text-sm font-black uppercase tracking-widest opacity-60">QR Code Identified</span>
                            <h2 className="text-4xl font-black italic tracking-tighter text-center">{detectedSite}</h2>
                            <span className="mt-2 px-3 py-1 bg-black/10 rounded-full text-[10px] font-bold uppercase">Mission Objective Found</span>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
                    <div className="flex justify-between items-end gap-4">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Vision System v2.0</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsVisionActive(!isVisionActive)}
                                    className={`px-6 py-3 rounded-2xl font-black italic tracking-tighter transition-all ${isVisionActive ? 'bg-green-600 text-white shadow-[0_0_30px_rgba(22,163,74,0.4)]' : 'bg-slate-800 text-slate-500'}`}
                                >
                                    {isVisionActive ? 'QR MODULE: ACTIVE' : 'QR MODULE: STANDBY'}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => sendWsCommand('emergency')} className="px-6 py-3 bg-red-600 rounded-2xl font-black text-sm animate-pulse">STOP</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

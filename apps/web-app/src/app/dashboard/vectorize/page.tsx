'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function VectorizePage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [svg, setSvg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const DEFAULT_OPTIONS = {
        colorPrecision: 6,
        filterSpeckle: 4,
        spliceThreshold: 45,
        pathPrecision: 2,
        mode: 'spline',
        cornerThreshold: 60,
        lengthThreshold: 4.0,
        hierarchical: 'stacked',
        maxIterations: 10,
        layerDifference: 16
    };

    const PARAMS_INFO: Record<string, { title: string, desc: string, tip: string }> = {
        mode: { title: "Algorithm Engine", desc: "Spline tạo đường cong Bézier mượt mà, Polygon tạo các đa giác sắc cạnh.", tip: "Dùng Spline cho logo/di sản, Polygon cho hình khối kỹ thuật." },
        hierarchical: { title: "Layering Strategy", desc: "Stacked xếp các lớp màu đè lên nhau, Cutout cắt mảng màu như mảnh ghép.", tip: "Stacked là lựa chọn số 1 để xóa bỏ khe hở màu." },
        colorPrecision: { title: "Color Count", desc: "Số lượng mảng màu phân tách.", tip: "Tăng để ảnh giống gốc hơn, giảm để phong cách hóa (Stylized)." },
        filterSpeckle: { title: "Filter Speckle", desc: "Loại bỏ các hạt nhiễu nhỏ (tính bằng pixel).", tip: "Lý tưởng để làm sạch ảnh scan bị muỗi." },
        cornerThreshold: { title: "Cornerness", desc: "Góc tối đa để AI coi là một góc nhọn.", tip: "Tăng nếu muốn giữ các góc nhọn sắc nét." },
        lengthThreshold: { title: "Segment Length", desc: "Độ dài ngắn nhất của một đoạn cong.", tip: "Giá trị nhỏ giúp bám sát chi tiết nhỏ nhưng tốn tài nguyên hơn." },
        maxIterations: { title: "Max Iterations", desc: "Số lần AI chạy vòng lặp để làm mịn và khớp đường kẻ.", tip: "Tăng lên 50+ cho ảnh di sản siêu chi tiết." },
        layerDifference: { title: "Color Difference", desc: "Độ nhạy khi phân biệt giữa hai vùng màu gần nhau.", tip: "Giảm để AI bắt được các dải màu chuyển (Gradient) tốt hơn." },
        spliceThreshold: { title: "Splice Threshold", desc: "Góc tối đa để nối hai đường cong lại với nhau.", tip: "Giá trị cao giúp đường nét liền mạch hơn." },
        pathPrecision: { title: "Accuracy", desc: "Số chữ số thập phân của tọa độ điểm.", tip: "Giảm xuống 0-1 để tối ưu dung lượng file SVG đầu ra." }
    };

    // Advanced Options
    const [options, setOptions] = useState(DEFAULT_OPTIONS);
    const [activeInfo, setActiveInfo] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setSvg(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('colorPrecision', options.colorPrecision.toString());
        formData.append('filterSpeckle', options.filterSpeckle.toString());
        formData.append('spliceThreshold', options.spliceThreshold.toString());
        formData.append('pathPrecision', options.pathPrecision.toString());
        formData.append('mode', options.mode);
        formData.append('cornerThreshold', options.cornerThreshold.toString());
        formData.append('lengthThreshold', options.lengthThreshold.toString());
        formData.append('hierarchical', options.hierarchical);
        formData.append('maxIterations', options.maxIterations.toString());
        formData.append('layerDifference', options.layerDifference.toString());

        try {
            const res = await fetch('/api/vectorize', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (data.svg) {
                setSvg(data.svg);
            } else {
                alert('Conversion failed: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred during conversion.');
        } finally {
            setLoading(false);
        }
    };

    const downloadSvg = () => {
        if (!svg) return;
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vectorized_image.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans selection:bg-blue-500/30 relative">
            {/* Backdrop for Auto-Close Tooltips */}
            {activeInfo && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setActiveInfo(null)}
                    onTouchStart={() => setActiveInfo(null)}
                />
            )}
            <div className="max-w-[1700px] mx-auto relative z-0">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-5xl font-black italic tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">AI VECTORIZER</h1>
                            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-black uppercase tracking-widest">Master Edition</span>
                        </div>
                        <p className="text-slate-400 text-lg">Phòng thí nghiệm véc-tơ hóa di sản - Độ nét tuyệt đối cho mọi kích thước.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/judge" className="px-8 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all text-sm font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 group">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Judge System
                        </Link>
                        <Link href="/" className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6" /></svg>
                            Quay lại trang chủ
                        </Link>
                    </div>
                </header>

                {/* Main Comparison Stage */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Input Stage */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-10 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group backdrop-blur-3xl shadow-2xl">
                        {preview ? (
                            <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
                                <div className="absolute top-0 left-0 px-4 py-2 bg-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">Source Canvas</div>
                                <img src={preview} alt="Original" className="max-w-full max-h-[400px] rounded-3xl shadow-[0_0_100px_-20px_rgba(37,99,235,0.2)] transition-all duration-500 group-hover:scale-[1.02]" />
                                <button
                                    onClick={() => { setFile(null); setPreview(null); setSvg(null); }}
                                    className="absolute top-0 right-0 p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-all border border-red-500/20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center cursor-pointer group w-full h-full justify-center">
                                <div className="w-24 h-24 bg-blue-600/10 text-blue-500 rounded-[32px] flex items-center justify-center mb-6 group-hover:bg-blue-600/20 transition-all border border-blue-500/10 group-hover:scale-110 duration-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                </div>
                                <span className="text-2xl font-black mb-2 tracking-tight">Kéo thả ảnh để bắt đầu</span>
                                <span className="text-slate-500 text-sm max-w-[200px] text-center font-medium">Hỗ trợ PNG, JPG cho kết quả AI tốt nhất.</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        )}
                    </div>

                    {/* Output Stage */}
                    <div className={`${isFullscreen ? 'fixed inset-0 z-[100] p-6 md:p-12 bg-slate-950/95 backdrop-blur-3xl' : 'lg:col-span-8 bg-slate-900/40 border border-white/5 rounded-[40px] p-10 min-h-[500px]'} flex flex-col items-center justify-center relative shadow-2xl overflow-hidden transition-all duration-500`}>
                        {loading ? (
                            <div className="flex flex-col items-center animate-pulse">
                                <div className="w-20 h-20 border-[6px] border-blue-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_50px_-10px_rgba(37,99,235,0.5)]"></div>
                                <p className="text-blue-500 font-black text-xl tracking-widest uppercase italic">AI Processing...</p>
                            </div>
                        ) : svg ? (
                            <div className="w-full h-full flex flex-col items-center animate-fade-in relative">
                                <div className="absolute top-0 left-0 px-4 py-2 bg-green-500/5 rounded-full text-[10px] font-black text-green-500/70 uppercase tracking-widest border border-green-500/10 z-20">Vector Master Output</div>

                                <div className={`flex-1 w-full bg-white rounded-[32px] overflow-hidden shadow-2xl relative group cursor-grab active:cursor-grabbing border-4 border-white/10 ${isFullscreen ? 'mb-0' : 'mb-8'}`} style={{ minHeight: isFullscreen ? '100%' : '350px' }}>
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

                                    <TransformWrapper
                                        initialScale={1}
                                        initialPositionX={0}
                                        initialPositionY={0}
                                        centerOnInit
                                        wheel={{ step: 0.1 }}
                                    >
                                        {({ zoomIn, zoomOut, resetTransform }) => (
                                            <>
                                                {/* Interactive Floating Toolbar */}
                                                <div className="absolute top-6 right-6 flex flex-col gap-3 z-30 animate-fade-in-right">
                                                    <button onClick={() => zoomIn()} className="w-12 h-12 bg-white/90 text-slate-900 rounded-xl shadow-xl flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all outline-none border border-black/5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                                                    </button>
                                                    <button onClick={() => zoomOut()} className="w-12 h-12 bg-white/90 text-slate-900 rounded-xl shadow-xl flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all outline-none border border-black/5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                                                    </button>
                                                    <button onClick={() => resetTransform()} className="w-12 h-12 bg-white/90 text-slate-900 rounded-xl shadow-xl flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all outline-none border border-black/5" title="Reset 1:1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                                                    </button>
                                                    <button onClick={() => setIsFullscreen(!isFullscreen)} className={`w-12 h-12 ${isFullscreen ? 'bg-blue-600 text-white' : 'bg-white/90 text-slate-900'} rounded-xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all outline-none border border-black/5`}>
                                                        {isFullscreen ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v5H3" /><path d="m21 3-6.1 6.1" /><path d="M16 21v-5h5" /><path d="M3 21l6.1-6.1" /></svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6" /><path d="M9 21l-6-6" /><path d="M21 3v6h-6" /><path d="M3 21v-6h6" /><path d="m21 3-6.1 6.1" /><path d="M3 21l6.1-6.1" /></svg>
                                                        )}
                                                    </button>
                                                </div>

                                                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                                                    <div className="w-full h-full flex items-center justify-center p-12 select-none" dangerouslySetInnerHTML={{ __html: svg }} />
                                                </TransformComponent>
                                            </>
                                        )}
                                    </TransformWrapper>
                                </div>

                                {!isFullscreen && (
                                    <div className="w-full flex gap-4">
                                        <button
                                            onClick={downloadSvg}
                                            className="group flex-1 py-5 bg-green-600 text-white rounded-[24px] font-black text-xl hover:bg-green-500 transition-all shadow-[0_20px_40px_-15px_rgba(22,163,74,0.4)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-y-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            Lưu tệp SVG Master
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-600 opacity-20">
                                <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                <span className="text-xl font-bold italic">Chưa có dữ liệu xử lý</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Horizontal Control Panel */}
                <div className="bg-slate-900/60 border border-white/10 rounded-[40px] p-8 md:p-10 backdrop-blur-2xl shadow-2xl border-t-white/20">
                    <div className="flex flex-col gap-10">
                        {/* Algorithm Engine Selector */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 pb-6 border-b border-white/5 relative">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 whitespace-nowrap">Algorithm:</span>
                                <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 w-fit">
                                    <button
                                        onClick={() => setOptions({ ...options, mode: 'spline' })}
                                        className={`px-4 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${options.mode === 'spline' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Spline
                                    </button>
                                    <button
                                        onClick={() => setOptions({ ...options, mode: 'polygon' })}
                                        className={`px-4 md:px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${options.mode === 'polygon' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Polygon
                                    </button>
                                </div>
                                <button onClick={() => setActiveInfo(activeInfo === 'mode' ? null : 'mode')} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${activeInfo === 'mode' ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/20 text-slate-500 hover:border-white/40'}`}>i</button>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500 whitespace-nowrap">Layering:</span>
                                <div className="flex bg-slate-950 p-1 rounded-2xl border border-white/5 w-fit">
                                    <button
                                        onClick={() => setOptions({ ...options, hierarchical: 'stacked' })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${options.hierarchical === 'stacked' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Stacked (Heritage)
                                    </button>
                                    <button
                                        onClick={() => setOptions({ ...options, hierarchical: 'cutout' })}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${options.hierarchical === 'cutout' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        Cutout (Grid)
                                    </button>
                                </div>
                                <button onClick={() => setActiveInfo(activeInfo === 'hierarchical' ? null : 'hierarchical')} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${activeInfo === 'hierarchical' ? 'bg-purple-600 border-purple-500 text-white' : 'border-white/20 text-slate-500 hover:border-white/40'}`}>i</button>
                            </div>

                            {/* Tooltip Overlay */}
                            {activeInfo && PARAMS_INFO[activeInfo] && (
                                <div className="absolute top-full left-0 mt-4 z-[100] w-full max-w-[400px] bg-slate-950 border border-blue-500/30 p-6 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-blue-400 font-black text-xs uppercase tracking-widest">{PARAMS_INFO[activeInfo].title}</h4>
                                        <button onClick={() => setActiveInfo(null)} className="text-slate-500 hover:text-white">✕</button>
                                    </div>
                                    <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{PARAMS_INFO[activeInfo].desc}</p>
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-2xl">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Expert Tip:</span>
                                        <p className="text-[10px] text-blue-200/70 italic">{PARAMS_INFO[activeInfo].tip}</p>
                                    </div>
                                </div>
                            )}

                            <div className="ml-auto hidden xl:block">
                                <button
                                    onClick={() => setOptions(DEFAULT_OPTIONS)}
                                    className="px-6 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 hover:text-white transition-all active:scale-95"
                                >
                                    Reset Defaults
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-8 w-full">
                                {[
                                    { key: 'colorPrecision', min: 1, max: 10, step: 1, label: 'Color Prec' },
                                    { key: 'filterSpeckle', min: 0, max: 120, step: 1, label: 'Filter Speck' },
                                    { key: 'cornerThreshold', min: 0, max: 180, step: 1, label: 'Cornerness' },
                                    { key: 'lengthThreshold', min: 0.1, max: 10.0, step: 0.1, label: 'Segment Len' },
                                    { key: 'maxIterations', min: 1, max: 100, step: 1, label: 'Iterations', accent: 'purple' },
                                    { key: 'layerDifference', min: 1, max: 128, step: 1, label: 'Color Diff', accent: 'purple' },
                                    { key: 'spliceThreshold', min: 0, max: 180, step: 1, label: 'Splice Thresh' },
                                    { key: 'pathPrecision', min: 0, max: 5, step: 1, label: 'Accuracy' },
                                ].map((p) => (
                                    <div key={p.key} className="space-y-4">
                                        <div className="flex justify-between items-center group">
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{p.label}</label>
                                                <button onClick={() => setActiveInfo(activeInfo === p.key ? null : p.key)} className={`opacity-0 group-hover:opacity-100 transition-all w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border ${activeInfo === p.key ? 'bg-blue-600 border-blue-500 text-white opacity-100' : 'border-white/20 text-slate-600 hover:text-white'}`}>?</button>
                                            </div>
                                            <span className={`${p.accent === 'purple' ? 'text-purple-500' : 'text-blue-500'} font-black text-sm`}>
                                                {(options as any)[p.key]}
                                                {p.key === 'spliceThreshold' || p.key === 'cornerThreshold' ? '°' : ''}
                                            </span>
                                        </div>
                                        <input
                                            type="range" min={p.min} max={p.max} step={p.step}
                                            className={`w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer focus:outline-none ${p.accent === 'purple' ? 'accent-purple-600' : 'accent-blue-600'}`}
                                            value={(options as any)[p.key]}
                                            onChange={(e) => setOptions({ ...options, [p.key]: p.key.includes('Threshold') && p.key !== 'spliceThreshold' || p.key === 'lengthThreshold' ? parseFloat(e.target.value) : parseInt(e.target.value) })}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-center border-t border-white/5 pt-6">
                                <div className="flex-1 text-[10px] text-slate-500 leading-relaxed max-w-[800px]">
                                    <strong className="text-blue-400 uppercase tracking-widest block mb-1">PRO TiP FOR HERiTAGE:</strong>
                                    Sử dụng <span className="text-purple-400 font-bold underline">Stacked Mode</span> kết hợp với <span className="text-purple-400 font-bold underline">Max Iterations cao (50+)</span> để tái tạo các họa tiết di sản phức tạp nhất mà không để lại bất kỳ kẽ hở nào giữa các mảng màu.
                                </div>
                                <div className="w-full md:w-[280px]">
                                    {file ? (
                                        <button
                                            onClick={handleUpload}
                                            disabled={loading}
                                            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg hover:bg-blue-500 transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] disabled:opacity-50 active:scale-95 uppercase tracking-widest italic border-b-4 border-blue-800"
                                        >
                                            {svg ? 'RE-PROCESS MASTER' : 'START AI ENGiNE'}
                                        </button>
                                    ) : (
                                        <div className="w-full py-5 bg-white/5 border border-white/5 text-slate-600 rounded-3xl font-bold text-center text-xs uppercase tracking-widest italic">
                                            Wait for Image
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 opacity-40">
                    {[
                        { label: "Format", value: "SVG 1.1 / Vectorized" },
                        { label: "Engine", value: "VTracer AI Core" },
                        { label: "Target", value: "High-Quality Print" },
                        { label: "Privacy", value: "Local Environment" }
                    ].map((stat) => (
                        <div key={stat.label} className="flex flex-col border-l border-white/10 pl-4 py-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</span>
                            <span className="text-xs font-bold text-slate-400">{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

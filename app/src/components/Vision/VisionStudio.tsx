"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "ai"; text: string };

export default function VisionStudio() {
    const { house } = useStore();
    const [description, setDescription] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatInput, setChatInput] = useState("");
    
    // New strictly specified state
    const [variants, setVariants] = useState<string[]>([]);
    const [activeVariant, setActiveVariant] = useState(0);
    const [hasEstimate, setHasEstimate] = useState(false);
    const [genActive, setGenActive] = useState(false);
    const [progressPct, setProgressPct] = useState(0);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
    
    // Using Record<string, unknown> instead of any for the estimate data
    const [liveEstimate, setLiveEstimate] = useState<Record<string, unknown> | null>(null);
    
    const [threadsStatus, setThreadsStatus] = useState<"idle" | "running" | "done">("idle");

    async function generateLiveEstimate(currentMessages: Message[]) {
        try {
            const res = await fetch("/api/ai/blueprint", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-api-key": typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : ""
                },
                body: JSON.stringify({
                    messages: currentMessages,
                    context: `Vision Studio context. House: ${house.style}.`
                })
            });
            const data = await res.json();
            setLiveEstimate(data);
            setHasEstimate(true);
        } catch (error) {
            console.error("Failed to estimate", error);
        }
    }

    // Create a stable URL for the selected photo
    const photoUrl = useMemo(() => {
        if (!selectedFile) return null;
        try {
            return URL.createObjectURL(selectedFile);
        } catch (e) {
            console.error("Failed to create object URL", e);
            return null;
        }
    }, [selectedFile]);

    const fileToBase64 = (file: Blob | File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_DIM = 800;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > MAX_DIM) {
                            height *= MAX_DIM / width;
                            width = MAX_DIM;
                        }
                    } else {
                        if (height > MAX_DIM) {
                            width *= MAX_DIM / height;
                            height = MAX_DIM;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                    resolve(dataUrl.split(",")[1]);
                };
                img.onerror = reject;
                img.src = reader.result as string;
            };
            reader.onerror = reject;
        });
    };

    async function startGeneration() {
        if (!selectedFile) {
            alert("Upload a photograph first");
            return;
        }
        if (!description.trim()) {
            alert("Describe the transformation");
            return;
        }
        
        setGenActive(true);
        setThreadsStatus("running");
        setProgressPct(10);
        
        const progressInterval = setInterval(() => {
            setProgressPct(p => (p < 85 ? p + 5 + Math.random() * 5 : p));
        }, 350);

        try {
            const base64 = await fileToBase64(selectedFile);
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-api-key": typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : ""
                },
                body: JSON.stringify({
                    message: `Analyze this photo and my prompt: "${description}". Provide a professional design response that references specific elements in the photo.`,
                    image: base64,
                    context: `Renovation Workspace. Style: ${house.style}. Tone: Elite Architect.`
                })
            });
            
            clearInterval(progressInterval);
            setProgressPct(100);
            setTimeout(() => setProgressPct(0), 1000);
            
            const data = await res.json();
            setThreadsStatus("done");
            setTimeout(() => setThreadsStatus("idle"), 2500);

            let images = ["/img/transformation-result.png", "/img/transformation-industrial.png", "/img/transformation-minimalist.png"];
            if (data.generatedImages && data.generatedImages.length > 0) {
                images = data.generatedImages.map((b64: string) => `data:image/jpeg;base64,${b64}`);
                // Safely pad to 3 if Gemini drops a thread
                while (images.length < 3) {
                    images.push(images[images.length - 1]);
                }
            } else if (data.generatedImage) {
                images = [
                    `data:image/jpeg;base64,${data.generatedImage}`,
                    "/img/transformation-industrial.png",
                    "/img/transformation-minimalist.png"
                ];
            }

            setVariants(images);
            setActiveVariant(0);
            
            const updatedMessages: Message[] = [
                { role: "user", text: description },
                { role: "ai", text: data.reply || "I've analyzed your space. Let's discuss the proposed transformation." }
            ];
            setMessages(updatedMessages);
            
            setTimeout(() => {
                generateLiveEstimate(updatedMessages);
            }, 2200);

        } catch (err) {
            clearInterval(progressInterval);
            setProgressPct(0);
            setThreadsStatus("idle");
            console.error("AI Analysis failed", err);
            alert("AI Analysis failed. Please check your API key.");
        } finally {
            setGenActive(false);
        }
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] || null;
        if (!file) return;

        const isHeic = file.name.toLowerCase().endsWith(".heic") || file.type.includes("heic");
        
        if (isHeic) {
            try {
                // Dynamically import to avoid "window is not defined" during SSR
                const heic2any = (await import("heic2any")).default;
                
                const result = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                // heic2any can return an array if multiple images in HEIC
                const blob = Array.isArray(result) ? result[0] : result;
                setSelectedFile(blob);
            } catch (err) {
                console.error("HEIC conversion failed", err);
                alert("Failed to convert HEIC. Please try a JPG or PNG.");
            }
        } else {
            setSelectedFile(file);
        }
    }

    async function sendChatMessage() {
        if (!chatInput.trim()) return;
        const userMsg = chatInput.trim();
        const updatedMessages: Message[] = [...messages, { role: "user", text: userMsg }];
        setMessages(updatedMessages);
        setChatInput("");

        setGenActive(true);
        setThreadsStatus("running");
        setProgressPct(10);
        
        const progressInterval = setInterval(() => {
            // Using a seeded approach or just interval without random for strict react purity if needed, but setInterval is outside render.
            // Using functional state update is pure enough for inside the interval.
            setProgressPct(p => (p < 85 ? p + 5 + Math.random() * 5 : p));
        }, 350);

        try {
            const base64 = selectedFile ? await fileToBase64(selectedFile) : null;
            const res = await fetch("/api/ai", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-api-key": typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") || "" : ""
                },
                body: JSON.stringify({
                    message: `User wants to refine a vision: ${userMsg}`,
                    image: base64,
                    context: `Vision Studio context. House: ${house.style}. Tone: Professional designer.`
                })
            });
            
            clearInterval(progressInterval);
            setProgressPct(100);
            setTimeout(() => setProgressPct(0), 1000);
            
            const data = await res.json();
            setThreadsStatus("done");
            setTimeout(() => setThreadsStatus("idle"), 2500);

            let images = [...variants];
            if (data.generatedImages && data.generatedImages.length > 0) {
                images = data.generatedImages.map((b64: string) => `data:image/jpeg;base64,${b64}`);
                // Safely pad to 3 if Gemini drops a thread
                while (images.length < 3) {
                    images.push(images[images.length - 1]);
                }
            } else if (data.generatedImage) {
                images = [
                    `data:image/jpeg;base64,${data.generatedImage}`,
                    "/img/transformation-industrial.png",
                    "/img/transformation-minimalist.png"
                ];
            }
            if (images.length > 0) {
                setVariants(images);
                setActiveVariant(0);
            }
            
            const newArray: Message[] = [...updatedMessages, { role: "ai", text: data.reply || "I can adjust that. Let me update the render..." }];
            setMessages(newArray);
            
            // Re-run estimate if new layout requested
            setTimeout(() => {
                generateLiveEstimate(newArray);
            }, 2200);
        } catch {
            clearInterval(progressInterval);
            setProgressPct(0);
            setThreadsStatus("idle");
            setMessages(prev => [...prev, { role: "ai", text: "I'm having trouble sketching that right now. Let's try again." }]);
        } finally {
            setGenActive(false);
        }
    }

    async function generateBlueprint() {
        if (!hasEstimate) {
            alert("Generate a design first");
            return;
        }
        
        // Pretend routing
        setTimeout(() => {
            window.location.href = "/projects";
        }, 1000);
    }
    


    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--base)" }}>
            <header style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--void)", zIndex: 10, flexShrink: 0 }}>
                <div>
                    <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 20, fontWeight: 700, letterSpacing: "0.1em", color: "var(--white)", margin: 0 }}>Vision Studio</h1>
                    <div style={{ padding: "3px 9px", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 4, display: "inline-block" }}>{genActive ? "Generating" : variants.length > 0 ? "Comparative View" : "Ready"}</div>
                </div>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "360px 1fr 300px", flex: 1, minHeight: 0, overflow: "hidden" }}>
                
                {/* ── Left Column: Input + Chat ── */}
                <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid var(--border)", background: "var(--card)", minHeight: 0, overflow: "hidden" }}>
                    
                    {/* Upload Row */}
                    <div style={{ padding: 18, borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
                        <div 
                            onClick={() => document.getElementById("vs-d-file")?.click()}
                            style={{ 
                                background: photoUrl ? "none" : "var(--gold-dim)", 
                                border: photoUrl ? "1px solid var(--border)" : "1px dashed var(--border-warm)",
                                borderRadius: "var(--r)",
                                padding: photoUrl ? 0 : 16,
                                minHeight: 88,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                marginBottom: 16,
                                overflow: "hidden"
                            }}
                        >
                            <input type="file" id="vs-d-file" hidden accept="image/*" onChange={handleFileChange} />
                            {photoUrl ? (
                                <img alt="Source" src={photoUrl} style={{ width: "100%", height: "100%", minHeight: 88, objectFit: "cover", borderRadius: "10px" }} />
                            ) : (
                                <div style={{ fontSize: 12, color: "var(--muted)" }}>Drop photo here or click</div>
                            )}
                        </div>
                        
                        <div style={{ position: "relative" }}>
                            <textarea 
                                placeholder="Describe the desired transformation..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{ 
                                    width: "100%", height: 72, resize: "none", background: "var(--raised)", 
                                    border: "1px solid var(--border)", borderRadius: "var(--r-sm)", 
                                    padding: "10px 12px", color: "var(--white)", fontSize: 12, 
                                    fontFamily: "var(--font)", lineHeight: 1.6, marginBottom: 10
                                }}
                            />
                        </div>
                        
                        {/* Threads */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                            <div style={{ display: "flex", gap: 3 }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{ 
                                        width: 22, height: 5, borderRadius: 1, 
                                        background: threadsStatus === "running" ? "var(--gold)" : threadsStatus === "done" ? "var(--green-br)" : "var(--raised)",
                                        transition: "background 0.3s",
                                        transitionDelay: threadsStatus === "running" ? `${i * 0.4}s` : "0s"
                                    }} />
                                ))}
                            </div>
                            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Parallel Threads</div>
                        </div>

                        <button 
                            disabled={genActive}
                            onClick={startGeneration}
                            style={{ 
                                width: "100%", padding: 11, background: genActive ? "var(--raised)" : "var(--gold)", 
                                color: genActive ? "var(--muted)" : "var(--void)", borderRadius: "var(--r-sm)", 
                                fontSize: 13, fontWeight: 600, border: "none", cursor: genActive ? "not-allowed" : "pointer"
                            }}
                        >
                            {genActive ? "Analyzing spatial geometry..." : variants.length > 0 ? "Recalculate" : "Calculate - Generate 3 Variants"}
                        </button>
                    </div>

                    {/* Chat Section */}
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "12px 18px 0", fontSize: 9, color: "var(--soft)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>Architectural Brief</div>
                        <div style={{ flex: 1, padding: "0 18px", display: "flex", flexDirection: "column", gap: 12 }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ display: "flex", gap: 8, animation: "fadeUp 0.22s ease both" }}>
                                    {m.role === "ai" ? (
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--border-warm)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--gold)", fontWeight: 700, flexShrink: 0 }}>AI</div>
                                    ) : (
                                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--raised)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "var(--muted)", flexShrink: 0 }}>You</div>
                                    )}
                                    <div style={{ flex: 1, fontSize: 12, color: "var(--soft)" }}>
                                        {m.role === "ai" && <div style={{ fontSize: 8, color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 5 }}>Foundation AI</div>}
                                        {(() => {
                                            if (m.role === 'ai') {
                                                try {
                                                    const parsed = JSON.parse(m.text);
                                                    if (parsed.Analysis || parsed.Materials || parsed.Execution) {
                                                        return (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                                {parsed.Analysis && (
                                                                    <div className="vs-brief-block" style={{ background: "var(--raised)", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                                                                        <div style={{ fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>Analysis</div>
                                                                        <div style={{ fontSize: 12, color: 'var(--white)', opacity: 0.85, lineHeight: 1.5 }}>
                                                                            <ReactMarkdown>{parsed.Analysis}</ReactMarkdown>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {parsed.Materials && (
                                                                    <div className="vs-brief-block" style={{ background: "var(--raised)", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                                                                        <div style={{ fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>Materials</div>
                                                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                                            {(parsed.Materials as string[]).map((mat: string, idx: number) => <li key={idx} style={{ fontSize: 12, color: 'var(--white)', opacity: 0.85, marginBottom: 4 }}><ReactMarkdown>{mat}</ReactMarkdown></li>)}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {parsed.Execution && (
                                                                    <div className="vs-brief-block" style={{ background: "var(--raised)", padding: "10px 12px", borderRadius: "var(--r-sm)", border: "1px solid var(--border)" }}>
                                                                        <div style={{ fontSize: 9, color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>Execution Blueprint</div>
                                                                        <ol style={{ margin: 0, paddingLeft: 18 }}>
                                                                            {(parsed.Execution as string[]).map((step: string, idx: number) => <li key={idx} style={{ fontSize: 12, color: 'var(--white)', opacity: 0.85, marginBottom: 4 }}><ReactMarkdown>{step}</ReactMarkdown></li>)}
                                                                        </ol>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                } catch {
                                                    // fallback to normal markdown
                                                }
                                            }
                                            return (
                                                <div className="vs-brief-block" style={{ background: m.role === "ai" ? "var(--raised)" : "transparent", padding: m.role === "ai" ? "10px 12px" : 0, borderRadius: "var(--r-sm)", border: m.role === "ai" ? "1px solid var(--border)" : "none" }}>
                                                    <ReactMarkdown>{m.text}</ReactMarkdown>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                            <input 
                                value={chatInput} onChange={e => setChatInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendChatMessage()}
                                placeholder="Refine design..."
                                style={{ flex: 1, background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "8px 12px", color: "var(--white)", fontSize: 12 }}
                            />
                            <button onClick={sendChatMessage} style={{ background: "var(--gold)", color: "var(--void)", border: "none", borderRadius: "var(--r-sm)", padding: "0 12px" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Center Column: Lab Canvas ── */}
                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
                    {/* Progress Bar */}
                    <div style={{ height: 2, background: "var(--raised)", width: "100%", flexShrink: 0 }}>
                        <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--gold)", transition: "width 0.4s ease" }} />
                    </div>

                    <div style={{ flex: 1, position: "relative", display: "flex", minHeight: 0, overflow: "hidden" }}>
                        {variants.length === 0 ? (
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--muted)" }}>
                                <div style={{ width: 56, height: 56, border: "1px solid var(--border)", borderRadius: "var(--r)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" opacity="0.3"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </div>
                                <div style={{ fontSize: 12 }}>Awaiting Image Upload</div>
                            </div>
                        ) : (
                            <div style={{ flex: 1, position: "relative", minHeight: 0, overflow: "hidden" }}>
                                <img 
                                    alt="Variant"
                                    src={variants[activeVariant]} 
                                    onClick={() => setFullScreenImage(variants[activeVariant])}
                                    style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", cursor: "zoom-in", background: "rgba(0,0,0,0.1)" }} 
                                />
                                <div style={{ position: "absolute", top: 18, right: 18, fontSize: 8, color: "var(--gold)", background: "rgba(11,11,13,0.85)", border: "1px solid var(--gold)", borderRadius: "var(--r-sm)", padding: "3px 9px", backdropFilter: "blur(4px)", textTransform: "uppercase", pointerEvents: "none" }}>Variant {activeVariant + 1} / 3</div>
                                
                                {genActive && (
                                    <div style={{ position: "absolute", inset: 0, background: "rgba(11,11,13,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 8px)", gap: 4, marginBottom: 16 }}>
                                            {[0,1,2,3,4,5,6,7,8].map(i => (
                                                <div key={i} style={{ width: 8, height: 8, border: "1px solid var(--gold)", opacity: 0.4, animation: `vsLoadCell 1.5s infinite ${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)" }}>GENERATING</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div style={{ height: 80, background: "var(--card)", borderTop: "1px solid var(--border)", padding: "0 18px", display: "flex", alignItems: "center", gap: 9, flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
                        {genActive && variants.length === 0 ? (
                            <div style={{ height: 58, aspectRatio: "16/10", background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <div style={{ width: 14, height: 14, border: "1px solid var(--border)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            </div>
                        ) : variants.map((v, i) => (
                            <div 
                                key={i}
                                onClick={() => setActiveVariant(i)}
                                style={{ 
                                    height: 58, aspectRatio: "16/10", borderRadius: "var(--r-sm)", cursor: "pointer", position: "relative",
                                    border: activeVariant === i ? "1px solid var(--gold)" : "1px solid var(--border)",
                                    transition: "all 0.2s ease"
                                }}>
                                <img alt={`Thumbnail ${i+1}`} src={v} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "calc(var(--r-sm) - 1px)" }} />
                                <div style={{ position: "absolute", bottom: 4, right: 5, fontSize: 8, color: "var(--white)", background: "rgba(0,0,0,0.6)", padding: "1px 5px", borderRadius: 1 }}>{i + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Right Column: Estimate ── */}
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid var(--border)", background: "var(--card)", minHeight: 0, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                        <h2 style={{ fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 600, letterSpacing: "0.14em", color: "var(--white)", margin: 0 }}>Live Estimate</h2>
                    </div>

                    {!hasEstimate ? (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, opacity: 0.5, color: "var(--muted)", fontSize: 11, textAlign: "center" }}>
                            Awaiting design analysis...
                        </div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                            {/* Budget Section */}
                            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green-br)", animation: "pulseDot 2s ease-in-out infinite" }} />
                                    <div style={{ fontSize: 8, textTransform: "uppercase", color: "var(--green-br)" }}>Live</div>
                                </div>
                                <div style={{ fontFamily: "var(--font-cinzel)", fontSize: 32, fontWeight: 700, color: "var(--white)", letterSpacing: "0.04em", margin: "4px 0" }}>
                                    {liveEstimate?.cost ? String(liveEstimate.cost) : "$0"}
                                </div>
                                <div style={{ height: 2, background: "var(--raised)", borderRadius: 1, margin: "10px 0" }}>
                                    <div style={{ height: "100%", width: "68%", background: "var(--amber)", transition: "width 1s ease 0.2s" }} />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 12 }}>
                                    <div style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "7px 9px" }}>
                                        <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Materials</div>
                                        <div style={{ fontSize: 13, color: "var(--gold)" }}>{liveEstimate?.cost ? String(liveEstimate.cost).replace(/\d/g, (x: string) => parseInt(x)>5?"3":"4") : "-"}</div>
                                    </div>
                                    <div style={{ background: "var(--raised)", border: "1px solid var(--border)", borderRadius: "var(--r-sm)", padding: "7px 9px" }}>
                                        <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase" }}>Timeline</div>
                                        <div style={{ fontSize: 13, color: "var(--white)" }}>{liveEstimate?.time ? String(liveEstimate.time) : "-"}</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Materials List */}
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                <div style={{ padding: "10px 18px 6px", fontSize: 9, color: "var(--soft)", textTransform: "uppercase" }}>Shopping List</div>
                                {((liveEstimate?.items as Array<Record<string, unknown>>) || []).filter((i) => i.type !== "Task").map((item, idx) => (
                                    <div key={idx} style={{ padding: "8px 18px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--soft)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 13, height: 13, border: "1px solid var(--border)", borderRadius: 2, cursor: "pointer" }} />
                                            <span>{item.label as string}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Blueprint Button */}
                            <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border)" }}>
                                <button 
                                    onClick={generateBlueprint}
                                    style={{ 
                                        width: "100%", padding: 12, border: "1px solid var(--gold)", background: "transparent",
                                        color: "var(--gold)", fontFamily: "var(--font-cinzel)", fontSize: 14, fontWeight: 600, letterSpacing: "0.18em", 
                                        textTransform: "uppercase", borderRadius: "var(--r-sm)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                                    }}>
                                    Generate Blueprint
                                </button>
                                <div style={{ fontSize: 9, color: "var(--muted)", textAlign: "center", marginTop: 7, letterSpacing: "0.08em" }}>Locks estimate - Creates project folder</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Full Screen Image Modal ── */}
            <AnimatePresence>
                {fullScreenImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setFullScreenImage(null)}
                        style={{
                            position: "fixed", inset: 0, zIndex: 8000, background: "rgba(0,0,0,0.92)", 
                            backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "zoom-out", padding: 40
                        }}
                    >
                        <button 
                            onClick={() => setFullScreenImage(null)}
                            style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", fontSize: 11, padding: "6px 14px", borderRadius: "var(--r-sm)", cursor: "pointer" }}
                        >
                            Close
                        </button>
                        <motion.img 
                            alt="Full Screen View"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            src={fullScreenImage} 
                            style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", borderRadius: "var(--r)" }} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message, context, image } = await req.json();

        console.log("✦ FOUNDATION AI: Processing Request...");
        console.log(`- Message: ${message.substring(0, 100)}...`);
        console.log(`- Image: ${image ? "Attached" : "Not Attached"}`);

        // Get API key — env var or localStorage fallback via header
        const apiKey =
            process.env.GOOGLE_API_KEY ||
            req.headers.get("x-api-key") ||
            "";

        if (!apiKey) {
            return NextResponse.json({
                reply:
                    "No API key configured. Add your Google API key in Settings to enable AI features.",
            });
        }

        const model = "gemini-3.1-flash-image-preview";
        
        // Define 3 minor variations to force the AI to return 3 unique images
        const promptVariations = [
            `User Request: ${message}\nModifier: Stay as close to the user's exact request as possible.`,
            `User Request: ${message}\nModifier: Implement the request but lean towards a slightly warmer, more natural and organic aesthetic.`,
            `User Request: ${message}\nModifier: Implement the request but bring in a sleek, slightly more modern or refined edge.`
        ];

        console.log(`✦ FOUNDATION AI: Launching 3 parallel generation threads...`);

        const fetchPromises = promptVariations.map(async (promptVar, index) => {
            if (index > 0) {
                // Stagger requests by 500ms to avoid burst rate limits causing dropped threads
                await new Promise(r => setTimeout(r, index * 500));
            }
            const parts: Record<string, unknown>[] = [{ text: promptVar }];
            if (image) {
                parts.push({
                    inline_data: { mime_type: "image/jpeg", data: image }
                });
            }

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ 
                            text: `You are Foundation AI, an Elite Architectural and Interior Design AI. 
CORE ACTION: You analyze uploaded photos of interior spaces and provide highly professional, hyper-realistic renovation blueprints and advice based on user requests.

CRITICAL INSTRUCTION: You MUST ALSO generate and output a photorealistic image showing the final renovated space based on your advice. This is an absolute requirement.

STRUCTURAL CONSTRAINTS (CRITICAL): You must explicitly respect and maintain the room's original geometry, perspective, and specific anchor items visible in the photo unless the user explicitly asks to remove them. Always acknowledge existing structural elements like mirrors, windows, or doors.

FORMATTING REQUIREMENTS: 
You MUST format your response as a strict JSON object. Do NOT return markdown text outside of the JSON. Do NOT use backticks around the JSON. Avoid line breaks in string values if they break JSON quoting.
Use the following exact JSON schema:
{
    "Analysis": "[1 paragraph describing the current space, the lighting, and the structural intent of the remodel]",
    "Materials": [
        "**[Material Name]**: [Brief description of why it was chosen]",
        "**[Material Name]**: [Brief description of why it was chosen]"
    ],
    "Execution": [
        "**[Step 1]**: [Actionable remodel step]",
        "**[Step 2]**: [Actionable remodel step]"
    ]
}

QUALITY MODIFIERS: Frame your response as if you are preparing an architectural brief for a photorealistic rendering. Use terms related to natural, realistic lighting, material textures, and architectural photography.

CONTEXT: ${context}` 
                        }]
                    },
                    contents: [{ parts: parts }],
                }),
            });

            if (!res.ok) {
                throw new Error("API request failed");
            }
            return await res.json();
        });

        const results = await Promise.allSettled(fetchPromises);
        
        let primaryReply = "No text response generated.";
        const generatedImages: string[] = [];

        // Parse all 3 responses
        results.forEach((result, idx) => {
            if (result.status === "fulfilled") {
                const data = result.value;
                const responseParts = data.candidates?.[0]?.content?.parts || [];
                
                for (const p of responseParts) {
                    if (p.text && idx === 0) {
                        // Only save the text from the primary option to avoid duplicating text
                        let textContent = p.text;
                        textContent = textContent.replace(/```json/gi, "").replace(/```/g, "").trim();
                        primaryReply = textContent;
                    }
                    let foundImageInPart = false;
                    if (p.inlineData?.data) {
                        generatedImages.push(p.inlineData.data);
                        foundImageInPart = true;
                    } else if (p.inline_data?.data) {
                        generatedImages.push(p.inline_data.data);
                        foundImageInPart = true;
                    }
                    if (foundImageInPart) {
                        console.log(`✦ FOUNDATION AI: Thread ${idx + 1} Image Captured`);
                    }
                }
            } else {
                console.error(`Thread ${idx + 1} failed:`, result.reason);
            }
        });

        console.log(`✦ FOUNDATION AI: Primary Response Generated (${primaryReply.length} chars)`);
        console.log(`✦ FOUNDATION AI: Captured ${generatedImages.length} True AI Images from threads`);
        
        return NextResponse.json({ reply: primaryReply, generatedImages: generatedImages });

    } catch (error) {
        console.error("AI route error:", error);
        return NextResponse.json({ reply: "Something went wrong. Please try again." });
    }
}

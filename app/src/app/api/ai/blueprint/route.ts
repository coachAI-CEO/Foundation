import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { messages, context } = await req.json();

        const apiKey =
            process.env.GOOGLE_API_KEY ||
            req.headers.get("x-api-key") ||
            "";

        if (!apiKey) {
            return NextResponse.json({ error: "No API key" }, { status: 401 });
        }

        const model = "gemini-3.0-flash"; // Standard flash is fast and perfect for JSON structuring
        
        // Compile history into a prompt
        const chatLogs = messages.map((m: { role: string; text: string }) => `${m.role.toUpperCase()}: ${m.text}`).join("\n");

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ 
                        text: `You are an architectural estimation engine. 
Based on the following AI/User conversation about a remodel, extract and estimate the final blueprint.
You MUST respond with ONLY valid JSON and no other text or backticks.

Expected JSON Schema:
{
    "cost": "String (e.g. $2,400)",
    "time": "String (e.g. 2 Days)",
    "items": [
        { "type": "Task", "icon": "📐", "label": "String (e.g. Install oak slats)" },
        { "type": "Material", "icon": "📦", "label": "String (e.g. 10x White Oak Slats)" }
    ]
}

Context: ${context}` 
                    }]
                },
                contents: [{
                    parts: [{ text: `Here is the conversation:\n\n${chatLogs}\n\nGenerate the JSON blueprint.` }]
                }],
            }),
        });

        if (!res.ok) {
            console.error("Gemini API error:", await res.text());
            return NextResponse.json({ error: "Failed to generate blueprint" }, { status: 500 });
        }

        const data = await res.json();
        let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        
        // Clean up markdown code blocks if the AI disobeyed
        reply = reply.replace(/```json/g, "").replace(/```/g, "").trim();

        return new NextResponse(reply, {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Blueprint route error:", error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}

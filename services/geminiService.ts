
import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateAnnouncement = async (topic: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "กรุณาตั้งค่า API KEY เพื่อใช้งาน AI";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a formal yet friendly dormitory announcement in Thai about: "${topic}". Keep it concise (under 150 words). Structure it with a clear title and body.`,
    });
    return response.text || "ไม่สามารถสร้างข้อความได้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อ AI";
  }
};

export const analyzeMaintenanceRequest = async (description: string): Promise<{ priority: string; category: string; advice: string }> => {
  const ai = getAiClient();
  if (!ai) return { priority: 'MEDIUM', category: 'General', advice: 'Manual review required' };

  try {
    const prompt = `Analyze this dormitory maintenance request: "${description}". 
    Return a JSON object with:
    1. "priority" (LOW, MEDIUM, or HIGH)
    2. "category" (Plumbing, Electric, Appliance, Furniture, Other)
    3. "advice" (Short technical advice for the handyman in Thai)`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { priority: 'MEDIUM', category: 'General', advice: 'AI unavailable' };
  }
};

export const readMeterImage = async (base64Image: string, type: 'WATER' | 'ELECTRIC'): Promise<number | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    try {
        const prompt = `Look at this image of a ${type} utility meter. 
        Identify the numeric reading on the display. 
        Ignore any serial numbers or other text.
        Return ONLY the number (integer or float). If unreadable, return 0.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: prompt }
                ]
            }
        });
        
        const text = response.text?.trim();
        // Remove non-numeric characters except dot
        const cleanText = text?.replace(/[^\d.]/g, '');
        const number = parseFloat(cleanText || "0");
        return isNaN(number) ? null : number;
    } catch (error) {
        console.error("Vision Error:", error);
        return null;
    }
};

export const generateParcelNotification = async (details: { room: string, carrier: string, name: string }): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return `พัสดุมาถึงแล้ว ห้อง ${details.room} (${details.carrier})`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, polite notification message (Thai language) for a tenant.
            Context: A parcel has arrived.
            Room: ${details.room}
            Recipient: ${details.name}
            Carrier: ${details.carrier}
            
            Include emojis. Tell them to pick it up at the office before 6 PM.`
        });
        return response.text || "";
    } catch (error) {
        return "มีพัสดุมาใหม่ กรุณาติดต่อรับที่สำนักงาน";
    }
};

export const chatWithAI = async (message: string, history: { role: string; text: string }[]) => {
    const ai = getAiClient();
    if (!ai) return "ระบบ AI กำลังปิดปรับปรุงชั่วคราว";

    try {
        const context = `
        You are "NexBot", a highly intelligent and helpful AI assistant for "NexDorm" apartment complex.
        
        CRITICAL INFORMATION FOR ANSWERS:
        - Rent Due Date: 5th of every month.
        - Late Payment Penalty: 100 THB per day overdue.
        - Office Hours: 9:00 AM - 6:00 PM daily.
        - Emergency Contact: 02-123-4567 (24/7 Security).
        - WiFi Password: "nexdorm_secure_5g".
        - Keycard Lost Fee: 200 THB replacement.
        - Policies: No pets allowed. Quiet hours 10 PM - 7 AM. No smoking in rooms.

        ROLE:
        - Answer questions politely in Thai.
        - If a user asks about their specific bill, remind them to check the "Billing" tab or scan the QR code on their door invoice.
        - If a user wants to report an issue, guide them to the "Maintenance" tab.
        - Be concise, friendly, and professional.
        `;

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: context,
            }
        });

        // Construct history context (simplified for stateless requests)
        let historyContext = "";
        if (history.length > 0) {
             historyContext = "Previous conversation:\n" + history.map(h => `${h.role}: ${h.text}`).join("\n") + "\n\n";
        }
        
        const result = await chat.sendMessage({ message: historyContext + "User: " + message });
        return result.text;
    } catch (error) {
        console.error("Chat Error:", error);
        return "ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง";
    }
};

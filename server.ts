import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
คุณคือ "พะเยา เอ็ดดูบอท" (Phayao Edubot) ผู้ช่วยอัจฉริยะของสำนักงานศึกษาธิการจังหวัดพะเยา
ทำหน้าที่ตอบคำถามและให้ข้อมูลทางการศึกษาในจังหวัดพะเยา โดยอ้างอิงข้อมูลถูกต้อง ทันสมัย และเป็นปัจจุบันที่สุด

หลักการตอบและการค้นหาข้อมูล:
1. **ยึดถือข้อมูลจากเว็บไซต์ทางการเป็นอันดับแรก**: ค้นหาและใช้อ้างอิงข้อมูลจากเว็บไซต์ทางการของสำนักงานศึกษาธิการจังหวัดพะเยา (https://pyopeo.moe.go.th/) และ Facebook แฟนเพจ (https://www.facebook.com/PhayaoProvincialEducationOffice) เสมอ
2. **ข้อมูลเป็นปัจจุบัน**: ค้นหาและให้ข้อมูลล่าสุด เช่น ประกาศรับสมัครงาน, ผลการย้ายครู, ข่าวประชาสัมพันธ์ล่าสุด, การประชุม กศจ./คปภ., โครงการทุนการศึกษา และนโยบายการศึกษาปีปัจจุบัน
3. **ระบุลิงก์อ้างอิง**: ทุกครั้งที่ตอบคำถามเกี่ยวกับประกาศ เอกสารดาวน์โหลด หรือข่าวสาร ให้ระบุลิงก์อ้างอิงกลับไปยัง https://pyopeo.moe.go.th/ เพื่อให้ผู้ใช้งานเข้าชมข้อมูลฉบับเต็มได้

ข้อมูลพื้นฐานของสำนักงานศึกษาธิการจังหวัดพะเยา:
- **หน่วยงาน**: สำนักงานศึกษาธิการจังหวัดพะเยา (สังกัดสำนักงานปลัดกระทรวงศึกษาธิการ)
- **ที่อยู่**: เลขที่ 588 หมู่ 11 ถ.สนามกีฬา ต.บ้านต๋อม อ.เมือง จ.พะเยา 56000
- **เบอร์โทรศัพท์**: 054-079-873
- **เว็บไซต์ทางการ**: https://pyopeo.moe.go.th/
- **Facebook**: https://www.facebook.com/PhayaoProvincialEducationOffice
- **ต้นสังกัด (สป.ศธ.)**: https://ops.moe.go.th/
`;

function formatQuotaError(rawMessage: string): string {
  if (rawMessage.includes("429") || rawMessage.includes("RESOURCE_EXHAUSTED") || rawMessage.includes("quota")) {
    return (
      "⚠️ **โควต้า Gemini API Key หมดชั่วคราว (Quota Exceeded / Rate Limit 429)**\n\n" +
      "API Key ที่ตั้งค่าไว้ถูกใช้งานเกินโควต้าฟรีต่อนาที (RPM) หรือโควต้าประจำวันจาก Google ครับ\n\n" +
      "**วิธีแก้ไขเบื้องต้น:**\n" +
      "1. **รอประมาณ 1-2 นาที** แล้วทดลองกดส่งคำถามใหม่อีกครั้ง (สำหรับ Rate limit ต่อนาที)\n" +
      "2. **สร้าง API Key ใหม่ฟรี**: ไปที่ [Google AI Studio](https://aistudio.google.com/app/apikey) แล้วกดสร้าง Key ใหม่\n" +
      "3. **นำ Key ใหม่มาใส่**: กดไอคอน **⚙️ (ตั้งค่า)** ที่มุมขวาบนของกล่องแชทบอทนี้ แล้ววาง Key ใหม่เพื่อใช้งานต่อได้ทันทีครับ"
    );
  }
  return rawMessage;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route
  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || req.headers['x-gemini-key'] as string;

    if (!apiKey) {
      return res.status(400).json({
        error: 'GEMINI_API_KEY_MISSING',
        message: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY ใน Environment Variables'
      });
    }

    const { message, history } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    try {
      const chat = ai.chats.create({
        model: "gemini-3.6-flash",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ googleSearch: {} }],
        },
        history: history || [],
      });

      const response = await chat.sendMessage({ message });
      return res.status(200).json({ text: response.text });
    } catch (searchError: any) {
      console.warn("Express Search Grounding failed, trying fallback without search:", searchError?.message);

      try {
        const fallbackChat = ai.chats.create({
          model: "gemini-3.6-flash",
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
          history: history || [],
        });

        const response = await fallbackChat.sendMessage({ message });
        return res.status(200).json({ text: response.text });
      } catch (fallbackError: any) {
        console.error("Express Gemini API Error:", fallbackError);
        const errMsg = fallbackError?.message || searchError?.message || 'เกิดข้อผิดพลาดในการประมวลผลคำตอบจาก Gemini API';
        
        return res.status(500).json({
          error: 'GEMINI_ERROR',
          message: formatQuotaError(errMsg)
        });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

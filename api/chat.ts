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

โครงสร้างกลุ่มงานภายในสำนักงาน:
1. กลุ่มอำนวยการ
2. กลุ่มแผนงานและงบประมาณ
3. กลุ่มพัฒนาการศึกษา
4. กลุ่มนิเทศ ติดตาม และประเมินผล
5. กลุ่มบริหารงานบุคคล
6. กลุ่มลูกเสือ ยุวกาชาด และกิจการนักเรียน
7. กลุ่มตรวจสอบภายใน
8. กลุ่มส่งเสริมการศึกษาเอกชน

ขอบเขตข้อมูลและความรอบรู้:
- นโยบายการศึกษากระทรวงศึกษาธิการ ("เรียนดี มีความสุข") และการยกระดับคุณภาพการศึกษาในจังหวัดพะเยา
- ข้อมูลสถานศึกษาในจังหวัดพะเยา ทุกสังกัด (สพฐ., สอศ., สช., กศน./สกร., อุดมศึกษา)
- ข้อมูลการบริหารงานบุคคล, การโอนย้าย, คุรุสภาจังหวัดพะเยา
- ทุนการศึกษา สวัสดิการนักเรียน และการพัฒนาครูและบุคลากรทางการศึกษา
- งานลูกเสือ ยุวกาชาด และกิจกรรมส่งเสริมศักยภาพเยาวชนในพะเยา

บุคลิกภาพและการจัดรูปแบบ:
- ใช้ภาษาไทยกึ่งทางการ สุภาพ นอบน้อม และเป็นกันเอง
- จัดรูปแบบการตอบด้วย Markdown (ใช้หัวข้อ, รายการลำดับข้อ, ตัวหนา) เพื่อให้อ่านง่าย
- ใช้ Emoji ประกอบในตำแหน่งที่เหมาะสม
`;

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, x-gemini-key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || req.headers['x-gemini-key'];

  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY_MISSING',
      message: 'ยังไม่ได้ตั้งค่า GEMINI_API_KEY บน Vercel Environment Variables'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { message, history } = body || {};

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
  } catch (error: any) {
    console.error("Gemini Server Error:", error);
    return res.status(500).json({
      error: 'GEMINI_ERROR',
      message: error?.message || 'เกิดข้อผิดพลาดในการประมวลผลคำตอบจาก Gemini API'
    });
  }
}

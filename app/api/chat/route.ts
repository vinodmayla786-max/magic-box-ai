import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Database files ko import kar rahe hain
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message, selectedRole, magicText } = await req.json();

    // 1. Database se connection banayein
    await connectToDatabase();

    // 2. Purani chat history nikalein (aakhiri 20 messages taaki limit cross na ho)
    const historyDocs = await Chat.find().sort({ timestamp: 1 }).limit(20);

    // AI ko jis format mein history chahiye, usme convert karein
    const formattedHistory = historyDocs.map((doc) => ({
      role: doc.role,
      parts: [{ text: doc.content }],
    }));

    const systemInstruction = `You are the core intelligence of 'Magic Box', an Emotional Companion. 
    The user wants you to act as: ${selectedRole ? selectedRole : 'a custom companion'}. 
    User's thoughts from the Magic Box: ${magicText ? magicText : 'None'}.
    Always reply in a warm, friendly, and human-like tone. Use Hinglish if appropriate. Be concise and supportive. Do not sound like an AI robot.`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction 
    });

    // 3. Normal 'generateContent' ki jagah 'startChat' use karein jisme history pass ho
    const chatSession = model.startChat({
      history: formattedHistory,
    });

    // 4. AI ko naya message bhejein aur jawab lein
    const result = await chatSession.sendMessage(message);
    const text = result.response.text();

    // 5. Database mein dono ka message hamesha ke liye SAVE kar dein
    await Chat.create({ role: 'user', content: message });
    await Chat.create({ role: 'model', content: text });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: 'Failed to connect to Magic Box AI' }, { status: 500 });
  }
}
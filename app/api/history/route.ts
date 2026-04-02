import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    // URL se email nikaalna
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // STRICT CHECK: Agar email nahi hai ya 'undefined' shabd hai, toh khali bhejo
    if (!email || email === 'undefined' || email === 'null') {
       return NextResponse.json([]); 
    }

    // Sirf is exact email waali chats dhoondho
    const history = await Chat.find({ userEmail: email }).sort({ timestamp: -1 }).limit(15);
    return NextResponse.json(history.reverse());
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
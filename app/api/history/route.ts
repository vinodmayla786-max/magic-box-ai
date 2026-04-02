import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    await connectToDatabase();
    // Database se purani saari history time ke hisaab se nikal lo
    // Hum aakhiri 15 messages nikal rahe hain (-1 matlab latest first)
const history = await Chat.find().sort({ timestamp: -1 }).limit(15);
// Phir unhe reverse kar rahe hain taaki screen par sahi order mein dikhein
return NextResponse.json(history.reverse());
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
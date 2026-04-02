import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    await connectToDatabase();
    // Database se purani saari history time ke hisaab se nikal lo
    const history = await Chat.find().sort({ timestamp: 1 });
    return NextResponse.json(history);
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
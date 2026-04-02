import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: ['user', 'model'], // Gemini AI ko 'model' kehta hai
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
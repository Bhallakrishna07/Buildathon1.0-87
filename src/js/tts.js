// sarvam text to speech llm integration
import { Sarvam } from "@sarvam-ai/sarvam";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export async function textToSpeech(text) {
  try {
    // Initialize Sarvam with your API key from .env
    const sarvam = new Sarvam(process.env.sarvam_text_to_voice_api_key);

    // Call Sarvam TTS Model
    const result = await sarvam.audio.speech.create({
      model: "sarvam/tts-v1",   // TTS model
      voice: "meera",           // Options: meera, veena, arjun, etc.
      input: text,              // TEXT → SPEECH
      format: "mp3"             // Output format
    });

    // Convert base64 → buffer
    const audioBuffer = Buffer.from(result.audio, "base64");

    // Save file locally
    const filePath = "speech_output.mp3";
    fs.writeFileSync(filePath, audioBuffer);

    return filePath;   // return file name so backend can send to frontend

  } catch (error) {
    console.error("TTS Error:", error);
    return "Error generating speech";
  }
}

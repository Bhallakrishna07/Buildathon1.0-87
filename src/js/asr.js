// importing sarvam voice to text using sarvam ai llm
import { Sarvam } from "@sarvam-ai/sarvam";
import dotenv from "dotenv";

dotenv.config();

export async function convertAudioToText(base64Audio) {
  try {
    // Convert base64 → Buffer
    const audioBuffer = Buffer.from(base64Audio, "base64");

    // Initialize Sarvam with ASR key
    const sarvam = new Sarvam(process.env.Sarvam_voice_to_text_api_key);

    // Send audio to ASR model
    const result = await sarvam.audio.transcriptions.create({
      file: audioBuffer,
      model: "sarvam/asr-thor",
      language: "hi" // choose: hi, en, ta, te, etc.
    });

    return result.text;

  } catch (err) {
    console.error("ASR Error:", err);
    return "Please speak clearly.";
  }
}

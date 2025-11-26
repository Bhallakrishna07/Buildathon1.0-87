// sarvam llm chat integration
import { Sarvam } from "@sarvam-ai/sarvam";
import dotenv from "dotenv";

dotenv.config();

// sarvam llm chat function
export async function askSarvam(question) {
  try {
    const sarvam = new Sarvam(process.env.sarvam_chat_api_key);

    const response = await sarvam.chat.completions.create({
      model: "sarvam/sarvam-2b",
      messages: [
        { role: "system", content: "You are an agriculture expert" },
        { role: "user", content: question }
      ]
    });

    return response.choices[0].message.content;

  } catch (err) {
    console.error("Sarvam Error:", err);
    return "Agricultural conditions vary a lot based on soil type, local climate, crop variety, and farming practices. It's best to consult a nearby agricultural officer, Krishi Vigyan Kendra (KVK), or a certified agronomist for guidance that fits your specific field and conditions. They can give precise and safe recommendations based on your location";
  }
}

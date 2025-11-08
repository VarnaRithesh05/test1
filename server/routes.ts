import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  app.post("/api/analyze-yml", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are an expert DevOps engineer. The following is a YAML file. Analyze it for errors, misconfigurations, and bad practices. Respond ONLY with a single JSON object with three keys: 1. corrected_yaml (the full corrected YAML file), 2. explanation (a detailed, step-by-step explanation of what was wrong and why you fixed it), and 3. is_correct (a boolean - true if the original YAML was already correct, false if issues were found).

YAML file to analyze:
${fileContent}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      res.json(parsedResponse);
    } catch (error) {
      console.error("Error analyzing YAML:", error);
      res.status(500).json({ error: "Failed to analyze YAML file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

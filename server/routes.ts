import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import OpenAI from "openai";

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Using OpenAI blueprint - the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  app.post("/api/analyze-yml", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      
      const prompt = `You are an expert DevOps engineer. The following is a YAML file. Analyze it for errors, misconfigurations, and bad practices. Respond with a JSON object with three keys: 1. corrected_yaml (the full corrected YAML file), 2. explanation (a detailed, step-by-step explanation of what was wrong and why you fixed it), and 3. is_correct (a boolean - true if the original YAML was already correct, false if issues were found).

YAML file to analyze:
${fileContent}`;

      // Using gpt-5 model with JSON response format
      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: "You are an expert DevOps engineer who analyzes YAML files. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });
      
      const responseText = completion.choices[0].message.content || "{}";
      console.log("OpenAI response:", responseText);
      
      const parsedResponse = JSON.parse(responseText);
      
      res.json(parsedResponse);
    } catch (error: any) {
      console.error("Error analyzing YAML:", error);
      
      // Provide more specific error messages
      if (error?.status === 429) {
        return res.status(429).json({ 
          error: "API quota exceeded. Please check your OpenAI API key has sufficient credits." 
        });
      }
      
      if (error?.status === 401) {
        return res.status(401).json({ 
          error: "Invalid API key. Please check your OPENAI_API_KEY configuration." 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to analyze YAML file. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

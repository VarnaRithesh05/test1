import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

async function analyzeYAMLContent(fileContent: string, genAI: GoogleGenerativeAI) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash"
  });
  
  const prompt = `You are an expert DevOps engineer. The following is a YAML file. Analyze it for errors, misconfigurations, and bad practices. Respond ONLY with a single JSON object with three keys: 1. corrected_yaml (the full corrected YAML file), 2. explanation (a detailed, step-by-step explanation of what was wrong and why you fixed it), and 3. is_correct (a boolean - true if the original YAML was already correct, false if issues were found).

YAML file to analyze:
${fileContent}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  
  console.log("Gemini response:", text);
  
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }
  
  return JSON.parse(jsonMatch[0]);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  
  app.post("/api/analyze-yml", upload.single('file'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const parsedResponse = await analyzeYAMLContent(fileContent, genAI);
      
      res.json(parsedResponse);
    } catch (error: any) {
      console.error("Error analyzing YAML:", error);
      
      // Provide more specific error messages
      if (error?.status === 429 || error?.message?.includes("quota")) {
        return res.status(429).json({ 
          error: "API quota exceeded. Please check your Gemini API key has sufficient credits." 
        });
      }
      
      if (error?.status === 401 || error?.message?.includes("API key")) {
        return res.status(401).json({ 
          error: "Invalid API key. Please check your GEMINI_API_KEY configuration." 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to analyze YAML file. Please try again." 
      });
    }
  });

  app.post("/api/generate-yml", async (req, res) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "No prompt provided" });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });
      
      const aiPrompt = `You are a DevOps expert. The user will provide a plain-text request. Generate a complete, secure, and production-ready Dockerfile or docker-compose.yml or GitHub Actions YAML file that meets their request. Only output the code, with no other text before or after it.

User request: ${prompt}`;

      const result = await model.generateContent(aiPrompt);
      const response = result.response;
      const generatedYaml = response.text();
      
      console.log("Gemini generated YAML:", generatedYaml);
      
      res.json({ generated_yaml: generatedYaml });
    } catch (error: any) {
      console.error("Error generating YAML:", error);
      
      if (error?.status === 429 || error?.message?.includes("quota")) {
        return res.status(429).json({ 
          error: "API quota exceeded. Please check your Gemini API key has sufficient credits." 
        });
      }
      
      if (error?.status === 401 || error?.message?.includes("API key")) {
        return res.status(401).json({ 
          error: "Invalid API key. Please check your GEMINI_API_KEY configuration." 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate YAML file. Please try again." 
      });
    }
  });

  app.post("/api/github-webhook", async (req, res) => {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      const event = req.headers['x-github-event'] as string;
      
      console.log(`Received GitHub webhook event: ${event}`);
      
      // Verify webhook signature if secret is configured
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (webhookSecret) {
        // Reject if secret is set but signature is missing
        if (!signature) {
          console.error('Missing webhook signature');
          return res.status(403).json({ error: "Missing signature" });
        }
        
        // Verify signature using raw body
        const rawBody = req.rawBody as Buffer;
        if (!rawBody) {
          console.error('Raw body not available for signature verification');
          return res.status(500).json({ error: "Server configuration error" });
        }
        
        const hmac = crypto.createHmac('sha256', webhookSecret);
        const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
        
        // Use timing-safe comparison
        const signatureBuffer = Buffer.from(signature);
        const digestBuffer = Buffer.from(digest);
        
        if (signatureBuffer.length !== digestBuffer.length || 
            !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
          console.error('Invalid webhook signature');
          return res.status(403).json({ error: "Invalid signature" });
        }
        
        console.log('Webhook signature verified successfully');
      }
      
      // Only handle push events
      if (event !== 'push') {
        return res.status(200).json({ message: "Event type not supported" });
      }
      
      const payload = req.body;
      const { commits, repository } = payload;
      
      if (!commits || !Array.isArray(commits)) {
        return res.status(400).json({ error: "Invalid payload" });
      }
      
      const yamlFiles: string[] = [];
      
      // Extract YAML files from all commits
      for (const commit of commits) {
        const modifiedFiles = [...(commit.added || []), ...(commit.modified || [])];
        
        for (const file of modifiedFiles) {
          if (file.endsWith('.yml') || file.endsWith('.yaml')) {
            yamlFiles.push(file);
          }
        }
      }
      
      if (yamlFiles.length === 0) {
        return res.status(200).json({ 
          message: "No YAML files modified in this push",
          analyzed: []
        });
      }
      
      console.log(`Found ${yamlFiles.length} YAML files to analyze:`, yamlFiles);
      
      const results = [];
      
      // Fetch and analyze each YAML file
      for (const filePath of yamlFiles) {
        try {
          // Fetch file content from GitHub API
          const fileUrl = `https://api.github.com/repos/${repository.full_name}/contents/${filePath}?ref=${payload.after}`;
          
          const headers: Record<string, string> = {
            'Accept': 'application/vnd.github.v3.raw',
            'User-Agent': 'AutoPatcher-Webhook'
          };
          
          // Add GitHub token if available
          const githubToken = process.env.GITHUB_TOKEN;
          if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
          }
          
          const fileResponse = await fetch(fileUrl, { headers });
          
          if (!fileResponse.ok) {
            console.error(`Failed to fetch ${filePath}: ${fileResponse.statusText}`);
            results.push({
              file: filePath,
              error: `Failed to fetch file: ${fileResponse.statusText}`
            });
            continue;
          }
          
          const fileContent = await fileResponse.text();
          
          // Analyze the YAML file
          const analysis = await analyzeYAMLContent(fileContent, genAI);
          
          results.push({
            file: filePath,
            analysis
          });
          
          console.log(`Analyzed ${filePath}: ${analysis.is_correct ? 'VALID' : 'ISSUES FOUND'}`);
        } catch (error: any) {
          console.error(`Error analyzing ${filePath}:`, error);
          results.push({
            file: filePath,
            error: error.message || 'Analysis failed'
          });
        }
      }
      
      // Save webhook event to storage
      try {
        await storage.createWebhookEvent({
          repository: repository.full_name,
          eventType: event,
          filesAnalyzed: results,
          status: results.every(r => !r.error) ? 'success' : 'partial',
        });
      } catch (storageError) {
        console.error("Error saving webhook event:", storageError);
      }
      
      res.status(200).json({
        message: `Analyzed ${results.length} YAML file(s)`,
        repository: repository.full_name,
        analyzed: results
      });
    } catch (error: any) {
      console.error("Error processing webhook:", error);
      
      // Try to save error event
      try {
        const payload = req.body;
        if (payload?.repository?.full_name) {
          await storage.createWebhookEvent({
            repository: payload.repository.full_name,
            eventType: req.headers['x-github-event'] as string || 'unknown',
            filesAnalyzed: [],
            status: 'error',
          });
        }
      } catch (storageError) {
        console.error("Error saving error webhook event:", storageError);
      }
      
      res.status(500).json({ 
        error: "Failed to process webhook" 
      });
    }
  });

  app.get("/api/webhook-events", async (_req, res) => {
    try {
      const events = await storage.getWebhookEvents(100);
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching webhook events:", error);
      res.status(500).json({ 
        error: "Failed to fetch webhook events" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

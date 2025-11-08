import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";
import Database from "@replit/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

async function analyzeYAMLContent(fileContent: string, genAI: GoogleGenerativeAI) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash"
  });
  
  const prompt = `You are an expert DevOps engineer. The following is a YAML file. Analyze it for errors, misconfigurations, and bad practices. 

IMPORTANT: In the corrected_yaml, add inline comments using # to highlight ALL changes you made. For each correction:
- Add a comment on the same line or immediately above showing what was changed
- Use format like "# FIXED: [brief description]" or "# CHANGED: [old value] → [new value]" or "# ADDED: [reason]"
- Be concise but clear about what was corrected

Respond ONLY with a single JSON object with three keys:
1. corrected_yaml (the full corrected YAML file with inline comments marking ALL changes)
2. explanation (a detailed, step-by-step explanation of what was wrong and why you fixed it)
3. is_correct (a boolean - true if the original YAML was already correct, false if issues were found)

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

async function analyzeDiff(diffText: string, genAI: GoogleGenerativeAI) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash"
  });
  
  const prompt = `You are a senior software engineer. The following is a 'diff' file from a GitHub pull request. In plain English, provide a 3-bullet-point summary of what this pull request does. After the summary, explain the changes in each file, one by one, and identify any potential bugs or improvements.

Diff:
${diffText}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const analysis = response.text();
  
  console.log("Diff analysis:", analysis);
  
  return analysis;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const db = new Database();
  
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

  app.post("/api/explain-code", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: "No code provided" });
      }

      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash"
      });
      
      const aiPrompt = `You are a senior software engineer and technical educator. The user will provide a code snippet. Explain what this code does in clear, plain English. Break down the logic step-by-step, explain any complex concepts, and describe the overall purpose. Be thorough but easy to understand.

Code to explain:
${code}`;

      const result = await model.generateContent(aiPrompt);
      const response = result.response;
      const explanation = response.text();
      
      console.log("Gemini code explanation generated");
      
      res.json({ explanation: explanation });
    } catch (error: any) {
      console.error("Error explaining code:", error);
      
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
        error: "Failed to explain code. Please try again." 
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
      
      // Handle both push and pull_request events
      if (event !== 'push' && event !== 'pull_request') {
        return res.status(200).json({ message: "Event type not supported" });
      }
      
      const payload = req.body;
      
      // Handle pull_request events
      if (event === 'pull_request') {
        const { action, pull_request, repository } = payload;
        
        // Only handle opened and synchronize actions
        if (action !== 'opened' && action !== 'synchronize') {
          return res.status(200).json({ 
            message: `Pull request action '${action}' not processed` 
          });
        }
        
        console.log(`Processing pull request #${pull_request.number}: ${pull_request.title}`);
        
        try {
          // Fetch the diff from the diff_url
          const diffUrl = pull_request.diff_url;
          const headers: Record<string, string> = {
            'User-Agent': 'AutoPatcher-Webhook'
          };
          
          // Add GitHub token if available
          const githubToken = process.env.GITHUB_TOKEN;
          if (githubToken) {
            headers['Authorization'] = `token ${githubToken}`;
          }
          
          const diffResponse = await fetch(diffUrl, { headers });
          
          if (!diffResponse.ok) {
            console.error(`Failed to fetch diff: ${diffResponse.statusText}`);
            
            // Save error event before returning
            const webhookEvent = {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              status: 'error',
              eventType: 'pull_request',
              repository: repository.full_name,
              pullRequest: {
                number: pull_request.number,
                title: pull_request.title,
                action: action
              },
              error: `Failed to fetch diff: ${diffResponse.statusText}`
            };
            
            const eventKey = `webhook:${webhookEvent.id}`;
            await db.set(eventKey, webhookEvent);
            console.log(`Saved error webhook event to Replit DB: ${eventKey}`);
            
            return res.status(500).json({ 
              error: `Failed to fetch diff: ${diffResponse.statusText}` 
            });
          }
          
          const diffText = await diffResponse.text();
          console.log(`Fetched diff (${diffText.length} characters)`);
          
          // Analyze the diff with AI
          const analysis = await analyzeDiff(diffText, genAI);
          
          // Save pull request analysis to Replit Database
          const webhookEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'success',
            eventType: 'pull_request',
            repository: repository.full_name,
            pullRequest: {
              number: pull_request.number,
              title: pull_request.title,
              action: action,
              url: pull_request.html_url
            },
            analysis: analysis
          };
          
          const eventKey = `webhook:${webhookEvent.id}`;
          await db.set(eventKey, webhookEvent);
          console.log(`Saved pull request analysis to Replit DB: ${eventKey}`);
          
          return res.status(200).json({
            message: `Analyzed pull request #${pull_request.number}`,
            repository: repository.full_name,
            pull_request: pull_request.number,
            analysis: analysis
          });
        } catch (error: any) {
          console.error("Error analyzing pull request:", error);
          
          // Save error event
          try {
            const webhookEvent = {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              status: 'error',
              eventType: 'pull_request',
              repository: repository.full_name,
              pullRequest: {
                number: pull_request.number,
                title: pull_request.title,
                action: action
              },
              error: error.message || 'Analysis failed'
            };
            
            const eventKey = `webhook:${webhookEvent.id}`;
            await db.set(eventKey, webhookEvent);
          } catch (storageError) {
            console.error("Error saving error event:", storageError);
          }
          
          return res.status(500).json({ 
            error: "Failed to analyze pull request" 
          });
        }
      }
      
      // Handle push events
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
            originalContent: fileContent,
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
      
      // Save webhook event to Replit Database
      try {
        const webhookEvent = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          status: results.every(r => !r.error) ? 'success' : 'partial',
          eventType: event,
          repository: repository.full_name,
          filesAnalyzed: results
        };
        
        const eventKey = `webhook:${webhookEvent.id}`;
        await db.set(eventKey, webhookEvent);
        console.log(`Saved webhook event to Replit DB: ${eventKey}`);
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
      
      // Try to save error event to Replit Database
      try {
        const errorPayload = req.body;
        if (errorPayload?.repository?.full_name) {
          const webhookEvent = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            status: 'error',
            eventType: req.headers['x-github-event'] as string || 'unknown',
            repository: errorPayload.repository.full_name,
            filesAnalyzed: []
          };
          
          const eventKey = `webhook:${webhookEvent.id}`;
          await db.set(eventKey, webhookEvent);
          console.log(`Saved error webhook event to Replit DB: ${eventKey}`);
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
      // Fetch all webhook events from Replit Database
      const allKeys = await db.list("webhook:");
      const events: any[] = [];
      
      // Extract the keys array from Replit DB response format
      // Replit DB returns { ok: true, value: [...] } format
      const keys = (allKeys as any)?.value || allKeys;
      
      // Get all webhook event values
      if (Array.isArray(keys)) {
        for (const key of keys) {
          const eventResponse = await db.get(key);
          // Handle Replit DB response format for get as well
          const event = (eventResponse as any)?.value || eventResponse;
          if (event) {
            events.push(event);
          }
        }
      }
      
      // Sort by timestamp (newest first)
      events.sort((a: any, b: any) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
      
      // Return the array of events as JSON
      res.json(events);
    } catch (error: any) {
      console.error("Error fetching webhook events:", error);
      res.status(500).json({ 
        error: "Failed to fetch webhook events" 
      });
    }
  });

  // Authentication Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: "Invalid email or password format" });
      }
      
      // Basic email validation
      if (!email.includes('@')) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      
      // Check if user already exists
      const userKey = `user:${email}`;
      const existingUserResponse = await db.get(userKey);
      const existingUser = (existingUserResponse as any)?.value || existingUserResponse;
      
      // Check if the response indicates user doesn't exist (404 error)
      if (existingUser && existingUser.ok !== false) {
        return res.status(409).json({ error: "User with this email already exists" });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user object
      const user = {
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      // Save user to database
      await db.set(userKey, user);
      console.log(`New user created: ${email}`);
      
      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }
      
      const token = jwt.sign(
        { email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Send response with token
      res.status(201).json({ 
        message: "User created successfully",
        token,
        user: { email }
      });
    } catch (error: any) {
      console.error("Error during signup:", error);
      res.status(500).json({ 
        error: "Failed to create user. Please try again." 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      if (typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: "Invalid email or password format" });
      }
      
      // Find user in database
      const userKey = `user:${email}`;
      const userResponse = await db.get(userKey);
      const user = (userResponse as any)?.value || userResponse;
      
      if (!user || !user.password) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Compare password with stored hash
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      
      // Create JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET is not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }
      
      const token = jwt.sign(
        { email: user.email },
        jwtSecret,
        { expiresIn: '7d' }
      );
      
      console.log(`User logged in: ${email}`);
      
      // Send response with token
      res.json({ 
        message: "Login successful",
        token,
        user: { email: user.email }
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      res.status(500).json({ 
        error: "Failed to login. Please try again." 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

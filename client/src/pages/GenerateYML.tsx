import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function GenerateYML() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please describe what you need to generate",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/generate-yml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedCode(data.generated_yaml || "");

      toast({
        title: "Generation complete",
        description: "Your YAML file has been generated successfully",
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      
      let errorMessage = "Failed to generate YAML file. Please try again.";
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Generation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "The generated YAML has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container-lg mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
            YAML Generator
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-subtitle">
            Describe what you need and let AI generate production-ready YAML files
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Describe Your Requirements</CardTitle>
            <CardDescription>
              Tell us what you need - a Dockerfile, docker-compose.yml, GitHub Actions workflow, or any other YAML configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-input">Your Request</Label>
              <Textarea
                id="prompt-input"
                placeholder="Example: I need a Dockerfile for a Node.js app with Express, running on port 3000, using Node 20..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-y"
                data-testid="textarea-prompt"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full"
              data-testid="button-generate"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate YAML
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedCode && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated YAML</CardTitle>
                  <CardDescription>Your AI-generated configuration file</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  data-testid="button-copy"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md overflow-x-auto" data-testid="code-generated">
                <code className="text-sm">{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

export default function ExplainCode() {
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExplain = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some code to explain",
      });
      return;
    }

    setLoading(true);
    setExplanation("");

    try {
      const response = await fetch('/api/explain-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to explain code');
      }

      const data = await response.json();
      setExplanation(data.explanation || "");

      toast({
        title: "Code explained successfully",
        description: "AI has analyzed your code",
      });
    } catch (error: any) {
      console.error('Explain code error:', error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to explain code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold" data-testid="text-page-title">
              Explain Code
            </h1>
            <p className="text-muted-foreground text-lg" data-testid="text-page-subtitle">
              Paste any code snippet and get a clear, plain-English explanation from AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Code</CardTitle>
                <CardDescription>
                  Paste the code you want explained
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  data-testid="input-code"
                />
                <Button
                  onClick={handleExplain}
                  disabled={loading || !code.trim()}
                  className="w-full"
                  data-testid="button-explain"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Explain Code"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Explanation</CardTitle>
                <CardDescription>
                  Clear explanation of what the code does
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-spinner">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : explanation ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none min-h-[400px]">
                    <div className="whitespace-pre-wrap" data-testid="text-explanation">
                      {explanation}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[400px] text-muted-foreground" data-testid="text-empty-state">
                    <p>Your explanation will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

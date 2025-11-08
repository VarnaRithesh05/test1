import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, XCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { YAMLComparison } from "@/components/YAMLComparison";

export default function AnalyzeYML() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [originalCode, setOriginalCode] = useState("");
  const [correctedCode, setCorrectedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.yml') || selectedFile.name.endsWith('.yaml')) {
        setFile(selectedFile);
        setOriginalCode("");
        setCorrectedCode("");
        setExplanation("");
        setIsCorrect(null);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .yml or .yaml file",
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a YAML file to analyze",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-yml', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      
      const fileContent = await file.text();
      setOriginalCode(fileContent);
      setCorrectedCode(data.corrected_yaml || "");
      setExplanation(data.explanation || "");
      setIsCorrect(data.is_correct);

      toast({
        title: "Analysis complete",
        description: data.is_correct ? "Your YAML file is correct!" : "Issues found and corrected",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      
      let errorMessage = "Failed to analyze YAML file. Please try again.";
      
      // Try to get error message from response
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Analysis Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container-lg mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
            YAML File Analyzer
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-subtitle">
            Upload your Docker Compose or GitHub Actions YAML files for AI-powered analysis
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload YAML File</CardTitle>
            <CardDescription>Select a .yml or .yaml file to analyze for errors and best practices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">YAML File</Label>
              <div className="flex gap-4 items-center">
                <input
                  id="file-upload"
                  type="file"
                  accept=".yml,.yaml"
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  data-testid="input-file-upload"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!file || loading}
                  data-testid="button-analyze"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
              {file && (
                <p className="text-sm text-muted-foreground" data-testid="text-selected-file">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {isCorrect !== null && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-destructive" />
                )}
                <CardTitle data-testid="text-validation-status">
                  {isCorrect ? "YAML is Valid" : "Issues Found"}
                </CardTitle>
              </div>
            </CardHeader>
          </Card>
        )}

        {originalCode && (
          <div className="mb-8">
            <YAMLComparison 
              originalYAML={originalCode}
              correctedYAML={correctedCode}
              showTitle={true}
            />
          </div>
        )}

        {explanation && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Explanation</CardTitle>
              <CardDescription>What was analyzed and what improvements were made</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert" data-testid="text-explanation">
                {explanation.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

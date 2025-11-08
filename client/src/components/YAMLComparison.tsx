import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface YAMLComparisonProps {
  originalYAML: string;
  correctedYAML: string;
  showTitle?: boolean;
}

export function YAMLComparison({ originalYAML, correctedYAML, showTitle = true }: YAMLComparisonProps) {
  const highlightChanges = (yaml: string) => {
    const lines = yaml.split('\n');
    return lines.map((line, index) => {
      const hasFixComment = line.includes('# FIXED:') || line.includes('# CHANGED:') || line.includes('# ADDED:');
      return (
        <div
          key={index}
          className={hasFixComment ? 'bg-green-500/10 border-l-2 border-l-green-500 pl-2' : ''}
          data-testid={hasFixComment ? `line-highlighted-${index}` : undefined}
        >
          {line.includes('# FIXED:') || line.includes('# CHANGED:') || line.includes('# ADDED:') ? (
            <span className="text-green-600 dark:text-green-400 font-semibold">{line}</span>
          ) : (
            <span>{line}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6" data-testid="yaml-comparison">
      <Card>
        <CardHeader>
          {showTitle && (
            <>
              <CardTitle>Original YAML</CardTitle>
              <CardDescription>Your uploaded file</CardDescription>
            </>
          )}
          {!showTitle && (
            <CardTitle className="text-base">Original</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono leading-relaxed" data-testid="text-original-yaml">
            {originalYAML}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          {showTitle && (
            <>
              <CardTitle>Corrected YAML</CardTitle>
              <CardDescription>AI-optimized with highlighted changes</CardDescription>
            </>
          )}
          {!showTitle && (
            <CardTitle className="text-base">Corrected (with fixes highlighted)</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono leading-relaxed" data-testid="text-corrected-yaml">
            {highlightChanges(correctedYAML)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

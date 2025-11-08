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
          className={hasFixComment ? 'bg-green-500/20 border-l-4 border-l-green-500 pl-3 py-0.5 my-0.5' : ''}
          data-testid={hasFixComment ? `line-highlighted-${index}` : undefined}
        >
          {line.includes('# FIXED:') || line.includes('# CHANGED:') || line.includes('# ADDED:') ? (
            <span className="text-green-700 dark:text-green-300 font-bold">{line}</span>
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
          {showTitle ? (
            <>
              <CardTitle>Original YML Code</CardTitle>
              <CardDescription>Your uploaded file</CardDescription>
            </>
          ) : (
            <CardTitle className="text-base font-semibold">Original YML Code</CardTitle>
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
          {showTitle ? (
            <>
              <CardTitle>Corrected YML Code</CardTitle>
              <CardDescription>AI-optimized with highlighted changes</CardDescription>
            </>
          ) : (
            <CardTitle className="text-base font-semibold">Corrected YML Code</CardTitle>
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

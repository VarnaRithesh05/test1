import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, GitBranch, FileCode } from "lucide-react";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";
import type { WebhookEvent } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { YAMLComparison } from "@/components/YAMLComparison";

export default function MonitorWebhooks() {
  const { data: events, isLoading } = useQuery<WebhookEvent[]>({
    queryKey: ['/api/webhook-events'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container-lg mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
            Monitor Webhooks
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-page-subtitle">
            View your GitHub webhook delivery history and YAML analysis results
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12" data-testid="loading-spinner">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !events || events.length === 0 ? (
          <Card data-testid="card-empty-state">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No webhook events yet</h3>
              <p className="text-muted-foreground">
                Webhook events will appear here once you've connected your GitHub repository.
                <br />
                Check out the WEBHOOK_SETUP.md file for setup instructions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} data-testid={`card-webhook-event-${event.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg" data-testid={`text-repository-${event.id}`}>
                          {event.repository}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span data-testid={`text-timestamp-${event.id}`}>
                          {format(new Date(event.timestamp), 'PPpp')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={event.status === 'success' ? 'default' : event.status === 'error' ? 'destructive' : 'secondary'}
                        data-testid={`badge-status-${event.id}`}
                      >
                        {event.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {event.status === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                        {event.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-event-type-${event.id}`}>
                        {event.eventType}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {Array.isArray(event.filesAnalyzed) && event.filesAnalyzed.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="files">
                        <AccordionTrigger data-testid={`button-toggle-files-${event.id}`}>
                          <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            <span>{event.filesAnalyzed.length} file(s) analyzed</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {event.filesAnalyzed.map((fileResult: any, index: number) => (
                              <div
                                key={index}
                                className="border rounded-md p-4"
                                data-testid={`card-file-result-${event.id}-${index}`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded" data-testid={`text-filename-${event.id}-${index}`}>
                                    {fileResult.file}
                                  </code>
                                  {fileResult.error ? (
                                    <Badge variant="destructive" data-testid={`badge-file-status-${event.id}-${index}`}>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Error
                                    </Badge>
                                  ) : fileResult.analysis?.is_correct ? (
                                    <Badge variant="default" data-testid={`badge-file-status-${event.id}-${index}`}>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Valid
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" data-testid={`badge-file-status-${event.id}-${index}`}>
                                      Issues Found
                                    </Badge>
                                  )}
                                </div>
                                
                                {fileResult.error ? (
                                  <p className="text-sm text-destructive" data-testid={`text-error-${event.id}-${index}`}>
                                    {fileResult.error}
                                  </p>
                                ) : fileResult.analysis && (
                                  <div className="space-y-4">
                                    {!fileResult.analysis.is_correct && fileResult.originalContent && (
                                      <div data-testid={`yaml-comparison-${event.id}-${index}`}>
                                        <YAMLComparison 
                                          originalYAML={fileResult.originalContent}
                                          correctedYAML={fileResult.analysis.corrected_yaml || ""}
                                          showTitle={false}
                                        />
                                      </div>
                                    )}
                                    {!fileResult.analysis.is_correct && !fileResult.originalContent && (
                                      <div className="bg-muted p-3 rounded-md border border-dashed" data-testid={`info-no-original-${event.id}-${index}`}>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          <strong>Note:</strong> Two-column comparison not available for this event. 
                                          The original YAML content was not stored when this webhook was processed.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          New webhook events will automatically show side-by-side comparison with highlighted changes.
                                        </p>
                                      </div>
                                    )}
                                    {!fileResult.analysis.is_correct && (
                                      <div className="text-sm" data-testid={`text-explanation-${event.id}-${index}`}>
                                        <p className="font-medium mb-1">Analysis:</p>
                                        <p className="text-muted-foreground whitespace-pre-wrap">
                                          {fileResult.analysis.explanation}
                                        </p>
                                      </div>
                                    )}
                                    {fileResult.analysis.is_correct && (
                                      <p className="text-sm text-muted-foreground" data-testid={`text-valid-message-${event.id}-${index}`}>
                                        No issues found. YAML file is valid.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <p className="text-sm text-muted-foreground" data-testid={`text-no-files-${event.id}`}>
                      No YAML files were analyzed in this event.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

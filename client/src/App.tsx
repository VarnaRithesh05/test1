import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import AnalyzeYML from "@/pages/AnalyzeYML";
import GenerateYML from "@/pages/GenerateYML";
import ExplainCode from "@/pages/ExplainCode";
import MonitorWebhooks from "@/pages/MonitorWebhooks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/analyze" component={AnalyzeYML}/>
      <Route path="/generate" component={GenerateYML}/>
      <Route path="/explain" component={ExplainCode}/>
      <Route path="/monitor" component={MonitorWebhooks}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

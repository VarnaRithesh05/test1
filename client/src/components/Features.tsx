import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: "fa-file-code",
    title: "Intelligent YAML Analysis",
    description: "Automatically detect syntax errors, schema violations, and best practice deviations in your Docker Compose and GitHub Actions files with AI-powered recommendations.",
    color: "text-blue-500"
  },
  {
    icon: "fa-wifi",
    title: "Real-Time Webhook Monitoring",
    description: "Track GitHub webhook events in real-time with detailed payload inspection, delivery status, and automated retry mechanisms for failed deliveries.",
    color: "text-green-500"
  },
  {
    icon: "fa-lightbulb",
    title: "AI Code Explanation",
    description: "Get instant, context-aware explanations of complex YAML configurations, Docker commands, and CI/CD workflows in plain English.",
    color: "text-yellow-500"
  },
  {
    icon: "fa-file-export",
    title: "Smart YAML Generation",
    description: "Generate production-ready Docker Compose files and GitHub Actions workflows from natural language descriptions with security best practices built-in.",
    color: "text-purple-500"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container-lg mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
            Powerful Features for Modern DevOps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-subtitle">
            Everything you need to streamline your development workflow and ship faster with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-feature-${index}`}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <i className={`fas ${feature.icon} text-2xl ${feature.color}`}></i>
                </div>
                <CardTitle className="text-xl" data-testid={`text-feature-title-${index}`}>
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed" data-testid={`text-feature-description-${index}`}>
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

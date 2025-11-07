const steps = [
  {
    number: "01",
    title: "Connect Your Repository",
    description: "Link your GitHub repository or upload your Docker Compose files securely. We support all major Git platforms.",
    icon: "fa-plug"
  },
  {
    number: "02",
    title: "AI Analysis & Insights",
    description: "Our AI engine analyzes your configurations, identifying issues, security vulnerabilities, and optimization opportunities.",
    icon: "fa-brain"
  },
  {
    number: "03",
    title: "Get Recommendations",
    description: "Receive actionable insights with detailed explanations and one-click fixes for common configuration problems.",
    icon: "fa-list-check"
  },
  {
    number: "04",
    title: "Deploy with Confidence",
    description: "Apply suggested improvements and deploy your optimized configurations with automated testing and validation.",
    icon: "fa-rocket"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="container-lg mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-how-it-works-subtitle">
            Get started in minutes with our simple, streamlined workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative" data-testid={`step-${index}`}>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0"></div>
              )}
              
              <div className="relative z-10 text-center">
                <div className="inline-flex w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                  <i className={`fas ${step.icon} text-2xl text-primary-foreground`}></i>
                </div>
                <div className="absolute top-0 right-0 text-6xl font-bold text-primary/10" data-testid={`text-step-number-${index}`}>
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-3" data-testid={`text-step-title-${index}`}>
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed" data-testid={`text-step-description-${index}`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

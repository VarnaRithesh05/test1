import { Button } from "@/components/ui/button";
import heroImage from "@assets/generated_images/AI_DevOps_workflow_illustration_37ba9063.png";

export default function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
      
      <div className="container-lg mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight" data-testid="text-hero-title">
              Your AI Co-Pilot for{" "}
              <span className="text-primary">Docker & GitHub</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed" data-testid="text-hero-subtitle">
              Streamline your DevOps workflow with intelligent YAML analysis, real-time webhook monitoring, and AI-powered code generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("contact")}
                data-testid="button-get-started-hero"
              >
                Get Started
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollToSection("features")}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
            <p className="text-sm text-muted-foreground" data-testid="text-hero-tagline">
              <i className="fas fa-check-circle text-primary mr-2"></i>
              Free for open source projects
            </p>
          </div>

          <div className="relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="AI DevOps workflow visualization"
                className="w-full h-auto"
                data-testid="img-hero"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

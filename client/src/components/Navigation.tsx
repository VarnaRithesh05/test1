import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container-lg mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <i className="fas fa-robot text-primary-foreground text-lg"></i>
            </div>
            <span className="text-xl font-semibold">AutoPatcher</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors"
              data-testid="link-analyze"
            >
              Analyze YML
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors"
              data-testid="link-monitor"
            >
              Monitor Webhooks
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors"
              data-testid="link-explain"
            >
              Explain Code
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors"
              data-testid="link-generate"
            >
              Generate YML
            </button>
            <Button
              onClick={() => scrollToSection("contact")}
              data-testid="button-get-started-nav"
            >
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground hover:text-primary transition-colors text-left"
                data-testid="link-analyze-mobile"
              >
                Analyze YML
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground hover:text-primary transition-colors text-left"
                data-testid="link-monitor-mobile"
              >
                Monitor Webhooks
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground hover:text-primary transition-colors text-left"
                data-testid="link-explain-mobile"
              >
                Explain Code
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="text-foreground hover:text-primary transition-colors text-left"
                data-testid="link-generate-mobile"
              >
                Generate YML
              </button>
              <Button
                onClick={() => scrollToSection("contact")}
                className="w-full"
                data-testid="button-get-started-mobile"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

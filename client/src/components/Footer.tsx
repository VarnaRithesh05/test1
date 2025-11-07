import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    toast({
      title: "Subscribed!",
      description: "Thank you for subscribing to our newsletter.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-card border-t py-12">
      <div className="container-lg mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-product">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-analyze">Analyze YML</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-monitor">Monitor Webhooks</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-explain">Explain Code</a></li>
              <li><a href="#features" className="hover:text-foreground transition-colors" data-testid="link-footer-generate">Generate YML</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-company">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#contact" className="hover:text-foreground transition-colors" data-testid="link-footer-about">About</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-blog">Blog</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-careers">Careers</a></li>
              <li><a href="#contact" className="hover:text-foreground transition-colors" data-testid="link-footer-contact">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-resources">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-docs">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-api">API Reference</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-support">Support</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-status">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-newsletter">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest DevOps tips and product updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-newsletter"
              />
              <Button type="submit" data-testid="button-subscribe">
                <i className="fas fa-paper-plane"></i>
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <i className="fas fa-robot text-primary-foreground text-sm"></i>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="text-footer-copyright">
              © 2025 AI DevOps Assistant. All rights reserved.
            </span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-privacy">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors" data-testid="link-footer-terms">Terms of Service</a>
          </div>

          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-github">
              <i className="fab fa-github text-xl"></i>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-twitter">
              <i className="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-linkedin">
              <i className="fab fa-linkedin text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

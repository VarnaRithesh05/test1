import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container-lg mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-about-title">
              About AutoPatcher
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p data-testid="text-about-p1">
                We're on a mission to make DevOps accessible to every developer. Our AI-powered platform eliminates the complexity of Docker and GitHub configurations, allowing teams to focus on building great products.
              </p>
              <p data-testid="text-about-p2">
                Founded by experienced DevOps engineers and AI researchers, we understand the pain points of modern cloud-native development. Our tools are designed to reduce cognitive load and prevent costly deployment errors.
              </p>
              <p data-testid="text-about-p3">
                Join over 1,000+ development teams who trust AutoPatcher to streamline their workflows and ship faster.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-teams">1,000+</div>
                <div className="text-sm text-muted-foreground">DevOps Teams</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-analysis">50K+</div>
                <div className="text-sm text-muted-foreground">Files Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary" data-testid="text-stat-saved">10M+</div>
                <div className="text-sm text-muted-foreground">Hours Saved</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6" data-testid="text-contact-title">
              Get in Touch
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  data-testid="input-message"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-submit-contact">
                Send Message
                <i className="fas fa-paper-plane ml-2"></i>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

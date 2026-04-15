import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings } from "@shared/schema";
import { useState } from "react";

type LeadFormProps = {
  className?: string;
  defaultPurpose?: string;
};

export function LeadForm({ className }: LeadFormProps) {
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"]
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "Educational Tour"
  });

  const whatsappNumber = settings?.whatsappNumber || "919094550551";
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create WhatsApp message with form data
    const message = `Hi! I'm interested in booking a tour.

*Name:* ${formData.name}
*Email:* ${formData.email}
*Phone:* ${formData.phone}
*Interested In:* ${formData.purpose}

Please help me plan my educational tour. Thank you!`;
    
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      purpose: "Educational Tour"
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border/50 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold font-heading text-foreground">Plan Your Educational Tour</h3>
        <p className="text-muted-foreground mt-2">Fill out the form below and our travel experts will help you plan the perfect tour.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ram Krish"
            className="h-12 rounded-xl"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="krish@example.com"
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 98765 43210"
              className="h-12 rounded-xl"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="purpose">Interested In</Label>
          <Select 
            value={formData.purpose} 
            onValueChange={(value) => setFormData({ ...formData, purpose: value })}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Educational Tour">Educational Tour</SelectItem>
              <SelectItem value="School Trip">School Trip</SelectItem>
              <SelectItem value="College Tour">College / University Tour</SelectItem>
              <SelectItem value="Custom Group Tour">Custom Group Tour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 mt-2"
        >
          Request Tour Quote via WhatsApp
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Or call us directly at <strong className="text-foreground">{settings?.contactPhone || "+91 90945 50551"}</strong></p>
      </div>
    </div>
  );
}

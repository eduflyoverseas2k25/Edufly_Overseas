import { Button } from "@/components/ui/button";

type LeadFormProps = {
  className?: string;
  defaultPurpose?: string;
};

export function LeadForm({ className }: LeadFormProps) {
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hi! I want to plan an Educational Tour. Can you help me?");
    window.open(`https://wa.me/919094550551?text=${message}`, '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-border/50 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold font-heading text-foreground">Plan Your Educational Tour</h3>
        <p className="text-muted-foreground mt-2">Connect with our travel experts on WhatsApp to plan the perfect tour for your students.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#25D366]/10 to-[#128C7E]/10 p-6 rounded-xl border-2 border-[#25D366]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-lg">Quick WhatsApp Support</h4>
              <p className="text-sm text-muted-foreground">Get instant responses from our team</p>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-[#25D366]">✓</span>
              Instant tour quotes and customization
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#25D366]">✓</span>
              Direct communication with tour coordinators
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#25D366]">✓</span>
              Quick answers to all your queries
            </li>
          </ul>

          <Button 
            onClick={handleWhatsAppContact}
            className="w-full h-14 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Chat on WhatsApp Now
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Or call us directly at <strong className="text-foreground">+91 90945 50551</strong></p>
        </div>
      </div>
    </div>
  );
}

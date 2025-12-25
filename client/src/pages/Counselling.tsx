import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LeadForm } from "@/components/LeadForm";

export default function Counselling() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-primary text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Book Your Free Consultation</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Take the first step towards your international education journey today.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom max-w-4xl mx-auto">
          <LeadForm className="shadow-2xl border-primary/20" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

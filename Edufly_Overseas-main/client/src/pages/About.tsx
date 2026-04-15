import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">About Edufly Overseas</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">Your trusted partner in educational travel and tour experiences worldwide.</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6 text-slate-900">
                Creating Memorable Educational Tours Since 2010
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Edufly Overseas is a premier educational travel and tour company that collaborates with schools, colleges, and universities to deliver well-planned, outcome-based educational tours worldwide. We believe that "Travel is a university in itself."
                </p>
                <p>
                  Our mission is to provide enriching travel experiences that combine learning with adventure. We carefully curate each tour to include cultural immersion, historical exploration, and unique "special for you" experiences that create lasting memories.
                </p>
                <p>
                  From selecting the perfect destinations to arranging accommodations and guided experiences, we handle every detail of your educational tour. Our team of experienced travel coordinators ensures safe, educational, and enjoyable journeys for students of all ages.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary rounded-2xl transform rotate-3 translate-x-4 translate-y-4 -z-10 opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?q=80&w=1932&auto=format&fit=crop" 
                alt="Students on Educational Tour" 
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-primary">
              <h3 className="text-2xl font-bold font-heading mb-4 text-primary">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To be the world's most trusted educational travel company, creating transformative experiences that inspire curiosity, foster global citizenship, and broaden horizons for students everywhere.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-lg border-t-4 border-secondary">
              <h3 className="text-2xl font-bold font-heading mb-4 text-secondary">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To organize safe, enriching, and memorable educational tours that combine cultural exploration, historical discovery, hands-on STEM learning, and real-world exposure to innovation across global destinations.
              </p>
            </div>
          </div>

          {/* Our Expertise Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold font-heading text-center mb-12">Our Expertise</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center mb-3">STEM Education Focus</h4>
                <p className="text-slate-600 text-center">
                  Specialized programs featuring visits to NASA, top research universities, innovation labs, and hands-on technology workshops
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center mb-3">Safety & Security</h4>
                <p className="text-slate-600 text-center">
                  24/7 tour managers, comprehensive travel insurance, secure accommodations, and constant communication with parents
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-border">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h4 className="text-xl font-bold text-center mb-3">Complete Coordination</h4>
                <p className="text-slate-600 text-center">
                  End-to-end support: visa processing, flight bookings, hotel arrangements, meal planning, and local transportation
                </p>
              </div>
            </div>
          </div>

          {/* What Makes Us Different */}
          <div className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/5 p-10 rounded-2xl border border-primary/20">
            <h2 className="text-3xl font-bold font-heading text-center mb-8">What Makes Us Different</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Specialized STEM-focused educational programs",
                "Partnerships with top universities globally (Howard University, etc.)",
                "NASA Space Center training programs and certifications",
                "Award ceremonies and excellence recognition in USA",
                "Hands-on robotics, AI, and space science workshops",
                "Faculty interactions and campus tours at leading institutions",
                "Cultural immersion balanced with educational activities",
                "Small group sizes for personalized attention",
                "Experienced tour coordinators specialized in student travel",
                "Comprehensive pre-departure orientation programs"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

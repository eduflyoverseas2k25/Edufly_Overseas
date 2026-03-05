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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-primary">
              <h3 className="text-2xl font-bold font-heading mb-4 text-primary">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To be the world's most trusted educational travel company, creating transformative experiences that inspire curiosity and broaden horizons for students everywhere.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-secondary">
              <h3 className="text-2xl font-bold font-heading mb-4 text-secondary">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To organize safe, enriching, and memorable educational tours that combine cultural exploration, historical discovery, and hands-on learning experiences across 11 global destinations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

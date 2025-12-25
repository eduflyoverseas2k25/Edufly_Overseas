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
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">Your trusted partner in international education and career guidance.</p>
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
                Empowering Students Since 2010
              </h2>
              <div className="space-y-4 text-lg text-slate-600 leading-relaxed">
                <p>
                  Edufly Overseas is a premier international education consultancy dedicated to helping students achieve their dreams of studying abroad. With over a decade of experience, we have successfully placed thousands of students in top universities across the globe.
                </p>
                <p>
                  Our mission is to provide transparent, accurate, and comprehensive guidance to students and parents. We believe that every student is unique, and we tailor our services to match individual aspirations, academic backgrounds, and financial capabilities.
                </p>
                <p>
                  From selecting the right course and university to assisting with visa applications and accommodation, we are with you every step of the way. Our team of certified counsellors ensures that you make informed decisions about your future.
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
              {/* Unsplash image: team meeting corporate office */}
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1932&auto=format&fit=crop" 
                alt="Edufly Team" 
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
                To be the world's most trusted and student-centric international education consultancy, bridging the gap between talent and global opportunities.
              </p>
            </div>
            <div className="bg-white p-10 rounded-2xl shadow-sm border-t-4 border-secondary">
              <h3 className="text-2xl font-bold font-heading mb-4 text-secondary">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">
                To empower students with the right knowledge and resources, enabling them to pursue world-class education and build successful global careers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

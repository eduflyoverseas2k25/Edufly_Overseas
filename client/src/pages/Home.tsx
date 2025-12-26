import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Globe, GraduationCap, Users, Award, CheckCircle, Plane } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LeadForm } from "@/components/LeadForm";
import { useDestinations, usePrograms, useTestimonials } from "@/hooks/use-resources";
import { useSiteSettings, useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: destinations } = useDestinations();
  const { data: programs } = usePrograms();
  const { data: testimonials } = useTestimonials();
  const { data: settings } = useSiteSettings();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Show top 4 destinations
  const topDestinations = destinations?.slice(0, 4) || [];
  // Show top 6 program categories
  const topPrograms = programs?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] lg:h-screen lg:min-h-[600px] flex items-center overflow-hidden py-20 lg:py-0">
        {/* Background - Dynamic based on theme */}
        <div 
          className="absolute inset-0 z-0 transition-all duration-500" 
          style={{ 
            background: isDark 
              ? 'linear-gradient(135deg, var(--hero-from) 0%, var(--hero-via) 50%, var(--hero-to) 100%)'
              : 'linear-gradient(135deg, var(--hero-from) 0%, var(--hero-via) 50%, var(--hero-to) 100%)'
          }} 
        >
          {!isDark && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(239,110,45,0.08)_0%,transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(253,194,44,0.1)_0%,transparent_50%)]" />
            </>
          )}
        </div>

        <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-24 lg:pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm mb-6 ${
              isDark ? "bg-primary text-white" : "bg-primary/10 border border-primary/30 text-primary"
            }`}>
              {settings?.heroBadgeText || "Travel is a University in Itself"}
            </div>
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight mb-6 ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              From Textbooks <br/>
              <span className="text-secondary">to Take-off.</span>
            </h1>
            <p className={`text-lg md:text-xl mb-8 max-w-lg leading-relaxed ${
              isDark ? "text-slate-200" : "text-slate-600"
            }`}>
              Immersive learning journeys, transforming textbooks into real-world experiences by connecting students with history, culture, and science through hands-on exploration, fostering vital life skills like teamwork, independence, and critical thinking, all while providing unforgettable memories and building global awareness.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/destinations">
                <Button className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-lg">
                  {settings?.heroButtonPrimary || "Explore Destinations"}
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" className={`h-14 px-8 rounded-full font-bold text-lg ${
                  isDark 
                    ? "border-secondary text-secondary hover:bg-secondary/10" 
                    : "border-primary text-primary hover:bg-primary/10"
                }`}>
                  {settings?.heroButtonSecondary || "Learn More"}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <LeadForm />
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-slate-50 border-b border-border">
        <div className="container-custom grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center">
            <Globe className="w-10 h-10 text-primary mb-3" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Global Reach</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <GraduationCap className="w-10 h-10 text-primary mb-3" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Expert Guidance</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <Users className="w-10 h-10 text-primary mb-3" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trusted by Families</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="w-10 h-10 text-primary mb-3" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Proven Results</span>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Why Choose Edufly?</h2>
            <p className="text-lg text-muted-foreground">We bring decades of experience organizing educational tours that combine learning, culture, and adventure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "11 Global Destinations", desc: "Carefully curated tours across Asia, Europe, Americas, and Australia." },
              { icon: Users, title: "Expert Tour Planners", desc: "Experienced travel coordinators who craft the perfect educational journey." },
              { icon: CheckCircle, title: "Complete Tour Management", desc: "From travel arrangements to accommodations, we handle every detail." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Popular Destinations</h2>
              <p className="text-lg text-muted-foreground">Explore our carefully curated tour destinations across 11 countries.</p>
            </div>
            <Link href="/destinations">
              <Button variant="outline" className="hidden md:flex gap-2">
                View All <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topDestinations.length > 0 ? (
              topDestinations.map((dest) => (
                <Link key={dest.id} href={`/destinations/${dest.slug}`}>
                  <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md">
                    <img 
                      src={dest.imageUrl || "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80"} 
                      alt={dest.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-2xl font-bold text-white mb-1 font-heading">{dest.name}</h3>
                      <p className="text-white/80 text-sm opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                        Explore Tour Highlights
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              // Fallback if no data
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
              ))
            )}
          </div>
          
          <div className="mt-8 md:hidden text-center">
            <Link href="/destinations">
              <Button variant="outline" className="w-full">View All Destinations</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-slate-900 mb-4">Tour Experiences</h2>
            <p className="text-lg text-muted-foreground">Every destination offers unique cultural, historical, and educational experiences.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {["Culture", "History", "Adventure", "Art & Museums", "Nature", "Local Life"].map((cat) => (
              <div key={cat} className="bg-white p-6 rounded-xl border border-border/50 text-center hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group">
                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-600 mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-bold text-sm md:text-base">{cat}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Plane className="w-96 h-96 transform translate-x-1/3 -translate-y-1/3" />
        </div>
        
        <div className="container-custom relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Ready to explore the world?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Plan an unforgettable educational tour for your school, college, or university. Let us handle every detail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-tour">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 rounded-full text-lg font-bold">
                Plan Your Tour
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 rounded-full text-lg font-bold">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

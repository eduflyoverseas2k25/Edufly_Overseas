import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { usePrograms } from "@/hooks/use-resources";
import { Loader2, BookOpen, Calendar, Users, Clock, MapPin, CheckCircle2, XCircle, DollarSign, Rocket, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Programs() {
  const { data: programs, isLoading } = usePrograms();

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("Hi! I'm interested in the USA STEM Programme. Can you provide more details?");
    window.open(`https://wa.me/919094550551?text=${message}`, '_blank');
  };

  const handleBrochureDownload = () => {
    window.open('https://customer-assets.emergentagent.com/job_code-audit-50/artifacts/j3nsyhzj_USA%20STEM%20Programme.pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-primary/20 rounded-full border border-primary/30">
            <span className="text-primary text-sm font-semibold">Educational Tour Programs</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6">
            Explore, Learn & Grow
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Transformative educational experiences designed for students to explore global innovation hubs, engage with cutting-edge technology, and develop future-ready skills.
          </p>
        </div>
      </section>

      {/* Upcoming Programme - USA STEM */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-4 py-2 bg-orange-100 rounded-full">
              <span className="text-orange-700 text-sm font-semibold flex items-center gap-2">
                <Rocket size={16} />
                Upcoming Programme
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">USA STEM Educational Tour</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              13-Day Global Science Research Programme at USA
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Quick Info Cards */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Calendar size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Duration</h3>
              <p className="text-2xl font-bold text-primary">13 Days</p>
              <p className="text-sm text-muted-foreground mt-1">New York → Niagara → Washington DC → Orlando</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-4">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Eligibility</h3>
              <p className="text-2xl font-bold text-primary">Grade 6-12</p>
              <p className="text-sm text-muted-foreground mt-1">Students from all schools</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                <DollarSign size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Investment</h3>
              <p className="text-2xl font-bold text-primary">₹4,10,000</p>
              <p className="text-sm text-muted-foreground mt-1">All-inclusive (Flights, Visa, Hotels, Meals)</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-border">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Award className="text-primary" size={28} />
                  Programme Highlights
                </h3>
                <ul className="space-y-3">
                  {[
                    "NASA Kennedy Space Center Training Program",
                    "Howard University STEM Certification",
                    "AI & Robotics Research Sessions",
                    "Space Science Workshops & Simulations",
                    "Hands-on STEM Experiments",
                    "University Campus Tours & Faculty Interaction",
                    "Universal Studios Orlando (2-Day Pass)",
                    "Niagara Falls Experience",
                    "Cultural & Educational Excursions"
                  ].map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-border">
                <h3 className="text-2xl font-bold mb-6">What's Included</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Return International Airfare",
                    "Internal Domestic Flights",
                    "3-4 Star Hotels",
                    "Breakfast & Dinner Daily",
                    "Private Coach Transport",
                    "NASA Training Program",
                    "STEM Certification",
                    "Universal Studios Tickets",
                    "Niagara Falls Attractions",
                    "All Entry Fees",
                    "Tour Manager & Security",
                    "Travel Insurance"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="text-primary flex-shrink-0" size={16} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-2xl shadow-xl text-white">
                <h3 className="text-2xl font-bold mb-4">13-Day Itinerary</h3>
                <div className="space-y-4">
                  {[
                    { day: "1-2", title: "Departure & NYC Arrival", desc: "Times Square, City Orientation" },
                    { day: "3", title: "New York City Tour", desc: "Statue of Liberty, 9/11 Memorial, Intrepid Museum" },
                    { day: "4", title: "Niagara Falls", desc: "Maid of Mist, Observation Tower, Night Illumination" },
                    { day: "5", title: "Washington DC", desc: "White House, Capitol, Lincoln Memorial" },
                    { day: "6", title: "Howard University STEM", desc: "Full-day program, Robotics Labs, Certification" },
                    { day: "7", title: "Hershey's & Orlando", desc: "Chocolate World, Flight to Orlando" },
                    { day: "8-9", title: "NASA Kennedy Space Center", desc: "Astronaut Training, Rocket Simulation, Graduation" },
                    { day: "10-11", title: "Universal Studios", desc: "2-Day Park Access, Islands of Adventure" },
                    { day: "12-13", title: "Return Journey", desc: "Departure & Arrival in Chennai" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-white/20 last:border-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center font-bold">
                          {item.day}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{item.title}</h4>
                        <p className="text-sm text-white/80">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Clock size={20} />
                  Registration Details
                </h4>
                <ul className="space-y-2 text-sm text-amber-900">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span><strong>Limited Seats:</strong> First-come, first-served basis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span><strong>Confirmation:</strong> 50% advance payment mandatory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span><strong>Awards:</strong> Excellence certificates presented in USA</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-border space-y-4">
                <Button 
                  onClick={handleBrochureDownload}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  size="lg"
                >
                  📄 Download Detailed Brochure
                </Button>
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
                  size="lg"
                >
                  💬 Register Your Interest
                </Button>
                <p className="text-center text-sm text-slate-600">
                  Contact: +91 90945 50551 | eduflyoverseasindia@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Programs Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Other Programs</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our additional educational tour packages
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs?.map((program) => (
                <div key={program.id} className="bg-white p-8 rounded-2xl shadow-lg border border-border/50 hover:border-primary/50 transition-all group hover:shadow-xl">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-2 text-primary">{program.category}</h3>
                  <h4 className="text-lg font-semibold mb-4 text-slate-900">{program.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {program.description || "Carefully curated tour experiences with cultural immersion and educational activities."}
                  </p>
                </div>
              ))}
              
              {programs?.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-lg text-muted-foreground">No other programs available at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

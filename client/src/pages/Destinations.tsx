import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useDestinations } from "@/hooks/use-resources";
import { Link } from "wouter";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Destinations() {
  const { data: destinations, isLoading } = useDestinations();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Study Destinations</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore the world's best countries for international education.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {destinations?.map((dest) => (
                <div key={dest.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg border border-border/50 hover:shadow-xl transition-all">
                  <div className="relative h-60 overflow-hidden">
                    <img 
                      src={dest.imageUrl || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2033&auto=format&fit=crop"} 
                      alt={dest.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary flex items-center gap-1">
                      <MapPin size={14} /> {dest.name}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold font-heading mb-3">{dest.name}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-6">
                      {dest.overview}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {dest.duration || "Various Durations"}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {dest.language || "English"}
                      </span>
                    </div>

                    <Link href={`/destinations/${dest.slug}`}>
                      <Button className="w-full bg-slate-900 text-white hover:bg-primary">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              {destinations?.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-lg text-muted-foreground">No destinations found.</p>
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

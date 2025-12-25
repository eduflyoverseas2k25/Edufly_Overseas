import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useGallery } from "@/hooks/use-resources";
import { Loader2 } from "lucide-react";

export default function Gallery() {
  const { data: gallery, isLoading } = useGallery();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-slate-900 text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Photo Gallery</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Glimpses of our tours, destinations, and memorable travel experiences.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding">
        <div className="container-custom">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {gallery?.map((item) => (
                <div key={item.id} className="break-inside-avoid rounded-xl overflow-hidden group relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Gallery Image"} 
                    className="w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4 text-center">
                      <div>
                        <h3 className="text-white font-bold text-lg">{item.title}</h3>
                        <p className="text-slate-300 text-sm">{item.category}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Fallback mock images if gallery is empty */}
              {(!gallery || gallery.length === 0) && [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="break-inside-avoid rounded-xl overflow-hidden mb-6">
                  <img 
                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=800&auto=format&fit=crop`} 
                    alt="Gallery Placeholder" 
                    className="w-full h-auto bg-slate-200"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

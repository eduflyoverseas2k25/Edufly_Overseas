import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft, MapPin, BookOpen, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import type { DestinationPlace, Destination } from "@shared/schema";

export default function PlaceDetail() {
  const [, params] = useRoute("/destinations/:destSlug/places/:placeSlug");
  const destSlug = params?.destSlug || "";
  const placeSlug = params?.placeSlug || "";

  const { data, isLoading, error } = useQuery<{ place: DestinationPlace; destination: Destination }>({
    queryKey: ['/api/destinations', destSlug, 'places', placeSlug],
    queryFn: async () => {
      const res = await fetch(`/api/destinations/${destSlug}/places/${placeSlug}`);
      if (!res.ok) throw new Error('Place not found');
      return res.json();
    },
    enabled: !!destSlug && !!placeSlug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Place Not Found</h2>
          <Link href="/destinations">
            <Button>Back to Destinations</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const { place, destination } = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-custom pb-12 text-white">
            <div className="flex items-center gap-2 text-sm mb-2 opacity-80">
              <MapPin size={14} />
              <span>{destination.name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-3" data-testid="heading-place-name">
              {place.name}
            </h1>
            {place.shortDescription && (
              <p className="text-lg md:text-xl opacity-90 max-w-2xl">
                {place.shortDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <Link href={`/destinations/${destSlug}`} className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to {destination.name}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {place.description && (
              <div>
                <h2 className="text-2xl font-bold font-heading mb-4 flex items-center gap-3" data-testid="heading-about">
                  <BookOpen className="text-primary" size={24} />
                  About {place.name}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line" data-testid="text-description">
                  {place.description}
                </p>
              </div>
            )}

            {/* Culture */}
            {place.culture && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-3" data-testid="heading-culture">
                  <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="text-primary" size={20} />
                  </span>
                  Culture & Significance
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-culture">
                  {place.culture}
                </p>
              </div>
            )}

            {/* History */}
            {place.history && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold font-heading mb-4 flex items-center gap-3" data-testid="heading-history">
                  <span className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <History className="text-secondary" size={20} />
                  </span>
                  History
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-history">
                  {place.history}
                </p>
              </div>
            )}

            {/* Gallery */}
            {place.galleryImages && place.galleryImages.length > 0 && (
              <div>
                <h2 className="text-xl font-bold font-heading mb-4" data-testid="heading-gallery">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {place.galleryImages.map((img, idx) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={img} 
                        alt={`${place.name} - Image ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LeadForm className="shadow-lg border-primary/20" defaultPurpose={`Visit ${place.name} in ${destination.name}`} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

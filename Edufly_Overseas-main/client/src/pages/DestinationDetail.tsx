import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useDestination, useDestinationPlaces } from "@/hooks/use-resources";
import { Link, useRoute } from "wouter";
import { Loader2, ArrowLeft, Clock, Languages, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "@/components/LeadForm";
import type { DestinationPlace } from "@shared/schema";

export default function DestinationDetail() {
  const [, params] = useRoute("/destinations/:slug");
  const slug = params?.slug || "";
  const { data: dest, isLoading } = useDestination(slug);
  const { data: places } = useDestinationPlaces(dest?.id);
  
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [isCultureExpanded, setIsCultureExpanded] = useState(false);

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

  if (!dest) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Destination Not Found</h2>
          <Link href="/destinations">
            <Button>Back to Destinations</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const shouldTruncate = dest.overview && dest.overview.length > 300;
  const displayOverview = shouldTruncate && !isOverviewExpanded 
    ? dest.overview.slice(0, 300) + "..." 
    : dest.overview;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img 
          src={dest.imageUrl || "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2033&auto=format&fit=crop"} 
          alt={dest.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container-custom text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold font-heading mb-4" data-testid="heading-destination-name">
              Explore {dest.name}
            </h1>
            <div className="flex justify-center gap-4 text-lg flex-wrap">
              {dest.duration && <span className="flex items-center gap-2"><Clock size={18} /> {dest.duration}</span>}
              {dest.language && <span className="flex items-center gap-2"><Languages size={18} /> {dest.language}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <Link href="/destinations" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
          <ArrowLeft size={16} className="mr-2" /> Back to Destinations
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview with Read More */}
            <div>
              <h2 className="text-3xl font-bold font-heading mb-6" data-testid="heading-overview">Overview</h2>
              <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-overview">
                {displayOverview}
              </p>
              {shouldTruncate && (
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto mt-2 text-primary font-semibold hover:bg-transparent"
                  onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                  data-testid="button-read-more"
                >
                  {isOverviewExpanded ? "Read Less" : "Read More"}
                </Button>
              )}
            </div>

            {/* Places to Explore */}
            {places && places.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-heading mb-6 flex items-center gap-2" data-testid="heading-places">
                  <MapPin className="text-primary" size={24} />
                  Places to Explore
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {places.map((place: DestinationPlace) => (
                    <div 
                      key={place.id}
                      className="group rounded-xl overflow-hidden border border-border bg-card"
                      data-testid={`card-place-${place.id}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={place.imageUrl} 
                          alt={place.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-white font-bold text-lg">{place.name}</h3>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {place.shortDescription || place.description}
                        </p>
                        {place.slug ? (
                          <Link href={`/destinations/${slug}/places/${place.slug}`}>
                            <Button className="w-full" data-testid={`button-explore-${place.id}`}>
                              Explore
                            </Button>
                          </Link>
                        ) : (
                          <Button className="w-full" disabled data-testid={`button-explore-${place.id}`}>
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Life & Culture */}
            {dest.sightseeing && (
              <div>
                <h2 className="text-2xl font-bold font-heading mb-4" data-testid="heading-culture">Life & Culture</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-culture">
                  {dest.sightseeing.length > 300 && !isCultureExpanded 
                    ? dest.sightseeing.slice(0, 300) + "..." 
                    : dest.sightseeing}
                </p>
                {dest.sightseeing.length > 300 && (
                  <Button 
                    variant="ghost" 
                    className="p-0 h-auto mt-2 text-primary font-semibold hover:bg-transparent"
                    onClick={() => setIsCultureExpanded(!isCultureExpanded)}
                    data-testid="button-read-more-culture"
                  >
                    {isCultureExpanded ? "Read Less" : "Read More"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <LeadForm className="shadow-lg border-primary/20" defaultPurpose={`Study in ${dest.name}`} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

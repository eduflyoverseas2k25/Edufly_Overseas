import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useGallery } from "@/hooks/use-resources";
import { Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function Gallery() {
  const { data: gallery, isLoading } = useGallery();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Separate photos and videos
  const photos = gallery?.filter(item => item.mediaType !== 'video') || [];
  const videos = gallery?.filter(item => item.mediaType === 'video') || [];

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const selectedMedia = photos[selectedIndex];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Header Banner */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary via-secondary to-accent text-white">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">Media Gallery</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Explore our collection of photos and videos from memorable educational journeys around the world
          </p>
        </div>
      </section>

      {/* Photos Section */}
      <section className="section-padding bg-slate-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Photo Gallery</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Click on any photo to view in full screen
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : photos.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {photos.map((item, index) => (
                <div 
                  key={item.id} 
                  className="break-inside-avoid rounded-xl overflow-hidden group relative cursor-pointer shadow-md hover:shadow-xl transition-shadow"
                  onClick={() => openLightbox(index)}
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Gallery Image"} 
                    className="w-full h-auto transform transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
                    }}
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <div className="text-white">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        {item.category && (
                          <p className="text-sm text-white/80">{item.category}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="text-lg">No photos available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Videos Section */}
      {videos.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Video Gallery</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Watch highlights from our educational tours and experiences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-slate-900"
                >
                  <div className="relative aspect-video">
                    <video 
                      src={item.imageUrl} 
                      controls
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="flex items-center justify-center h-full bg-slate-800 text-white"><p>Video not available</p></div>';
                        }
                      }}
                    />
                  </div>
                  {(item.title || item.category) && (
                    <div className="p-4 bg-slate-900 text-white">
                      {item.title && (
                        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                      )}
                      {item.category && (
                        <p className="text-sm text-slate-400">{item.category}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox Modal with Navigation */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-0 bg-black/95 border-none">
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>
          )}
          
          {selectedMedia && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              <div className="flex-1 flex items-center justify-center w-full mb-6">
                <img 
                  src={selectedMedia.imageUrl} 
                  alt={selectedMedia.title || "Gallery Image"} 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              
              {(selectedMedia.title || selectedMedia.category) && (
                <div className="text-center text-white space-y-2 max-w-2xl">
                  {selectedMedia.title && (
                    <h3 className="text-2xl font-bold">{selectedMedia.title}</h3>
                  )}
                  {selectedMedia.category && (
                    <p className="text-lg text-white/80">{selectedMedia.category}</p>
                  )}
                  {photos.length > 1 && (
                    <p className="text-sm text-white/60 mt-4">
                      {selectedIndex + 1} / {photos.length}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}

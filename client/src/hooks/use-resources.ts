import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { InsertLead } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// =====================
// LEADS
// =====================
export function useCreateLead() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertLead) => {
      const validated = api.leads.create.input.parse(data);
      const res = await fetch(api.leads.create.path, {
        method: api.leads.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit inquiry');
      }
      return api.leads.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent!",
        description: "We'll be in touch with you shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

// =====================
// DESTINATIONS
// =====================
export function useDestinations() {
  return useQuery({
    queryKey: [api.destinations.list.path],
    queryFn: async () => {
      const res = await fetch(api.destinations.list.path);
      if (!res.ok) throw new Error('Failed to fetch destinations');
      return api.destinations.list.responses[200].parse(await res.json());
    },
  });
}

export function useDestination(slug: string) {
  return useQuery({
    queryKey: [api.destinations.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.destinations.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch destination');
      return api.destinations.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useDestinationPlaces(destinationId: number | undefined) {
  return useQuery({
    queryKey: ['/api/destinations', destinationId, 'places'],
    queryFn: async () => {
      const res = await fetch(`/api/destinations/${destinationId}/places`);
      if (!res.ok) throw new Error('Failed to fetch places');
      return res.json();
    },
    enabled: !!destinationId,
  });
}

// =====================
// PROGRAMS
// =====================
export function usePrograms() {
  return useQuery({
    queryKey: [api.programs.list.path],
    queryFn: async () => {
      const res = await fetch(api.programs.list.path);
      if (!res.ok) throw new Error('Failed to fetch programs');
      return api.programs.list.responses[200].parse(await res.json());
    },
  });
}

// =====================
// TESTIMONIALS
// =====================
export function useTestimonials() {
  return useQuery({
    queryKey: [api.testimonials.list.path],
    queryFn: async () => {
      const res = await fetch(api.testimonials.list.path);
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return api.testimonials.list.responses[200].parse(await res.json());
    },
  });
}

// =====================
// GALLERY
// =====================
export function useGallery() {
  return useQuery({
    queryKey: [api.gallery.list.path],
    queryFn: async () => {
      const res = await fetch(api.gallery.list.path);
      if (!res.ok) throw new Error('Failed to fetch gallery');
      return api.gallery.list.responses[200].parse(await res.json());
    },
  });
}

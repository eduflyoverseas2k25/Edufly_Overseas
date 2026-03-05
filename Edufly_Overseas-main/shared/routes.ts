import { z } from 'zod';
import { insertLeadSchema, insertDestinationSchema, insertProgramSchema, insertTestimonialSchema, insertGallerySchema, destinations, programs, testimonials, gallery, leads, destinationPlaces } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // Public
  leads: {
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  destinations: {
    list: {
      method: 'GET' as const,
      path: '/api/destinations',
      responses: {
        200: z.array(z.custom<typeof destinations.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/destinations/:slug',
      responses: {
        200: z.custom<typeof destinations.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    places: {
      method: 'GET' as const,
      path: '/api/destinations/:id/places',
      responses: {
        200: z.array(z.custom<typeof destinationPlaces.$inferSelect>()),
      },
    },
  },
  programs: {
    list: {
      method: 'GET' as const,
      path: '/api/programs',
      responses: {
        200: z.array(z.custom<typeof programs.$inferSelect>()),
      },
    },
  },
  testimonials: {
    list: {
      method: 'GET' as const,
      path: '/api/testimonials',
      responses: {
        200: z.array(z.custom<typeof testimonials.$inferSelect>()),
      },
    },
  },
  gallery: {
    list: {
      method: 'GET' as const,
      path: '/api/gallery',
      responses: {
        200: z.array(z.custom<typeof gallery.$inferSelect>()),
      },
    },
  },
  
  // Admin Auth
  admin: {
    login: {
      method: 'POST' as const,
      path: '/api/admin/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    // Admin CRUD endpoints (abbreviated for brevity, normally would list all)
    leadsList: {
      method: 'GET' as const,
      path: '/api/admin/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

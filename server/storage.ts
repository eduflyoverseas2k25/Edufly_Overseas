import { 
  admins, leads, destinations, programs, testimonials, gallery, destinationPlaces, siteSettings,
  insertAdminSchema,
  type Admin, type Lead, type Destination, type Program, type Testimonial, type GalleryItem, type DestinationPlace, type SiteSettings,
  type InsertLead, type InsertDestination, type InsertProgram, type InsertTestimonial, type InsertGallery, type InsertDestinationPlace, type UpdateSiteSettings
} from "@shared/schema";
import { z } from "zod";

type InsertAdmin = z.infer<typeof insertAdminSchema>;
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Admins
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Leads
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  updateLeadStatus(id: number, status: string): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;

  // Destinations
  getDestinations(): Promise<Destination[]>;
  getDestinationById(id: number): Promise<Destination | undefined>;
  getDestinationBySlug(slug: string): Promise<Destination | undefined>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, destination: Partial<InsertDestination>): Promise<Destination | undefined>;
  deleteDestination(id: number): Promise<boolean>;

  // Programs
  getPrograms(): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<InsertProgram>): Promise<Program | undefined>;
  deleteProgram(id: number): Promise<boolean>;

  // Testimonials
  getTestimonials(): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  deleteTestimonial(id: number): Promise<boolean>;

  // Gallery
  getGallery(): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGallery): Promise<GalleryItem>;
  deleteGalleryItem(id: number): Promise<boolean>;

  // Destination Places
  getPlacesByDestinationId(destinationId: number): Promise<DestinationPlace[]>;
  createDestinationPlace(place: InsertDestinationPlace): Promise<DestinationPlace>;
  updateDestinationPlace(id: number, place: Partial<InsertDestinationPlace>): Promise<DestinationPlace | undefined>;
  deleteDestinationPlace(id: number): Promise<boolean>;

  // Site Settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<UpdateSiteSettings>): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  // Admins
  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  // Leads
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const [lead] = await db.update(leads).set({ status }).where(eq(leads.id, id)).returning();
    return lead;
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id)).returning();
    return result.length > 0;
  }

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations);
  }

  async getDestinationById(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination;
  }

  async getDestinationBySlug(slug: string): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.slug, slug));
    return destination;
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const [destination] = await db.insert(destinations).values(insertDestination).returning();
    return destination;
  }

  async updateDestination(id: number, data: Partial<InsertDestination>): Promise<Destination | undefined> {
    const [destination] = await db.update(destinations).set(data).where(eq(destinations.id, id)).returning();
    return destination;
  }

  async deleteDestination(id: number): Promise<boolean> {
    await db.delete(destinationPlaces).where(eq(destinationPlaces.destinationId, id));
    const result = await db.delete(destinations).where(eq(destinations.id, id)).returning();
    return result.length > 0;
  }

  // Programs
  async getPrograms(): Promise<Program[]> {
    return await db.select().from(programs);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db.insert(programs).values(insertProgram).returning();
    return program;
  }

  async updateProgram(id: number, data: Partial<InsertProgram>): Promise<Program | undefined> {
    const [program] = await db.update(programs).set(data).where(eq(programs.id, id)).returning();
    return program;
  }

  async deleteProgram(id: number): Promise<boolean> {
    const result = await db.delete(programs).where(eq(programs.id, id)).returning();
    return result.length > 0;
  }

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db.insert(testimonials).values(insertTestimonial).returning();
    return testimonial;
  }

  async deleteTestimonial(id: number): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    return await db.select().from(gallery);
  }

  async createGalleryItem(insertGallery: InsertGallery): Promise<GalleryItem> {
    const [item] = await db.insert(gallery).values(insertGallery).returning();
    return item;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    const result = await db.delete(gallery).where(eq(gallery.id, id)).returning();
    return result.length > 0;
  }

  // Destination Places
  async getPlacesByDestinationId(destinationId: number): Promise<DestinationPlace[]> {
    return await db.select().from(destinationPlaces).where(eq(destinationPlaces.destinationId, destinationId));
  }

  async createDestinationPlace(insertPlace: InsertDestinationPlace): Promise<DestinationPlace> {
    const [place] = await db.insert(destinationPlaces).values(insertPlace).returning();
    return place;
  }

  async updateDestinationPlace(id: number, data: Partial<InsertDestinationPlace>): Promise<DestinationPlace | undefined> {
    const [place] = await db.update(destinationPlaces).set(data).where(eq(destinationPlaces.id, id)).returning();
    return place;
  }

  async deleteDestinationPlace(id: number): Promise<boolean> {
    const result = await db.delete(destinationPlaces).where(eq(destinationPlaces.id, id)).returning();
    return result.length > 0;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
    if (!settings) {
      const [newSettings] = await db.insert(siteSettings).values({}).returning();
      return newSettings;
    }
    return settings;
  }

  async updateSiteSettings(data: Partial<UpdateSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSiteSettings();
    const [updated] = await db.update(siteSettings).set(data).where(eq(siteSettings.id, existing.id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

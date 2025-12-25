import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin Users
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Leads / Payments
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  purpose: text("purpose").notNull(), // 'Counselling', 'Registration', etc.
  amount: integer("amount"), // In cents or lowest unit, optional if just a lead
  status: text("status").default("pending"), // 'pending', 'paid', 'failed'
  gateway: text("gateway"), // 'razorpay'
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Destinations
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  overview: text("overview").notNull(),
  duration: text("duration"),
  language: text("language"),
  studentExposure: text("student_exposure"),
  academicVisits: text("academic_visits"),
  industryExposure: text("industry_exposure"),
  sightseeing: text("sightseeing"),
  imageUrl: text("image_url"),
});

// Programs
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(), // 'School Students', 'Engineering', etc.
  description: text("description"),
  imageUrl: text("image_url"),
});

// Testimonials
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"), // 'Student', 'Parent', 'Principal'
  content: text("content").notNull(),
  imageUrl: text("image_url"),
});

// Gallery
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title"),
  imageUrl: text("image_url").notNull(),
  category: text("category"),
});

// Destination Places (Landmarks to explore)
export const destinationPlaces = pgTable("destination_places", {
  id: serial("id").primaryKey(),
  destinationId: integer("destination_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug"),
  shortDescription: text("short_description"),
  description: text("description"),
  culture: text("culture"),
  history: text("history"),
  imageUrl: text("image_url").notNull(),
  galleryImages: text("gallery_images").array(),
});

// Site Settings (Theme & Content)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  // Theme Selection
  themeKey: text("theme_key").default("summer"), // 'summer', 'winter', 'autumn', 'spring', 'rainy', 'tropical', 'sunset', 'ocean'
  // Theme Colors (hex format)
  primaryColor: text("primary_color").default("#ef6e2d"),
  secondaryColor: text("secondary_color").default("#fdc22c"),
  accentColor: text("accent_color").default("#178ab6"),
  textColor: text("text_color").default("#1e293b"),
  // Hero Section
  heroStyle: text("hero_style").default("light"), // 'light' or 'dark'
  heroGradientFrom: text("hero_gradient_from").default("#fff7ed"),
  heroGradientVia: text("hero_gradient_via").default("#fef3c7"),
  heroGradientTo: text("hero_gradient_to").default("#ffedd5"),
  heroImageUrl: text("hero_image_url"),
  heroOverlayColor: text("hero_overlay_color"),
  heroHeadline: text("hero_headline").default("Start Here. Go Anywhere."),
  heroSubtext: text("hero_subtext").default("We guide you through every step of your international education journey, from university selection to visa approval."),
  heroBadgeText: text("hero_badge_text").default("Your Gateway to Global Education"),
  heroButtonPrimary: text("hero_button_primary").default("Explore Destinations"),
  heroButtonSecondary: text("hero_button_secondary").default("Learn More"),
  // Contact Info
  contactPhone: text("contact_phone").default("+91 98765 43210"),
  contactEmail: text("contact_email").default("info@eduflyoverseas.com"),
  contactAddress: text("contact_address").default("Chennai, Tamil Nadu, India"),
  // Footer
  footerTagline: text("footer_tagline").default("Your trusted partner for international education."),
  // About
  aboutIntro: text("about_intro").default("Edufly Overseas is a premier international education consultancy dedicated to helping students achieve their dreams of studying abroad."),
});

// Schemas
export const insertAdminSchema = createInsertSchema(admins);
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, transactionId: true, gateway: true, status: true });
export const insertDestinationSchema = createInsertSchema(destinations).omit({ id: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true });
export const insertTestimonialSchema = createInsertSchema(testimonials).omit({ id: true });
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true });
export const insertDestinationPlaceSchema = createInsertSchema(destinationPlaces).omit({ id: true });
export const updateSiteSettingsSchema = createInsertSchema(siteSettings).omit({ id: true });

// Types
export type Admin = typeof admins.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Destination = typeof destinations.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type GalleryItem = typeof gallery.$inferSelect;
export type DestinationPlace = typeof destinationPlaces.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type InsertDestinationPlace = z.infer<typeof insertDestinationPlaceSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;

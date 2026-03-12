import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertLeadSchema } from "@shared/schema";
import { getThemeByKey } from "@shared/themes";
import { initializeDatabase, pool } from "./db";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";
import { upload, uploadVideo, deleteFile } from "./upload";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await initializeDatabase();

  const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = authHeader.substring(7);
    if (!verifyToken(token)) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    
    next();
  };

  // ===== PUBLIC ROUTES =====

  // Destinations
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.get("/api/destinations/:slug", async (req, res) => {
    try {
      const destination = await storage.getDestinationBySlug(req.params.slug);
      if (!destination) return res.status(404).json({ message: "Destination not found" });
      res.json(destination);
    } catch (err) {
      console.error("Error fetching destination:", err);
      res.status(500).json({ message: "Failed to fetch destination" });
    }
  });

  // Places by Destination
  app.get("/api/destinations/:destId/places", async (req, res) => {
    try {
      const destId = parseInt(req.params.destId);
      if (isNaN(destId)) return res.status(400).json({ message: "Invalid destination ID" });
      const places = await storage.getPlacesByDestinationId(destId);
      res.json(places);
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });

  // Get single place by destination slug and place slug
  app.get("/api/destinations/:destSlug/places/:placeSlug", async (req, res) => {
    try {
      const { destSlug, placeSlug } = req.params;
      const destination = await storage.getDestinationBySlug(destSlug);
      if (!destination) return res.status(404).json({ message: "Destination not found" });
      
      const place = await storage.getPlaceBySlug(destination.id, placeSlug);
      if (!place) return res.status(404).json({ message: "Place not found" });
      
      res.json({ place, destination });
    } catch (err) {
      console.error("Error fetching place:", err);
      res.status(500).json({ message: "Failed to fetch place" });
    }
  });

  // Programs
  app.get("/api/programs", async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (err) {
      console.error("Error fetching programs:", err);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  // Testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  // Gallery
  app.get("/api/gallery", async (req, res) => {
    try {
      const gallery = await storage.getGallery();
      res.json(gallery);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  // Site Settings (Public - for frontend theme)
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Lead Submission
  app.post("/api/leads", async (req, res) => {
    try {
      const parsed = insertLeadSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid lead data", errors: parsed.error.flatten() });
      }
      const lead = await storage.createLead(parsed.data);
      res.status(201).json(lead);
    } catch (err) {
      console.error("Error creating lead:", err);
      res.status(500).json({ message: "Failed to submit lead" });
    }
  });

  // ===== ADMIN AUTH =====

  // Initialize admin user with hashed password if not exists
  const initAdmin = async () => {
    try {
      const result = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
      if (result.rows.length === 0) {
        const hashedPassword = await hashPassword(process.env.ADMIN_PASS || 'Varshaa@1999');
        await pool.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hashedPassword]);
        console.log('Admin user created with hashed password');
      }
    } catch (err) {
      console.error('Error initializing admin:', err);
    }
  };
  await initAdmin();

  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Get admin from database
      const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = result.rows[0];
      const isValid = await verifyPassword(password, admin.password);

      if (isValid) {
        const token = generateToken();
        return res.json({ success: true, token });
      }
      
      res.status(401).json({ message: "Invalid credentials" });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    res.json({ valid: true });
  });

  // Change Password
  app.post("/api/admin/change-password", requireAdmin, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters long" });
      }

      // Get current admin password (assuming username is 'admin')
      const result = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Admin user not found" });
      }

      const admin = result.rows[0];
      const isValid = await verifyPassword(currentPassword, admin.password);

      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedNewPassword = await hashPassword(newPassword);
      await pool.query('UPDATE admins SET password = $1 WHERE username = $2', [hashedNewPassword, 'admin']);

      res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Change password error:", err);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // ===== FILE UPLOAD ROUTES =====

  // Upload gallery image
  app.post("/api/admin/upload/gallery", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/gallery/${req.file.filename}`;
      res.json({ 
        message: "File uploaded successfully", 
        url: fileUrl,
        filename: req.file.filename 
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Upload destination image
  app.post("/api/admin/upload/destination", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/destinations/${req.file.filename}`;
      res.json({ 
        message: "File uploaded successfully", 
        url: fileUrl,
        filename: req.file.filename 
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Upload gallery video
  app.post("/api/admin/upload/video", requireAdmin, uploadVideo.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = `/uploads/videos/${req.file.filename}`;
      res.json({ 
        message: "Video uploaded successfully", 
        url: fileUrl,
        filename: req.file.filename,
        mediaType: 'video'
      });
    } catch (err) {
      console.error("Video upload error:", err);
      res.status(500).json({ message: "Failed to upload video" });
    }
  });

  // ===== ADMIN ROUTES (Protected) =====

  // Admin Leads
  app.get("/api/admin/leads", requireAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (err) {
      console.error("Error fetching leads:", err);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteLead(id);
      if (!deleted) return res.status(404).json({ message: "Lead not found" });
      res.json({ message: "Lead deleted" });
    } catch (err) {
      console.error("Error deleting lead:", err);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Admin Destinations
  app.get("/api/admin/destinations", requireAdmin, async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.post("/api/admin/destinations", requireAdmin, async (req, res) => {
    try {
      const destination = await storage.createDestination(req.body);
      res.status(201).json(destination);
    } catch (err) {
      console.error("Error creating destination:", err);
      res.status(400).json({ message: "Failed to create destination" });
    }
  });

  app.put("/api/admin/destinations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const destination = await storage.updateDestination(id, req.body);
      if (!destination) return res.status(404).json({ message: "Destination not found" });
      res.json(destination);
    } catch (err) {
      console.error("Error updating destination:", err);
      res.status(500).json({ message: "Failed to update destination" });
    }
  });

  app.delete("/api/admin/destinations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDestination(id);
      if (!deleted) return res.status(404).json({ message: "Destination not found" });
      res.json({ message: "Destination deleted" });
    } catch (err) {
      console.error("Error deleting destination:", err);
      res.status(500).json({ message: "Failed to delete destination" });
    }
  });

  // Admin Programs
  app.get("/api/admin/programs", requireAdmin, async (req, res) => {
    try {
      const programs = await storage.getPrograms();
      res.json(programs);
    } catch (err) {
      console.error("Error fetching programs:", err);
      res.status(500).json({ message: "Failed to fetch programs" });
    }
  });

  app.post("/api/admin/programs", requireAdmin, async (req, res) => {
    try {
      const program = await storage.createProgram(req.body);
      res.status(201).json(program);
    } catch (err) {
      console.error("Error creating program:", err);
      res.status(400).json({ message: "Failed to create program" });
    }
  });

  app.put("/api/admin/programs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await storage.updateProgram(id, req.body);
      if (!program) return res.status(404).json({ message: "Program not found" });
      res.json(program);
    } catch (err) {
      console.error("Error updating program:", err);
      res.status(500).json({ message: "Failed to update program" });
    }
  });

  app.delete("/api/admin/programs/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProgram(id);
      if (!deleted) return res.status(404).json({ message: "Program not found" });
      res.json({ message: "Program deleted" });
    } catch (err) {
      console.error("Error deleting program:", err);
      res.status(500).json({ message: "Failed to delete program" });
    }
  });

  // Admin Places
  app.get("/api/admin/destinations/:destId/places", requireAdmin, async (req, res) => {
    try {
      const destId = parseInt(req.params.destId);
      const places = await storage.getPlacesByDestinationId(destId);
      res.json(places);
    } catch (err) {
      console.error("Error fetching places:", err);
      res.status(500).json({ message: "Failed to fetch places" });
    }
  });

  app.post("/api/admin/places", requireAdmin, async (req, res) => {
    try {
      const place = await storage.createDestinationPlace(req.body);
      res.status(201).json(place);
    } catch (err) {
      console.error("Error creating place:", err);
      res.status(400).json({ message: "Failed to create place" });
    }
  });

  app.put("/api/admin/places/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const place = await storage.updateDestinationPlace(id, req.body);
      if (!place) return res.status(404).json({ message: "Place not found" });
      res.json(place);
    } catch (err) {
      console.error("Error updating place:", err);
      res.status(500).json({ message: "Failed to update place" });
    }
  });

  app.delete("/api/admin/places/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDestinationPlace(id);
      if (!deleted) return res.status(404).json({ message: "Place not found" });
      res.json({ message: "Place deleted" });
    } catch (err) {
      console.error("Error deleting place:", err);
      res.status(500).json({ message: "Failed to delete place" });
    }
  });

  // Admin Gallery
  app.get("/api/admin/gallery", requireAdmin, async (req, res) => {
    try {
      const gallery = await storage.getGallery();
      res.json(gallery);
    } catch (err) {
      console.error("Error fetching gallery:", err);
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post("/api/admin/gallery", requireAdmin, async (req, res) => {
    try {
      const item = await storage.createGalleryItem(req.body);
      res.status(201).json(item);
    } catch (err) {
      console.error("Error creating gallery item:", err);
      res.status(400).json({ message: "Failed to create gallery item" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGalleryItem(id);
      if (!deleted) return res.status(404).json({ message: "Gallery item not found" });
      res.json({ message: "Gallery item deleted" });
    } catch (err) {
      console.error("Error deleting gallery item:", err);
      res.status(500).json({ message: "Failed to delete gallery item" });
    }
  });

  // Admin Testimonials
  app.get("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (err) {
      console.error("Error fetching testimonials:", err);
      res.status(500).json({ message: "Failed to fetch testimonials" });
    }
  });

  app.post("/api/admin/testimonials", requireAdmin, async (req, res) => {
    try {
      const testimonial = await storage.createTestimonial(req.body);
      res.status(201).json(testimonial);
    } catch (err) {
      console.error("Error creating testimonial:", err);
      res.status(400).json({ message: "Failed to create testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTestimonial(id);
      if (!deleted) return res.status(404).json({ message: "Testimonial not found" });
      res.json({ message: "Testimonial deleted" });
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      res.status(500).json({ message: "Failed to delete testimonial" });
    }
  });

  // Admin Site Settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (err) {
      console.error("Error fetching settings:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSiteSettings(req.body);
      res.json(settings);
    } catch (err) {
      console.error("Error updating settings:", err);
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // Apply Theme Preset
  app.post("/api/admin/settings/apply-theme", requireAdmin, async (req, res) => {
    try {
      const { themeKey } = req.body;
      if (!themeKey) {
        return res.status(400).json({ message: "Theme key is required" });
      }
      
      const theme = getThemeByKey(themeKey);
      
      if (!theme) {
        return res.status(400).json({ message: "Invalid theme key" });
      }
      
      const settings = await storage.updateSiteSettings({
        themeKey: theme.key,
        primaryColor: theme.colors.primary,
        secondaryColor: theme.colors.secondary,
        accentColor: theme.colors.accent,
        textColor: theme.colors.text,
        heroStyle: theme.hero.style,
        heroGradientFrom: theme.hero.gradientFrom,
        heroGradientVia: theme.hero.gradientVia,
        heroGradientTo: theme.hero.gradientTo,
        heroImageUrl: theme.hero.imageUrl || null,
        heroOverlayColor: theme.hero.overlayColor || null,
      });
      
      res.json(settings);
    } catch (err) {
      console.error("Apply theme error:", err);
      res.status(400).json({ message: "Failed to apply theme" });
    }
  });

  return httpServer;
}

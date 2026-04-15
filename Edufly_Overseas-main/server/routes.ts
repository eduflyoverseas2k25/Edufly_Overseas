import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertLeadSchema } from "@shared/schema";
import { getThemeByKey } from "@shared/themes";
import { initializeDatabase, pool } from "./db";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./auth";
import { upload, uploadVideo } from "./upload";
import { uploadToS3, validateFileType, validateFileSize } from "./s3";

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

  // ===== RAZORPAY PAYMENT INTEGRATION =====
  
  const Razorpay = (await import('razorpay')).default;
  const crypto = await import('crypto');
  
  // Initialize Razorpay only if keys are provided
  let razorpayInstance: any = null;
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Helper to check if Razorpay is configured
  const isRazorpayConfigured = () => {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  };

  // Create Razorpay Order
  app.post("/api/payment/create-order", async (req, res) => {
    try {
      const { name, phone, program, amount, paymentType } = req.body;
      
      if (!name || !phone || !amount || !paymentType) {
        return res.status(400).json({ message: "Name, phone, amount, and payment type are required" });
      }

      if (!isRazorpayConfigured() || !razorpayInstance) {
        return res.status(500).json({ 
          message: "Payment system not configured. Please contact administrator to set up Razorpay keys." 
        });
      }

      // Amount should be in paise (multiply by 100)
      const amountInPaise = parseInt(amount) * 100;
      
      // Get full amount from settings for total_amount
      const settingsResult = await pool.query('SELECT payment_full_amount FROM site_settings LIMIT 1');
      const fullAmount = settingsResult.rows[0]?.payment_full_amount || 350000;
      
      // Calculate total and remaining
      const totalAmount = fullAmount * 100; // in paise
      const paidAmount = amountInPaise;
      const remainingAmount = paymentType === 'full' ? 0 : (totalAmount - paidAmount);

      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
          name,
          phone,
          program: program || 'NASA',
          paymentType
        }
      };

      const order = await razorpayInstance.orders.create(options);

      // Save initial payment record
      await pool.query(
        `INSERT INTO payments (name, phone, program, total_amount, paid_amount, remaining_amount, payment_type, order_id, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [name, phone, program || 'NASA', totalAmount, paidAmount, remainingAmount, paymentType, order.id, 'pending']
      );

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  // Verify Razorpay Payment
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "Missing payment verification data" });
      }

      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
        .update(body.toString())
        .digest("hex");

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Update payment status to success
        const updateResult = await pool.query(
          `UPDATE payments 
           SET payment_id = $1, signature = $2, status = $3 
           WHERE order_id = $4
           RETURNING payment_type, remaining_amount`,
          [razorpay_payment_id, razorpay_signature, 'success', razorpay_order_id]
        );

        const paymentRecord = updateResult.rows[0];
        
        // Determine final status based on payment type
        let finalStatus = 'success';
        if (paymentRecord.payment_type === 'full' || paymentRecord.remaining_amount === 0) {
          finalStatus = 'success'; // Fully paid
        } else {
          finalStatus = 'partially_paid'; // Part payment
        }
        
        // Update with final status
        await pool.query(
          `UPDATE payments SET status = $1 WHERE order_id = $2`,
          [finalStatus, razorpay_order_id]
        );

        // Get updated payment details
        const result = await pool.query(
          `SELECT * FROM payments WHERE order_id = $1`,
          [razorpay_order_id]
        );

        res.json({ 
          success: true, 
          message: "Payment verified successfully",
          payment: result.rows[0]
        });
      } else {
        // Update payment status to failed
        await pool.query(
          `UPDATE payments SET status = $1 WHERE order_id = $2`,
          ['failed', razorpay_order_id]
        );

        res.status(400).json({ 
          success: false, 
          message: "Payment verification failed" 
        });
      }
    } catch (err) {
      console.error("Error verifying payment:", err);
      res.status(500).json({ message: "Payment verification failed" });
    }
  });

  // Refund Payment (Admin only)
  app.post("/api/payment/refund/:paymentId", requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;

      if (!isRazorpayConfigured() || !razorpayInstance) {
        return res.status(500).json({ 
          message: "Payment system not configured. Cannot process refund." 
        });
      }

      // Get payment details
      const result = await pool.query(
        `SELECT * FROM payments WHERE payment_id = $1 AND status = 'success'`,
        [paymentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Payment not found or already refunded" });
      }

      const payment = result.rows[0];

      // Process refund via Razorpay
      const refund = await razorpayInstance.payments.refund(paymentId, {
        amount: payment.amount
      });

      // Update payment status
      await pool.query(
        `UPDATE payments SET status = $1, refund_id = $2 WHERE payment_id = $3`,
        ['refunded', refund.id, paymentId]
      );

      res.json({ 
        success: true, 
        message: "Refund processed successfully",
        refundId: refund.id
      });
    } catch (err) {
      console.error("Error processing refund:", err);
      res.status(500).json({ message: "Refund failed" });
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

      // Get current admin password
      const result = await pool.query('SELECT password FROM admins WHERE username = $1', ['admin']);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const isValid = await verifyPassword(currentPassword, result.rows[0].password);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Update with new password
      const hashedPassword = await hashPassword(newPassword);
      await pool.query('UPDATE admins SET password = $1 WHERE username = $2', [hashedPassword, 'admin']);

      res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Error changing password:", err);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // ===== ADMIN: LEAD MANAGEMENT =====

  // Get all leads
  app.get("/api/admin/leads", requireAdmin, async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT * FROM leads ORDER BY created_at DESC`
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching leads:", err);
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  // Update lead status
  app.patch("/api/admin/leads/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = ['new', 'contacted', 'partially_paid', 'fully_paid'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      await pool.query(
        `UPDATE leads SET status = $1 WHERE id = $2`,
        [status, id]
      );

      res.json({ success: true, message: "Lead status updated" });
    } catch (err) {
      console.error("Error updating lead:", err);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Delete lead
  app.delete("/api/admin/leads/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query(`DELETE FROM leads WHERE id = $1`, [id]);
      res.json({ success: true, message: "Lead deleted" });
    } catch (err) {
      console.error("Error deleting lead:", err);
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // ===== ADMIN: PAYMENT MANAGEMENT =====

  // Get all payments with optional filters
  app.get("/api/admin/payments", requireAdmin, async (req, res) => {
    try {
      const { status, startDate, endDate } = req.query;

      let query = `SELECT * FROM payments WHERE 1=1`;
      const params: any[] = [];

      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      if (startDate) {
        params.push(startDate);
        query += ` AND created_at >= $${params.length}`;
      }

      if (endDate) {
        params.push(endDate);
        query += ` AND created_at <= $${params.length}`;
      }

      query += ` ORDER BY created_at DESC`;

      const result = await pool.query(query, params);

      // Check for duplicate payments (same phone + successful payment)
      const duplicates = await pool.query(`
        SELECT phone, COUNT(*) as count 
        FROM payments 
        WHERE status = 'success' 
        GROUP BY phone 
        HAVING COUNT(*) > 1
      `);

      res.json({
        payments: result.rows,
        duplicatePhones: duplicates.rows.map(d => d.phone)
      });
    } catch (err) {
      console.error("Error fetching payments:", err);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Get single payment details
  app.get("/api/admin/payments/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT * FROM payments WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error fetching payment:", err);
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  // Get Payment Settings (Public - for Sarah chatbot)
  app.get("/api/payment/settings", async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT payment_full_amount, payment_enable_part_payment FROM site_settings LIMIT 1`
      );
      
      if (result.rows.length === 0) {
        return res.json({
          fullAmount: 350000,
          enablePartPayment: true
        });
      }

      const settings = result.rows[0];
      res.json({
        fullAmount: settings.payment_full_amount || 350000,
        enablePartPayment: settings.payment_enable_part_payment !== false
      });
    } catch (err) {
      console.error("Error fetching payment settings:", err);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });

  // Get User Status (Public - for Sarah returning user recognition)
  app.get("/api/user/status", async (req, res) => {
    try {
      const { phone } = req.query;

      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Check for lead
      const leadResult = await pool.query(
        `SELECT name, grade, program FROM leads WHERE phone = $1 ORDER BY created_at DESC LIMIT 1`,
        [phone]
      );

      // Check for payments
      const paymentResult = await pool.query(
        `SELECT 
          name, 
          total_amount, 
          paid_amount, 
          remaining_amount, 
          payment_type,
          status,
          payment_id,
          created_at
         FROM payments 
         WHERE phone = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [phone]
      );

      // Determine status
      let userStatus = {
        name: null,
        status: 'new',
        total_amount: null,
        paid_amount: null,
        remaining_amount: null,
        payment_id: null,
        created_at: null
      };

      if (paymentResult.rows.length > 0) {
        const payment = paymentResult.rows[0];
        
        // User has payment record
        if (payment.status === 'success') {
          userStatus = {
            name: payment.name,
            status: 'full',
            total_amount: payment.total_amount,
            paid_amount: payment.paid_amount,
            remaining_amount: 0,
            payment_id: payment.payment_id,
            created_at: payment.created_at
          };
        } else if (payment.status === 'partially_paid') {
          userStatus = {
            name: payment.name,
            status: 'partial',
            total_amount: payment.total_amount,
            paid_amount: payment.paid_amount,
            remaining_amount: payment.remaining_amount,
            payment_id: payment.payment_id,
            created_at: payment.created_at
          };
        } else {
          // Payment exists but failed/pending - treat as lead
          userStatus = {
            name: payment.name,
            status: 'lead',
            total_amount: null,
            paid_amount: null,
            remaining_amount: null,
            payment_id: null,
            created_at: payment.created_at
          };
        }
      } else if (leadResult.rows.length > 0) {
        // User has lead but no payment
        const lead = leadResult.rows[0];
        userStatus = {
          name: lead.name,
          status: 'lead',
          total_amount: null,
          paid_amount: null,
          remaining_amount: null,
          payment_id: null,
          created_at: null
        };
      }

      res.json(userStatus);
    } catch (err) {
      console.error("Error fetching user status:", err);
      res.status(500).json({ message: "Failed to fetch user status" });
    }
  });

  // Update Payment Settings (Admin only)
  app.patch("/api/admin/payment-settings", requireAdmin, async (req, res) => {
    try {
      const { fullAmount, enablePartPayment } = req.body;

      await pool.query(
        `UPDATE site_settings 
         SET payment_full_amount = $1, payment_enable_part_payment = $2
         WHERE id = 1`,
        [fullAmount, enablePartPayment]
      );

      res.json({ success: true, message: "Payment settings updated" });
    } catch (err) {
      console.error("Error updating payment settings:", err);
      res.status(500).json({ message: "Failed to update payment settings" });
    }
  });

  // ===== FILE UPLOAD ROUTES (AWS S3) =====

  // Upload gallery image
  app.post("/api/admin/upload/gallery", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      console.log('=== Upload Gallery Request ===');
      console.log('File received:', !!req.file);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('File name:', req.file.originalname);
      console.log('File size:', req.file.size);
      console.log('File type:', req.file.mimetype);

      // Validate file type and size
      if (!validateFileType(req.file, 'image')) {
        return res.status(400).json({ message: "Only PNG, JPEG, and JPG files are allowed" });
      }
      if (!validateFileSize(req.file, 10)) {
        return res.status(400).json({ message: "File size must be less than 10MB" });
      }

      // Upload to S3
      const fileUrl = await uploadToS3(req.file, 'gallery/images');
      
      res.json({ 
        message: "File uploaded successfully", 
        url: fileUrl,
        filename: req.file.originalname 
      });
    } catch (err: any) {
      console.error("=== Upload Gallery Error ===");
      console.error("Error:", err);
      res.status(500).json({ 
        message: "Failed to upload file", 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  });

  // Upload destination image
  app.post("/api/admin/upload/destination", requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Validate file type and size
      if (!validateFileType(req.file, 'image')) {
        return res.status(400).json({ message: "Only PNG, JPEG, and JPG files are allowed" });
      }
      if (!validateFileSize(req.file, 10)) {
        return res.status(400).json({ message: "File size must be less than 10MB" });
      }

      // Upload to S3
      const fileUrl = await uploadToS3(req.file, 'destinations');
      
      res.json({ 
        message: "File uploaded successfully", 
        url: fileUrl,
        filename: req.file.originalname 
      });
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Upload gallery video
  app.post("/api/admin/upload/video", requireAdmin, uploadVideo.single('file'), async (req, res) => {
    try {
      console.log('=== Upload Video Request ===');
      console.log('File received:', !!req.file);
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      console.log('File name:', req.file.originalname);
      console.log('File size:', req.file.size);
      console.log('File type:', req.file.mimetype);

      // Validate file type and size
      if (!validateFileType(req.file, 'video')) {
        return res.status(400).json({ message: "Only MP4, MOV, and WEBM files are allowed" });
      }
      if (!validateFileSize(req.file, 200)) {
        return res.status(400).json({ message: "File size must be less than 200MB" });
      }

      // Upload to S3
      const fileUrl = await uploadToS3(req.file, 'gallery/videos');
      
      res.json({ 
        message: "Video uploaded successfully", 
        url: fileUrl,
        filename: req.file.originalname,
        mediaType: 'video'
      });
    } catch (err: any) {
      console.error("=== Upload Video Error ===");
      console.error("Error:", err);
      res.status(500).json({ 
        message: "Failed to upload video",
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
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

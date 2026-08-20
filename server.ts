import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import {
  UserRole,
  Property,
  PropertyImage,
  SearchFilters,
  Amenity,
  LocationSuggestion,
} from './src/types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'roomsetu-super-secure-production-jwt-key-949f4827';
const PORT = 3000;

interface AuthTokenPayload {
  id: string;
  role: UserRole;
  phone?: string;
  email?: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Authentication Middleware
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    // Check if user is suspended in db
    if (decoded.role === 'USER') {
      const u = db.users.get(decoded.id);
      if (u && u.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          error: { code: 'USER_SUSPENDED', message: 'Your account has been suspended by the platform administrator.' },
        });
      }
    } else if (decoded.role === 'ROOM_OWNER') {
      const o = db.owners.get(decoded.id);
      if (o && o.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          error: { code: 'OWNER_SUSPENDED', message: 'Your room owner account has been suspended by the platform administrator.' },
        });
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session token' },
    });
  }
}

// Optional Auth (for public search that can identify user if logged in)
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      // ignore
    }
  }
  next();
}

// Role Authorization Guard
function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to access this resource.' },
      });
    }
    next();
  };
}

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ============================================================
  // HEALTH & OBSERVABILITY
  // ============================================================
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'RoomSetu API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      propertiesCount: db.properties.size,
    });
  });

  app.get('/ready', (req, res) => {
    res.json({ status: 'ready', uptime: process.uptime() });
  });

  // ============================================================
  // 1. AUTHENTICATION MODULE
  // ============================================================

  // Send OTP (User & Room Owner)
  app.post('/api/auth/send-otp', (req, res) => {
    const { phone, role } = req.body;
    if (!phone || !phone.match(/^\d{10}$/)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PHONE', message: 'Please provide a valid 10-digit mobile number' },
      });
    }
    if (role !== 'USER' && role !== 'ROOM_OWNER') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: 'Role must be USER or ROOM_OWNER' },
      });
    }

    const otpCode = db.generateOtp(phone, role);
    return res.json({
      success: true,
      message: `OTP sent successfully to +91 ${phone}`,
      devOtp: otpCode, // Provided for instant demo testing
      expiresInSeconds: 600,
    });
  });

  // Verify OTP & Login/Register
  app.post('/api/auth/verify-otp', (req, res) => {
    const { phone, role, code, name } = req.body;
    if (!phone || !code || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Phone, role, and OTP code are required.' },
      });
    }

    const isValid = db.verifyOtp(phone, role, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP. Please enter 123456.' },
      });
    }

    let userEntity: any = null;

    if (role === 'USER') {
      // Find or create user
      let existingUser = Array.from(db.users.values()).find((u) => u.phone === phone);
      if (!existingUser) {
        existingUser = {
          id: 'usr_' + crypto.randomUUID().slice(0, 8),
          name: name?.trim() || `User ${phone.slice(-4)}`,
          phone,
          role: 'USER',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        };
        db.users.set(existingUser.id, existingUser);
        db.logAudit(existingUser.id, existingUser.name, 'USER', 'REGISTER', 'USER', existingUser.id, 'User registered with mobile OTP');
      }
      userEntity = existingUser;
    } else if (role === 'ROOM_OWNER') {
      let existingOwner = Array.from(db.owners.values()).find((o) => o.phone === phone);
      if (!existingOwner) {
        existingOwner = {
          id: 'own_' + crypto.randomUUID().slice(0, 8),
          name: name?.trim() || `Owner ${phone.slice(-4)}`,
          phone,
          role: 'ROOM_OWNER',
          status: 'ACTIVE',
          verifiedStatus: 'VERIFIED',
          rating: 5.0,
          totalListings: 0,
          createdAt: new Date().toISOString(),
        };
        db.owners.set(existingOwner.id, existingOwner);
        db.logAudit(existingOwner.id, existingOwner.name, 'ROOM_OWNER', 'REGISTER', 'ROOM_OWNER', existingOwner.id, 'Room Owner registered with mobile OTP');
      }
      userEntity = existingOwner;
    }

    const tokenPayload: AuthTokenPayload = {
      id: userEntity.id,
      role: userEntity.role,
      phone: userEntity.phone,
      name: userEntity.name,
      email: userEntity.email,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: userEntity,
    });
  });

  // Admin Login
  app.post('/api/auth/admin-login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' },
      });
    }

    const record = db.admins.get(email.toLowerCase().trim());
    if (!record || !bcrypt.compareSync(password, record.passwordHash)) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid admin email or password' },
      });
    }

    const tokenPayload: AuthTokenPayload = {
      id: record.user.id,
      role: 'ADMIN',
      email: record.user.email,
      name: record.user.name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1d' });
    db.logAudit(record.user.id, record.user.name, 'ADMIN', 'ADMIN_LOGIN', 'ADMIN', record.user.id, 'Admin logged in');

    return res.json({
      success: true,
      token,
      user: record.user,
    });
  });

  // Current authenticated user profile
  app.get('/api/auth/me', authenticateToken, (req, res) => {
    const { id, role } = req.user!;
    if (role === 'USER') {
      const u = db.users.get(id);
      return res.json({ success: true, user: u });
    } else if (role === 'ROOM_OWNER') {
      const o = db.owners.get(id);
      return res.json({ success: true, user: o });
    } else if (role === 'ADMIN') {
      const a = Array.from(db.admins.values()).find((adm) => adm.user.id === id);
      return res.json({ success: true, user: a?.user });
    }
    return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
  });

  // Quick switch role / demo login helper
  app.post('/api/auth/demo-switch', (req, res) => {
    const { targetRole } = req.body;
    let userEntity: any;

    if (targetRole === 'ADMIN') {
      userEntity = Array.from(db.admins.values())[0].user;
    } else if (targetRole === 'ROOM_OWNER') {
      userEntity = db.owners.get('own_rajesh_01') || Array.from(db.owners.values())[0];
    } else {
      userEntity = db.users.get('usr_rushikesh_01') || Array.from(db.users.values())[0];
    }

    const tokenPayload: AuthTokenPayload = {
      id: userEntity.id,
      role: targetRole,
      phone: userEntity.phone,
      name: userEntity.name,
      email: userEntity.email,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({ success: true, token, user: userEntity });
  });

  // ============================================================
  // 2. LOCATION & GOOGLE PLACES BACKEND
  // ============================================================

  // Autocomplete Suggestions for Search
  app.get('/api/locations/autocomplete', (req, res) => {
    const query = (req.query.q as string || '').toLowerCase().trim();

    const knownPlaces: LocationSuggestion[] = [
      {
        placeId: 'loc_wakad_pune',
        mainText: 'Wakad',
        secondaryText: 'Pune, Maharashtra, India',
        description: 'Wakad, Pune, Maharashtra, India',
        latitude: 18.5987,
        longitude: 73.7634,
        locality: 'Wakad',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_hinjawadi_pune',
        mainText: 'Hinjawadi IT Park',
        secondaryText: 'Pune, Maharashtra, India',
        description: 'Hinjawadi, Pune, Maharashtra, India',
        latitude: 18.5793,
        longitude: 73.7389,
        locality: 'Hinjawadi',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_baner_pune',
        mainText: 'Baner',
        secondaryText: 'Pune, Maharashtra, India',
        description: 'Baner, Pune, Maharashtra, India',
        latitude: 18.5596,
        longitude: 73.7868,
        locality: 'Baner',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_kothrud_pune',
        mainText: 'Kothrud',
        secondaryText: 'Pune, Maharashtra, India',
        description: 'Kothrud, Pune, Maharashtra, India',
        latitude: 18.5074,
        longitude: 73.8077,
        locality: 'Kothrud',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_viman_nagar_pune',
        mainText: 'Viman Nagar',
        secondaryText: 'Pune, Maharashtra, India',
        description: 'Viman Nagar, Pune, Maharashtra, India',
        latitude: 18.5679,
        longitude: 73.9143,
        locality: 'Viman Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_koramangala_blr',
        mainText: 'Koramangala',
        secondaryText: 'Bengaluru, Karnataka, India',
        description: 'Koramangala, Bengaluru, Karnataka, India',
        latitude: 12.9352,
        longitude: 77.6245,
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
      },
      {
        placeId: 'loc_indiranagar_blr',
        mainText: 'Indiranagar',
        secondaryText: 'Bengaluru, Karnataka, India',
        description: 'Indiranagar, Bengaluru, Karnataka, India',
        latitude: 12.9784,
        longitude: 77.6408,
        locality: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
      },
      {
        placeId: 'loc_andheri_mum',
        mainText: 'Andheri West',
        secondaryText: 'Mumbai, Maharashtra, India',
        description: 'Andheri West, Mumbai, Maharashtra, India',
        latitude: 19.1363,
        longitude: 72.8277,
        locality: 'Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_powai_mum',
        mainText: 'Powai',
        secondaryText: 'Mumbai, Maharashtra, India',
        description: 'Powai, Mumbai, Maharashtra, India',
        latitude: 19.1176,
        longitude: 72.9060,
        locality: 'Powai',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      {
        placeId: 'loc_cyber_city_ggn',
        mainText: 'DLF Cyber City',
        secondaryText: 'Gurugram, Haryana, India',
        description: 'DLF Cyber City, Gurugram, Haryana, India',
        latitude: 28.4950,
        longitude: 77.0895,
        locality: 'Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        country: 'India',
      },
    ];

    if (!query) {
      return res.json({ success: true, suggestions: knownPlaces.slice(0, 6) });
    }

    const filtered = knownPlaces.filter(
      (p) =>
        p.mainText.toLowerCase().includes(query) ||
        p.secondaryText.toLowerCase().includes(query) ||
        p.locality.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
    );

    return res.json({ success: true, suggestions: filtered });
  });

  // Reverse Geocoding Helper
  app.get('/api/locations/reverse-geocode', (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_COORDS', message: 'Valid lat/lng required' } });
    }

    // Determine nearest known locality
    if (Math.abs(lat - 18.5987) < 0.1 && Math.abs(lng - 73.7634) < 0.1) {
      return res.json({
        success: true,
        formattedAddress: 'Wakad, Pune, Maharashtra 411057, India',
        locality: 'Wakad',
        city: 'Pune',
        state: 'Maharashtra',
        postalCode: '411057',
        country: 'India',
      });
    }

    return res.json({
      success: true,
      formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      locality: 'Selected Area',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411057',
      country: 'India',
    });
  });

  // ============================================================
  // 3. PROPERTY SEARCH & DISCOVERY (USER)
  // ============================================================

  // Public Search endpoint with radius & filters
  app.get('/api/properties/search', optionalAuth, (req, res) => {
    const filters: SearchFilters = {
      latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radiusKm: req.query.radius ? parseFloat(req.query.radius as string) : 15,
      query: (req.query.q as string) || undefined,
      city: (req.query.city as string) || undefined,
      locality: (req.query.locality as string) || undefined,
      minRent: req.query.minRent ? parseInt(req.query.minRent as string, 10) : undefined,
      maxRent: req.query.maxRent ? parseInt(req.query.maxRent as string, 10) : undefined,
      propertyType: (req.query.propertyType as any) || 'ALL',
      roomType: (req.query.roomType as any) || 'ALL',
      furnishingStatus: (req.query.furnishingStatus as any) || 'ALL',
      tenantType: (req.query.tenantType as any) || 'ALL',
      amenities: req.query.amenities ? (Array.isArray(req.query.amenities) ? req.query.amenities as Amenity[] : [req.query.amenities as Amenity]) : undefined,
      availabilityStatus: (req.query.availability as any) || 'ALL',
      sortBy: (req.query.sortBy as any) || 'recommended',
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
    };

    const results = db.searchProperties(filters);
    return res.json({ success: true, ...results });
  });

  // Property Details
  app.get('/api/properties/:id', optionalAuth, (req, res) => {
    const { id } = req.params;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROPERTY_NOT_FOUND', message: 'Property could not be found.' },
      });
    }

    // Increment view count if public
    property.viewsCount = (property.viewsCount || 0) + 1;

    // Attach owner details
    const owner = db.owners.get(property.ownerId);

    // Check if user has saved this property
    let isSaved = false;
    if (req.user?.role === 'USER') {
      isSaved = Array.from(db.savedProperties.values()).some(
        (sp) => sp.userId === req.user!.id && sp.propertyId === property.id
      );
    }

    return res.json({
      success: true,
      property: {
        ...property,
        ownerName: owner?.name || 'Verified Room Owner',
        ownerPhone: owner?.phone || '+91 98200 12345',
        ownerRating: owner?.rating || 4.8,
        ownerTotalListings: owner?.totalListings || 1,
        isSaved,
      },
    });
  });

  // User Report Property
  app.post('/api/properties/:id/reports', authenticateToken, requireRole(['USER']), (req, res) => {
    const { id } = req.params;
    const { reason, description } = req.body;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' },
      });
    }

    const report: any = {
      id: 'rep_' + crypto.randomUUID().slice(0, 8),
      propertyId: id,
      propertyName: property.propertyName,
      reporterUserId: req.user!.id,
      reporterName: req.user!.name,
      reporterPhone: req.user!.phone,
      reason: reason || 'MISLEADING_INFO',
      description: description || 'Reported by user for review',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.reports.set(report.id, report);
    db.logAudit(req.user!.id, req.user!.name, 'USER', 'REPORT_PROPERTY', 'PROPERTY', id, `Reported property: ${reason}`);

    // Notify admins
    const adminUser = Array.from(db.admins.values())[0]?.user;
    if (adminUser) {
      db.createNotification(
        adminUser.id,
        'ADMIN',
        'PROPERTY_REPORTED',
        'Property Reported by User',
        `Property "${property.propertyName}" was reported for ${reason}.`,
        report.id,
        'REPORT'
      );
    }

    return res.json({
      success: true,
      message: 'Report submitted successfully. Our safety team will review it.',
      report,
    });
  });

  // ============================================================
  // 4. ROOM OWNER PROPERTY MANAGEMENT
  // ============================================================

  // Get Owner's Properties
  app.get('/api/owner/properties', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const ownerId = req.user!.id;
    const ownerProperties = Array.from(db.properties.values()).filter((p) => p.ownerId === ownerId);

    // Enrich with inquiry count
    const enriched = ownerProperties.map((p) => ({
      ...p,
      inquiriesCount: Array.from(db.inquiries.values()).filter((i) => i.propertyId === p.id).length,
      visitsCount: Array.from(db.visits.values()).filter((v) => v.propertyId === p.id).length,
    }));

    return res.json({ success: true, properties: enriched });
  });

  // Owner Dashboard KPI Metrics
  app.get('/api/owner/dashboard', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const ownerId = req.user!.id;
    const properties = Array.from(db.properties.values()).filter((p) => p.ownerId === ownerId);
    const inquiries = Array.from(db.inquiries.values()).filter((i) => i.ownerId === ownerId);
    const visits = Array.from(db.visits.values()).filter((v) => v.ownerId === ownerId);

    const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const activeCount = properties.filter((p) => p.listingStatus === 'ACTIVE').length;
    const pendingCount = properties.filter((p) => p.listingStatus === 'PENDING_REVIEW').length;
    const scheduledVisits = visits.filter((v) => v.status === 'ACCEPTED' || v.status === 'REQUESTED').length;

    return res.json({
      success: true,
      stats: {
        totalProperties: properties.length,
        activeProperties: activeCount,
        pendingProperties: pendingCount,
        totalViews,
        totalInquiries: inquiries.length,
        scheduledVisits,
      },
      recentInquiries: inquiries.slice(0, 5),
      upcomingVisits: visits.filter((v) => v.status === 'ACCEPTED').slice(0, 5),
    });
  });

  // Create Property Listing (Owner)
  app.post('/api/owner/properties', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const ownerId = req.user!.id;
    const {
      propertyName,
      propertyType,
      roomType,
      description,
      monthlyRent,
      securityDeposit,
      maintenanceCharge,
      area,
      bedrooms,
      bathrooms,
      furnishingStatus,
      tenantTypes,
      amenities,
      address,
      locality,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      googlePlaceId,
      formattedAddress,
      availableFrom,
      images,
      submitForReview,
    } = req.body;

    // Strict Validations
    if (!propertyName || !monthlyRent || !latitude || !longitude || !address || !locality) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROPERTY_DATA',
          message: 'Property name, rent, location, and Google Maps coordinates are required.',
        },
      });
    }

    const propId = 'prop_' + crypto.randomUUID().slice(0, 8);
    const status = submitForReview ? 'PENDING_REVIEW' : 'DRAFT';

    const newProperty: Property = {
      id: propId,
      ownerId,
      propertyName: propertyName.trim(),
      propertyType: propertyType || 'APARTMENT',
      roomType: roomType || '1BHK',
      description: description || 'Spacious room in excellent neighborhood with direct owner contact.',
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit || monthlyRent * 2),
      maintenanceCharge: Number(maintenanceCharge || 0),
      area: Number(area || 500),
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      furnishingStatus: furnishingStatus || 'SEMI_FURNISHED',
      tenantTypes: tenantTypes || ['ANY'],
      amenities: amenities || ['WIFI', 'PARKING', 'SECURITY'],
      address: address.trim(),
      locality: locality.trim(),
      city: city?.trim() || 'Pune',
      state: state?.trim() || 'Maharashtra',
      country: country || 'India',
      postalCode: postalCode?.trim() || '411057',
      latitude: Number(latitude),
      longitude: Number(longitude),
      googlePlaceId: googlePlaceId || undefined,
      formattedAddress: formattedAddress || `${address}, ${locality}, ${city || 'Pune'}`,
      availabilityStatus: 'AVAILABLE',
      availableFrom: availableFrom || new Date().toISOString().split('T')[0],
      listingStatus: status,
      viewsCount: 0,
      images: Array.isArray(images) && images.length > 0 ? images : [
        {
          id: 'img_' + crypto.randomUUID().slice(0, 6),
          propertyId: propId,
          storageKey: 'default_room.jpg',
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
          sortOrder: 0,
          isCover: true,
          createdAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.properties.set(newProperty.id, newProperty);

    // Update owner total listings
    const owner = db.owners.get(ownerId);
    if (owner) {
      owner.totalListings = (owner.totalListings || 0) + 1;
    }

    db.logAudit(
      ownerId,
      req.user!.name,
      'ROOM_OWNER',
      submitForReview ? 'SUBMIT_PROPERTY' : 'CREATE_PROPERTY_DRAFT',
      'PROPERTY',
      newProperty.id,
      `Created property "${newProperty.propertyName}" in ${newProperty.locality} (Status: ${status})`
    );

    if (submitForReview) {
      // Notify Admin
      const adminUser = Array.from(db.admins.values())[0]?.user;
      if (adminUser) {
        db.createNotification(
          adminUser.id,
          'ADMIN',
          'SYSTEM_ALERT',
          'New Listing Awaiting Approval',
          `"${newProperty.propertyName}" by ${req.user!.name} is ready for review.`,
          newProperty.id,
          'PROPERTY'
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: submitForReview
        ? 'Property submitted for Admin Review! It will go live once verified.'
        : 'Property saved as draft.',
      property: newProperty,
    });
  });

  // Submit Draft / Resubmit Rejected Property for Review
  app.post('/api/owner/properties/:id/submit', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const { id } = req.params;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    if (property.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You can only submit your own properties' } });
    }

    property.listingStatus = 'PENDING_REVIEW';
    property.rejectionReason = undefined;
    property.updatedAt = new Date().toISOString();

    db.logAudit(req.user!.id, req.user!.name, 'ROOM_OWNER', 'SUBMIT_FOR_REVIEW', 'PROPERTY', id, 'Submitted for Admin Review');

    // Notify Admin
    const adminUser = Array.from(db.admins.values())[0]?.user;
    if (adminUser) {
      db.createNotification(
        adminUser.id,
        'ADMIN',
        'SYSTEM_ALERT',
        'Listing Submitted for Review',
        `"${property.propertyName}" by ${req.user!.name} has been submitted for approval.`,
        property.id,
        'PROPERTY'
      );
    }

    return res.json({
      success: true,
      message: 'Property submitted for Admin Review!',
      property,
    });
  });

  // Update Property (Owner)
  app.put('/api/owner/properties/:id', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const { id } = req.params;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    if (property.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not own this property' } });
    }

    // If active property details are modified substantially, it can re-enter review
    const allowedUpdates = [
      'propertyName',
      'propertyType',
      'roomType',
      'description',
      'monthlyRent',
      'securityDeposit',
      'maintenanceCharge',
      'area',
      'bedrooms',
      'bathrooms',
      'furnishingStatus',
      'tenantTypes',
      'amenities',
      'address',
      'locality',
      'city',
      'state',
      'postalCode',
      'latitude',
      'longitude',
      'formattedAddress',
      'availableFrom',
      'availabilityStatus',
      'images',
    ];

    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        (property as any)[key] = req.body[key];
      }
    });

    property.updatedAt = new Date().toISOString();

    db.logAudit(req.user!.id, req.user!.name, 'ROOM_OWNER', 'UPDATE_PROPERTY', 'PROPERTY', id, 'Updated property details');

    return res.json({ success: true, message: 'Property updated successfully', property });
  });

  // Toggle Property Availability / Pause (Owner)
  app.patch('/api/owner/properties/:id/status', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const { id } = req.params;
    const { availabilityStatus, listingStatus } = req.body;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    if (property.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } });
    }

    if (availabilityStatus) property.availabilityStatus = availabilityStatus;
    if (listingStatus && ['ACTIVE', 'PAUSED', 'RENTED', 'ARCHIVED'].includes(listingStatus)) {
      property.listingStatus = listingStatus;
    }
    property.updatedAt = new Date().toISOString();

    return res.json({ success: true, property });
  });

  // ============================================================
  // 5. INQUIRIES & CONTACT DIRECTLY (NO BROKERAGE)
  // ============================================================

  // Get Inquiries (User gets their own, Owner gets for their properties)
  app.get('/api/inquiries', authenticateToken, (req, res) => {
    const { id, role } = req.user!;
    let list: any[] = [];

    if (role === 'USER') {
      list = Array.from(db.inquiries.values()).filter((i) => i.userId === id);
    } else if (role === 'ROOM_OWNER') {
      list = Array.from(db.inquiries.values()).filter((i) => i.ownerId === id);
    } else if (role === 'ADMIN') {
      list = Array.from(db.inquiries.values());
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, inquiries: list });
  });

  // User sends Inquiry to Owner
  app.post('/api/inquiries', authenticateToken, requireRole(['USER']), (req, res) => {
    const { propertyId, message, moveInDate, tenantProfile } = req.body;

    if (!propertyId || !message) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Property ID and message are required.' },
      });
    }

    const property = db.properties.get(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
    }

    if (property.listingStatus !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: { code: 'PROPERTY_NOT_ACTIVE', message: 'This property is not currently accepting inquiries.' },
      });
    }

    const inquiry: any = {
      id: 'inq_' + crypto.randomUUID().slice(0, 8),
      userId: req.user!.id,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      ownerId: property.ownerId,
      propertyId: property.id,
      propertyName: property.propertyName,
      propertyAddress: property.address + ', ' + property.locality,
      propertyCoverImage: property.images[0]?.thumbnailUrl || property.images[0]?.url,
      propertyRent: property.monthlyRent,
      message: message.trim(),
      moveInDate: moveInDate || undefined,
      tenantProfile: tenantProfile?.trim() || undefined,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.inquiries.set(inquiry.id, inquiry);

    // Asynchronously notify owner
    db.createNotification(
      property.ownerId,
      'ROOM_OWNER',
      'NEW_INQUIRY',
      'New Direct Inquiry',
      `${req.user!.name} sent an inquiry for "${property.propertyName}".`,
      inquiry.id,
      'INQUIRY'
    );

    db.logAudit(req.user!.id, req.user!.name, 'USER', 'SEND_INQUIRY', 'PROPERTY', property.id, `Sent direct inquiry to owner`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent directly to the owner! You will receive updates here.',
      inquiry,
    });
  });

  // Owner responds to inquiry
  app.post('/api/inquiries/:id/respond', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const { id } = req.params;
    const { responseText, status } = req.body;
    const inquiry = db.inquiries.get(id);

    if (!inquiry) {
      return res.status(404).json({ success: false, error: { code: 'INQUIRY_NOT_FOUND', message: 'Inquiry not found' } });
    }

    if (inquiry.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } });
    }

    inquiry.ownerResponse = responseText;
    inquiry.status = status || 'RESPONDED';
    inquiry.updatedAt = new Date().toISOString();

    // Notify User
    db.createNotification(
      inquiry.userId,
      'USER',
      'INQUIRY_RESPONSE',
      'Owner Responded to Your Inquiry',
      `Owner responded: "${responseText?.slice(0, 80)}..."`,
      inquiry.id,
      'INQUIRY'
    );

    return res.json({ success: true, inquiry });
  });

  // ============================================================
  // 6. VISIT SCHEDULING & MANAGEMENT
  // ============================================================

  // Get Visits
  app.get('/api/visits', authenticateToken, (req, res) => {
    const { id, role } = req.user!;
    let list: any[] = [];

    if (role === 'USER') {
      list = Array.from(db.visits.values()).filter((v) => v.userId === id);
    } else if (role === 'ROOM_OWNER') {
      list = Array.from(db.visits.values()).filter((v) => v.ownerId === id);
    } else if (role === 'ADMIN') {
      list = Array.from(db.visits.values());
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json({ success: true, visits: list });
  });

  // User Requests Property Visit
  app.post('/api/visits', authenticateToken, requireRole(['USER']), (req, res) => {
    const { propertyId, visitDate, visitTimeSlot, note } = req.body;

    if (!propertyId || !visitDate || !visitTimeSlot) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Property ID, visit date, and time slot are required.' },
      });
    }

    const property = db.properties.get(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
    }

    const owner = db.owners.get(property.ownerId);

    const visit: any = {
      id: 'vis_' + crypto.randomUUID().slice(0, 8),
      userId: req.user!.id,
      userName: req.user!.name,
      userPhone: req.user!.phone,
      ownerId: property.ownerId,
      ownerName: owner?.name || 'Verified Owner',
      ownerPhone: owner?.phone || '+91 98200 12345',
      propertyId: property.id,
      propertyName: property.propertyName,
      propertyAddress: property.address + ', ' + property.locality,
      propertyCoverImage: property.images[0]?.thumbnailUrl || property.images[0]?.url,
      visitDate,
      visitTimeSlot,
      note: note?.trim() || undefined,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.visits.set(visit.id, visit);

    // Notify Owner
    db.createNotification(
      property.ownerId,
      'ROOM_OWNER',
      'VISIT_REQUESTED',
      'New Property Visit Request',
      `${req.user!.name} requested a visit for "${property.propertyName}" on ${visitDate} at ${visitTimeSlot}.`,
      visit.id,
      'VISIT'
    );

    db.logAudit(req.user!.id, req.user!.name, 'USER', 'REQUEST_VISIT', 'PROPERTY', property.id, `Requested visit for ${visitDate}`);

    return res.status(201).json({
      success: true,
      message: 'Visit requested! The owner will confirm the schedule.',
      visit,
    });
  });

  // Owner Updates Visit Status (Accept, Reject, Reschedule)
  app.patch('/api/visits/:id/status', authenticateToken, requireRole(['ROOM_OWNER']), (req, res) => {
    const { id } = req.params;
    const { status, ownerRemarks, newVisitDate, newVisitTimeSlot } = req.body;
    const visit = db.visits.get(id);

    if (!visit) {
      return res.status(404).json({ success: false, error: { code: 'VISIT_NOT_FOUND', message: 'Visit request not found.' } });
    }

    if (visit.ownerId !== req.user!.id) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized' } });
    }

    visit.status = status;
    if (ownerRemarks) visit.ownerRemarks = ownerRemarks;
    if (newVisitDate) visit.visitDate = newVisitDate;
    if (newVisitTimeSlot) visit.visitTimeSlot = newVisitTimeSlot;
    visit.updatedAt = new Date().toISOString();

    const notifType = status === 'ACCEPTED' ? 'VISIT_ACCEPTED' : status === 'REJECTED' ? 'VISIT_REJECTED' : 'VISIT_RESCHEDULED';
    const notifMsg = status === 'ACCEPTED'
      ? `Your visit for ${visit.propertyName} is confirmed for ${visit.visitDate} (${visit.visitTimeSlot}).`
      : status === 'REJECTED'
      ? `Owner could not accommodate visit request: ${ownerRemarks || 'Slot unavailable'}.`
      : `Visit rescheduled to ${visit.visitDate} (${visit.visitTimeSlot}).`;

    db.createNotification(visit.userId, 'USER', notifType, 'Property Visit Update', notifMsg, visit.id, 'VISIT');

    return res.json({ success: true, visit });
  });

  // ============================================================
  // 7. SAVED PROPERTIES (WISHLIST)
  // ============================================================

  // Get Saved Properties
  app.get('/api/saved-properties', authenticateToken, requireRole(['USER']), (req, res) => {
    const userId = req.user!.id;
    const userSaved = Array.from(db.savedProperties.values()).filter((sp) => sp.userId === userId);

    const fullProperties = userSaved
      .map((sp) => {
        const prop = db.properties.get(sp.propertyId);
        if (!prop) return null;
        const owner = db.owners.get(prop.ownerId);
        return {
          ...prop,
          savedAt: sp.createdAt,
          ownerName: owner?.name || 'Verified Owner',
          ownerPhone: owner?.phone || '+91 98200 12345',
        };
      })
      .filter(Boolean);

    return res.json({ success: true, savedProperties: fullProperties });
  });

  // Toggle Save Property
  app.post('/api/saved-properties/toggle', authenticateToken, requireRole(['USER']), (req, res) => {
    const userId = req.user!.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_PROPERTY_ID', message: 'Property ID is required' } });
    }

    const existingKey = Array.from(db.savedProperties.values()).find(
      (sp) => sp.userId === userId && sp.propertyId === propertyId
    );

    if (existingKey) {
      db.savedProperties.delete(existingKey.id);
      return res.json({ success: true, isSaved: false, message: 'Property removed from saved list' });
    } else {
      const newSaved = {
        id: 'sav_' + crypto.randomUUID().slice(0, 8),
        userId,
        propertyId,
        createdAt: new Date().toISOString(),
      };
      db.savedProperties.set(newSaved.id, newSaved);
      return res.json({ success: true, isSaved: true, message: 'Property added to saved list' });
    }
  });

  // ============================================================
  // 8. NOTIFICATIONS
  // ============================================================

  app.get('/api/notifications', authenticateToken, (req, res) => {
    const { id } = req.user!;
    const notifs = Array.from(db.notifications.values())
      .filter((n) => n.recipientId === id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifs.filter((n) => !n.isRead).length;

    return res.json({ success: true, notifications: notifs, unreadCount });
  });

  app.patch('/api/notifications/mark-read', authenticateToken, (req, res) => {
    const { id } = req.user!;
    const { notificationId } = req.body;

    if (notificationId) {
      const notif = db.notifications.get(notificationId);
      if (notif && notif.recipientId === id) {
        notif.isRead = true;
      }
    } else {
      // Mark all as read
      Array.from(db.notifications.values())
        .filter((n) => n.recipientId === id)
        .forEach((n) => (n.isRead = true));
    }

    return res.json({ success: true, message: 'Notifications marked as read' });
  });

  // ============================================================
  // 9. OBJECT STORAGE & IMAGE UPLOADS
  // ============================================================

  app.post('/api/uploads', authenticateToken, requireRole(['ROOM_OWNER', 'ADMIN']), (req, res) => {
    const { dataUrl, filename } = req.body;

    // Simulate reliable object storage upload with instant thumbnail generation
    const key = `prop_img_${Date.now()}_${crypto.randomUUID().slice(0, 6)}.jpg`;
    const mockStorageUrl = dataUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80';

    return res.json({
      success: true,
      image: {
        id: 'img_' + crypto.randomUUID().slice(0, 8),
        storageKey: key,
        url: mockStorageUrl,
        thumbnailUrl: mockStorageUrl,
        sortOrder: 0,
        isCover: false,
        createdAt: new Date().toISOString(),
      },
    });
  });

  // ============================================================
  // 10. ADMIN BACKEND & APPROVAL WORKFLOW
  // ============================================================

  // Admin Dashboard Metrics
  app.get('/api/admin/dashboard', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const allProps = Array.from(db.properties.values());
    const allUsers = Array.from(db.users.values());
    const allOwners = Array.from(db.owners.values());
    const allInquiries = Array.from(db.inquiries.values());
    const allVisits = Array.from(db.visits.values());
    const allReports = Array.from(db.reports.values());

    const pendingReviewCount = allProps.filter((p) => p.listingStatus === 'PENDING_REVIEW').length;
    const activeCount = allProps.filter((p) => p.listingStatus === 'ACTIVE').length;
    const rejectedCount = allProps.filter((p) => p.listingStatus === 'REJECTED').length;
    const pendingReportsCount = allReports.filter((r) => r.status === 'PENDING').length;

    return res.json({
      success: true,
      metrics: {
        totalProperties: allProps.length,
        activeProperties: activeCount,
        pendingReviewProperties: pendingReviewCount,
        rejectedProperties: rejectedCount,
        totalUsers: allUsers.length,
        totalOwners: allOwners.length,
        totalInquiries: allInquiries.length,
        totalVisits: allVisits.length,
        pendingReports: pendingReportsCount,
      },
      pendingQueue: allProps.filter((p) => p.listingStatus === 'PENDING_REVIEW'),
      recentReports: allReports.slice(0, 5),
      recentAuditLogs: db.auditLogs.slice(0, 8),
    });
  });

  // Admin: Pending Listings Queue
  app.get('/api/admin/properties/pending', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const pendingList = Array.from(db.properties.values())
      .filter((p) => p.listingStatus === 'PENDING_REVIEW')
      .map((p) => {
        const owner = db.owners.get(p.ownerId);
        return {
          ...p,
          ownerName: owner?.name || 'Owner',
          ownerPhone: owner?.phone || '',
          ownerEmail: owner?.email || '',
          ownerRating: owner?.rating || 4.8,
          ownerTotalListings: owner?.totalListings || 1,
        };
      });

    return res.json({ success: true, pendingProperties: pendingList });
  });

  // Admin: Approve Property
  app.post('/api/admin/properties/:id/approve', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    property.listingStatus = 'ACTIVE';
    property.rejectionReason = undefined;
    property.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.id,
      req.user!.name,
      'ADMIN',
      'APPROVE_PROPERTY',
      'PROPERTY',
      property.id,
      `Approved property "${property.propertyName}" in ${property.locality}, ${property.city}`
    );

    // Notify Owner
    db.createNotification(
      property.ownerId,
      'ROOM_OWNER',
      'PROPERTY_APPROVED',
      'Property Approved & Live!',
      `Congratulations! "${property.propertyName}" has been approved and is now live and searchable on RoomSetu.`,
      property.id,
      'PROPERTY'
    );

    return res.json({
      success: true,
      message: 'Property approved successfully! It is now ACTIVE and live in search.',
      property,
    });
  });

  // Admin: Reject Property
  app.post('/api/admin/properties/:id/reject', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_REASON', message: 'A rejection reason is mandatory for auditing and owner notification.' },
      });
    }

    const property = db.properties.get(id);
    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    property.listingStatus = 'REJECTED';
    property.rejectionReason = reason.trim();
    property.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.id,
      req.user!.name,
      'ADMIN',
      'REJECT_PROPERTY',
      'PROPERTY',
      property.id,
      `Rejected property. Reason: ${reason}`
    );

    // Notify Owner
    db.createNotification(
      property.ownerId,
      'ROOM_OWNER',
      'PROPERTY_REJECTED',
      'Property Needs Changes',
      `Your listing "${property.propertyName}" was rejected: ${reason}. Please edit and resubmit.`,
      property.id,
      'PROPERTY'
    );

    return res.json({
      success: true,
      message: 'Property rejected. The owner has been notified with the reason.',
      property,
    });
  });

  // Admin: All Properties List with Search & Status Control
  app.get('/api/admin/properties', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const status = req.query.status as string;
    let list = Array.from(db.properties.values());

    if (status && status !== 'ALL') {
      list = list.filter((p) => p.listingStatus === status);
    }

    const enriched = list.map((p) => {
      const owner = db.owners.get(p.ownerId);
      return {
        ...p,
        ownerName: owner?.name || 'Owner',
        ownerPhone: owner?.phone || '',
      };
    });

    return res.json({ success: true, properties: enriched });
  });

  // Admin: Suspend or Archive Property
  app.patch('/api/admin/properties/:id/status', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const { listingStatus, reason } = req.body;
    const property = db.properties.get(id);

    if (!property) {
      return res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found' } });
    }

    property.listingStatus = listingStatus;
    if (reason) property.rejectionReason = reason;
    property.updatedAt = new Date().toISOString();

    db.logAudit(
      req.user!.id,
      req.user!.name,
      'ADMIN',
      `SET_STATUS_${listingStatus}`,
      'PROPERTY',
      id,
      `Admin changed property status to ${listingStatus}`
    );

    return res.json({ success: true, property });
  });

  // Admin: User Management
  app.get('/api/admin/users', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const usersList = Array.from(db.users.values()).map((u) => ({
      ...u,
      savedCount: Array.from(db.savedProperties.values()).filter((sp) => sp.userId === u.id).length,
      inquiriesCount: Array.from(db.inquiries.values()).filter((i) => i.userId === u.id).length,
    }));
    return res.json({ success: true, users: usersList });
  });

  // Admin: Owner Management
  app.get('/api/admin/owners', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const ownersList = Array.from(db.owners.values()).map((o) => ({
      ...o,
      propertiesCount: Array.from(db.properties.values()).filter((p) => p.ownerId === o.id).length,
      activeCount: Array.from(db.properties.values()).filter((p) => p.ownerId === o.id && p.listingStatus === 'ACTIVE').length,
    }));
    return res.json({ success: true, owners: ownersList });
  });

  // Admin: Suspend / Activate User or Owner
  app.patch('/api/admin/accounts/:type/:id/status', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const { type, id } = req.params;
    const { status } = req.body;

    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Status must be ACTIVE or SUSPENDED' } });
    }

    if (type === 'user') {
      const u = db.users.get(id);
      if (!u) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
      u.status = status;
      db.logAudit(req.user!.id, req.user!.name, 'ADMIN', `ACCOUNT_${status}`, 'USER', id, `Changed user status to ${status}`);
      return res.json({ success: true, user: u });
    } else if (type === 'owner') {
      const o = db.owners.get(id);
      if (!o) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Owner not found' } });
      o.status = status;
      db.logAudit(req.user!.id, req.user!.name, 'ADMIN', `ACCOUNT_${status}`, 'ROOM_OWNER', id, `Changed room owner status to ${status}`);
      return res.json({ success: true, owner: o });
    }

    return res.status(400).json({ success: false, error: { code: 'INVALID_TYPE', message: 'Type must be user or owner' } });
  });

  // Admin: Reports Moderation
  app.get('/api/admin/reports', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const reportsList = Array.from(db.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return res.json({ success: true, reports: reportsList });
  });

  app.patch('/api/admin/reports/:id', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;
    const report = db.reports.get(id);

    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'REPORT_NOT_FOUND', message: 'Report not found' } });
    }

    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    report.updatedAt = new Date().toISOString();

    db.logAudit(req.user!.id, req.user!.name, 'ADMIN', 'MODERATE_REPORT', 'REPORT', id, `Report status changed to ${status}`);

    return res.json({ success: true, report });
  });

  // Admin: Audit Logs
  app.get('/api/admin/audit-logs', authenticateToken, requireRole(['ADMIN']), (req, res) => {
    return res.json({ success: true, logs: db.auditLogs });
  });

  // ============================================================
  // 11. VITE MIDDLEWARE & STATIC SERVING
  // ============================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`============================================================`);
    console.log(`  ROOMSETU Full-Stack Engine running on port ${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/health`);
    console.log(`  Database Initialized with 6 Properties (Wakad, Pune & Metros)`);
    console.log(`============================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
});

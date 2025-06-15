// MediServe Hub - Placeholder Backend Server (Conceptual & Enhanced)
// This file outlines a more detailed conceptual structure for the backend.
// It does NOT represent a fully functional server but serves as a guide.
// A real backend would use a framework like Express.js (or Next.js API Routes/Route Handlers),
// connect to a database (e.g., PostgreSQL using schema.sql),
// implement robust authentication, error handling, real-time communication, and all necessary API endpoints.

console.log("MediServe Hub - Enhanced Conceptual Backend Server Guide");

/*
--- Conceptual Backend Structure (e.g., using Express.js + WebSocket for real-time) ---

const express = require('express');
const http = require('http'); // For WebSocket server
const WebSocket = require('ws'); // For WebSocket communication
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg'); // Or your chosen DB client/ORM (e.g., Prisma, TypeORM)
// const { nanoid } = require('nanoid'); // For generating unique IDs if not using DB's UUID

const app = express();
const server = http.createServer(app); // Create HTTP server for Express and WebSocket
const wss = new WebSocket.Server({ server }); // Attach WebSocket server

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-replace-this'; // IMPORTANT: Use a strong, environment-specific secret

// --- Database Connection (Conceptual) ---
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL, // e.g., postgresql://user:password@host:port/database
//   // ssl: { rejectUnauthorized: false } // If using SSL with DBaaS
// });
// console.log("Conceptual: Attempting to connect to database...");
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Conceptual: Database connection error', err.stack);
//   } else {
//     console.log('Conceptual: Database connected successfully at', res.rows[0].now);
//   }
// });

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:9002' })); // Adjust for your frontend URL
app.use(helmet());
app.use(express.json({ limit: '5mb' })); // For parsing JSON, increase limit for image data URIs
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// --- Authentication Middleware (Conceptual) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (token == null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Add user payload (id, role) to request object
    next();
  });
};

const authorizeRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
};

// --- WebSocket Connection Handling (Conceptual for Chat & Signaling) ---
// Store connected clients (highly simplified, in prod use Redis or similar for scalability)
// const clients = new Map(); // Map<userId, WebSocketConnection>
// const chatRooms = new Map(); // Map<roomId, Set<WebSocketConnection>>

// wss.on('connection', (ws, req) => {
//   // Conceptual: Authenticate WebSocket connection (e.g., via token in query param or initial message)
//   // const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
//   // let userId;
//   // try {
//   //   const decoded = jwt.verify(token, JWT_SECRET);
//   //   userId = decoded.id;
//   //   clients.set(userId, ws);
//   //   console.log(`Conceptual WS: Client ${userId} connected.`);
//   // } catch (err) {
//   //   console.error("Conceptual WS: Auth failed.", err.message);
//   //   ws.close(1008, "Authentication failed");
//   //   return;
//   // }

//   ws.on('message', async (message) => {
//     try {
//       const parsedMessage = JSON.parse(message);
//       console.log(`Conceptual WS: Received message from ${userId}:`, parsedMessage);

//       switch (parsedMessage.type) {
//         case 'JOIN_CHAT_ROOM':
//           // const { roomId } = parsedMessage.payload;
//           // if (!chatRooms.has(roomId)) chatRooms.set(roomId, new Set());
//           // chatRooms.get(roomId).add(ws);
//           // DB: Record user joined room if needed
//           // ws.send(JSON.stringify({ type: 'CHAT_ROOM_JOINED', payload: { roomId } }));
//           break;

//         case 'SEND_CHAT_MESSAGE':
//           // const { roomId: targetRoomId, content, contentType } = parsedMessage.payload;
//           // DB: Save message to chat_messages table (sender_id: userId, room_id: targetRoomId, message_text: content, content_type: contentType)
//           // const savedMessage = { id: nanoid(), room_id: targetRoomId, sender_id: userId, message_text: content, content_type: contentType, created_at: new Date() };
//           // // Broadcast to all clients in the room
//           // if (chatRooms.has(targetRoomId)) {
//           //   chatRooms.get(targetRoomId).forEach(client => {
//           //     if (client.readyState === WebSocket.OPEN) {
//           //       client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', payload: savedMessage }));
//           //     }
//           //   });
//           // }
//           break;

//         case 'WEBRTC_SIGNAL': // For video/audio call signaling
//           // const { targetUserId, signalData } = parsedMessage.payload;
//           // const targetClient = clients.get(targetUserId);
//           // if (targetClient && targetClient.readyState === WebSocket.OPEN) {
//           //   targetClient.send(JSON.stringify({ type: 'WEBRTC_SIGNAL', payload: { senderId: userId, signalData } }));
//           //   // DB: Could log signaling attempts or session status in consultation_sessions table
//           // } else {
//           //   console.log(`Conceptual WS: Target user ${targetUserId} not found or not connected for WebRTC signal.`);
//           // }
//           break;

//         // Handle other message types: 'LEAVE_CHAT_ROOM', 'TYPING_INDICATOR', etc.
//       }
//     } catch (e) {
//       console.error('Conceptual WS: Failed to process message or invalid JSON', e);
//       ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid message format' }));
//     }
//   });

//   ws.on('close', () => {
//     console.log(`Conceptual WS: Client ${userId} disconnected.`);
//     // clients.delete(userId);
//     // // Remove from all chat rooms
//     // chatRooms.forEach((roomClients, roomId) => {
//     //   if (roomClients.has(ws)) {
//     //     roomClients.delete(ws);
//     //     if (roomClients.size === 0) {
//     //       chatRooms.delete(roomId);
//     //     }
//     //     // Optionally notify other room members
//     //   }
//     // });
//   });

//   ws.on('error', (error) => {
//     console.error(`Conceptual WS: Error for client ${userId}:`, error);
//   });
// });


// --- API Routes ---

// == User Authentication & Management ==
// POST /api/auth/register
//   Req: { fullName, email, password, phone, roleName ('patient', 'doctor', 'seeker') }
//   Res (201): { message, token, user: { id, fullName, email, roleName } }
//   Logic: Validate, check existing, hash pass, INSERT users & user_profiles, get role_id, generate JWT.
app.post('/api/auth/register', async (req, res) => {
  // const { fullName, email, password, phone, roleName } = req.body;
  // // Validation (e.g., using a library like Joi or Zod on backend)
  // if (!fullName || !email || !password || !roleName) return res.status(400).json({ error: 'Missing required fields.' });
  // try {
  //   // const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  //   // if (roleResult.rows.length === 0) return res.status(400).json({ error: 'Invalid role specified.' });
  //   // const roleId = roleResult.rows[0].id;
  //   // const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  //   // if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Email already in use.' });
  //   // const salt = await bcrypt.genSalt(10);
  //   // const passwordHash = await bcrypt.hash(password, salt);
  //   // const client = await pool.connect();
  //   // try {
  //   //   await client.query('BEGIN');
  //   //   const userInsertResult = await client.query(
  //   //     'INSERT INTO users (email, password_hash, role_id, is_active, is_verified) VALUES ($1, $2, $3, TRUE, FALSE) RETURNING id',
  //   //     [email, passwordHash, roleId]
  //   //   );
  //   //   const userId = userInsertResult.rows[0].id;
  //   //   await client.query(
  //   //     'INSERT INTO user_profiles (user_id, full_name, phone_number) VALUES ($1, $2, $3)',
  //   //     [userId, fullName, phone]
  //   //   );
  //   //   await client.query('COMMIT');
  //   //   const token = jwt.sign({ id: userId, role: roleName }, JWT_SECRET, { expiresIn: '24h' });
  //   //   res.status(201).json({ message: 'User registered successfully.', token, user: { id: userId, fullName, email, roleName } });
  //   // } catch (dbError) {
  //   //   await client.query('ROLLBACK');
  //   //   console.error('DB Error during registration:', dbError);
  //   //   res.status(500).json({ error: 'Database error during registration.' });
  //   // } finally {
  //   //   client.release();
  //   // }
  // } catch (err) {
  //   console.error('Registration error:', err);
  //   res.status(500).json({ error: 'Server error during registration.' });
  // }
  res.status(501).json({ message: 'Conceptual: Register endpoint hit. Not implemented yet.' });
});

// POST /api/auth/login
//   Req: { email, password }
//   Res (200): { message, token, user: { id, fullName, email, roleName, profileImageUrl, preferredLanguage, themePreference } }
//   Logic: Find user, verify pass, generate JWT.
app.post('/api/auth/login', async (req, res) => {
  // const { email, password } = req.body;
  // if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  // try {
  //   // const userResult = await pool.query(
  //   //   'SELECT u.id, u.email, u.password_hash, r.name as role_name, p.full_name, p.profile_image_url, p.preferred_language, p.theme_preference FROM users u JOIN roles r ON u.role_id = r.id JOIN user_profiles p ON u.id = p.user_id WHERE u.email = $1 AND u.is_active = TRUE',
  //   //   [email]
  //   // );
  //   // if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials or user not active.' });
  //   // const user = userResult.rows[0];
  //   // const isMatch = await bcrypt.compare(password, user.password_hash);
  //   // if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
  //   // const token = jwt.sign({ id: user.id, role: user.role_name }, JWT_SECRET, { expiresIn: '24h' });
  //   // await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
  //   // res.json({
  //   //   message: 'Login successful.',
  //   //   token,
  //   //   user: { id: user.id, fullName: user.full_name, email: user.email, roleName: user.role_name, profileImageUrl: user.profile_image_url, preferredLanguage: user.preferred_language, themePreference: user.theme_preference },
  //   // });
  // } catch (err) {
  //   console.error('Login error:', err);
  //   res.status(500).json({ error: 'Server error during login.' });
  // }
  res.status(501).json({ message: 'Conceptual: Login endpoint hit. Not implemented yet.' });
});

// POST /api/auth/admin/login - Similar to user login, but checks for admin role explicitly.
app.post('/api/auth/admin/login', async (req, res) => {
  // ... logic similar to /api/auth/login, but ensures user.role_name === 'admin'
  res.status(501).json({ message: 'Conceptual: Admin login hit. Not implemented yet.' });
});


// GET /api/users/me (Requires Auth)
//   Res: { user: { id, fullName, email, phone, roleName, dob, address, city, country, bio, profileImageUrl, preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone, ... } }
app.get('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // try {
  //   // const profileResult = await pool.query(
  //   //   'SELECT u.email, u.role_id, r.name as role_name, p.* FROM users u JOIN user_profiles p ON u.id = p.user_id JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
  //   //   [userId]
  //   // );
  //   // if (profileResult.rows.length === 0) return res.status(404).json({ error: 'User profile not found.' });
  //   // const userProfile = profileResult.rows[0];
  //   // // Map DB columns to desired response structure
  //   // const responseUser = {
  //   //   id: userId,
  //   //   fullName: userProfile.full_name,
  //   //   email: userProfile.email,
  //   //   phone: userProfile.phone_number,
  //   //   roleName: userProfile.role_name,
  //   //   dob: userProfile.date_of_birth,
  //   //   address: userProfile.address,
  //   //   city: userProfile.city,
  //   //   country: userProfile.country,
  //   //   bio: userProfile.bio,
  //   //   profileImageUrl: userProfile.profile_image_url,
  //   //   preferredLanguage: userProfile.preferred_language,
  //   //   themePreference: userProfile.theme_preference,
  //   //   emergencyContactName: userProfile.emergency_contact_name,
  //   //   emergencyContactPhone: userProfile.emergency_contact_phone,
  //   //   enableMarketingEmails: userProfile.enable_marketing_emails,
  //   //   enableAppNotifications: userProfile.enable_app_notifications,
  //   //   // Add other fields from user_profiles as needed
  //   // };
  //   // res.json({ user: responseUser });
  // } catch (err) {
  //   console.error('Get my profile error:', err);
  //   res.status(500).json({ error: 'Server error fetching profile.' });
  // }
  res.status(501).json({ message: 'Conceptual: GET /api/users/me hit. Not implemented yet.' });
});

// PUT /api/users/me (Requires Auth)
//   Req: { fullName, phone, dob, address, city, country, bio, profileImageUrl, preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone, newPassword, currentPassword, etc. }
app.put('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // const { fullName, phone, dob, address, city, country, bio, profileImageUrl, preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone, newPassword, currentPassword, enableMarketingEmails, enableAppNotifications } = req.body;
  // try {
  //   // // Update user_profiles table
  //   // await pool.query(
  //   //  'UPDATE user_profiles SET full_name = $1, phone_number = $2, date_of_birth = $3, address = $4, city = $5, country = $6, bio = $7, profile_image_url = $8, preferred_language = $9, theme_preference = $10, emergency_contact_name = $11, emergency_contact_phone = $12, enable_marketing_emails = $13, enable_app_notifications = $14, updated_at = CURRENT_TIMESTAMP WHERE user_id = $15',
  //   //  [fullName, phone, dob || null, address, city, country, bio, profileImageUrl, preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone, enableMarketingEmails, enableAppNotifications, userId]
  //   // );
  //   // Handle password change if newPassword and currentPassword are provided
  //   // if (newPassword && currentPassword) {
  //   //   // const userResult = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  //   //   // if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found for password change.' });
  //   //   // const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
  //   //   // if (!isMatch) return res.status(401).json({ error: 'Incorrect current password.' });
  //   //   // const salt = await bcrypt.genSalt(10);
  //   //   // const newPasswordHash = await bcrypt.hash(newPassword, salt);
  //   //   // await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newPasswordHash, userId]);
  //   // }
  //   // const updatedProfile = await pool.query('SELECT p.*, u.email, r.name as role_name FROM user_profiles p JOIN users u ON p.user_id = u.id JOIN roles r ON u.role_id = r.id WHERE p.user_id = $1', [userId]);
  //   // res.json({ message: 'Profile updated successfully.', user: updatedProfile.rows[0] });
  // } catch (err) {
  //   console.error('Update profile error:', err);
  //   res.status(500).json({ error: 'Server error updating profile.' });
  // }
  res.status(501).json({ message: 'Conceptual: PUT /api/users/me hit. Not implemented yet.' });
});


// == Medicines & Inventory ==
// GET /api/medicines?search=term&category_kn=Igabanya%20Ububabare
app.get('/api/medicines', async (req, res) => {
  // const { search, category_kn } = req.query;
  // // Build SQL query dynamically
  // res.status(501).json({ message: 'Conceptual: GET /api/medicines hit. Not implemented yet.' });
});

// POST /api/admin/medicines (Admin only)
//   Req: { name_en, name_kn, description_en, description_kn, category_id, unit_price, image_url, requires_prescription, stock_level, expiry_date, supplier_info }
app.post('/api/admin/medicines', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // // DB: START TRANSACTION;
  // // DB: INSERT INTO medicines (...) RETURNING id;
  // // DB: INSERT INTO inventory (medicine_id, stock_level, expiry_date, supplier_info) VALUES (...);
  // // DB: COMMIT;
  res.status(501).json({ message: 'Conceptual: Admin create medicine hit. Not implemented yet.' });
});
// PUT /api/admin/medicines/:id (Admin only)
// DELETE /api/admin/medicines/:id (Admin only)

// == Medical Services (Tests, Consultations) ==
// GET /api/medical-services
app.get('/api/medical-services', async (req, res) => {
  // // DB: SELECT * FROM medical_services WHERE is_active = TRUE;
  res.status(501).json({ message: 'Conceptual: GET /api/medical-services hit. Not implemented yet.' });
});
// POST /api/admin/medical-services (Admin only)
// PUT /api/admin/medical-services/:id (Admin only)
// DELETE /api/admin/medical-services/:id (Admin only)


// == Appointments ==
// POST /api/appointments/book (Requires Auth: patient, seeker)
//   Req: { doctorId (user_id of doctor), date (YYYY-MM-DD), time (HH:MM), reason, type ('Online'/'In-Person'), serviceId? }
app.post('/api/appointments/book', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // const patientId = req.user.id;
  // // DB: Check doctor availability (e.g. no conflicting appointments)
  // // DB: INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, type, status, service_id) VALUES (...);
  res.status(501).json({ message: 'Conceptual: Book appointment hit. Not implemented yet.' });
});

// GET /api/appointments/my (Requires Auth)
//   Logic: If user is patient/seeker, get their appointments. If doctor, get appointments assigned to them.
app.get('/api/appointments/my', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // const userRole = req.user.role; // 'patient', 'doctor', etc.
  // // DB: Fetch appointments based on role
  res.status(501).json({ message: 'Conceptual: Get my appointments hit. Not implemented yet.' });
});

// PUT /api/appointments/:appointmentId/status (Requires Auth: patient, doctor, admin)
//   Req: { status: 'Confirmed' | 'Cancelled' | 'Completed' }
//   Logic: Check permissions (patient can cancel pending, doctor can confirm/complete/cancel, admin can do all)
app.put('/api/appointments/:appointmentId/status', authenticateToken, async (req, res) => {
  // // DB: UPDATE appointments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2;
  res.status(501).json({ message: 'Conceptual: Update appointment status hit. Not implemented yet.' });
});


// == Prescriptions ==
// POST /api/prescriptions (Requires Auth: doctor)
//   Req: { patientId, appointmentId?, medicines: [{ medicineId, dosage, frequency, duration, instructions }], notes }
app.post('/api/prescriptions', authenticateToken, authorizeRole(['doctor']), async (req, res) => {
  // const doctorId = req.user.id;
  // // DB: START TRANSACTION;
  // // DB: INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, date_prescribed, notes) VALUES (...) RETURNING id;
  // // For each medicine: INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, instructions) VALUES (...);
  // // DB: COMMIT;
  res.status(501).json({ message: 'Conceptual: Create prescription hit. Not implemented yet.' });
});

// GET /api/prescriptions/my (Requires Auth: patient)
app.get('/api/prescriptions/my', authenticateToken, authorizeRole(['patient']), async (req, res) => {
  // const patientId = req.user.id;
  // // DB: SELECT p.*, d_prof.full_name as doctor_name, ... JOIN prescription_items ... JOIN medicines ... WHERE p.patient_id = $1;
  res.status(501).json({ message: 'Conceptual: Get my prescriptions hit. Not implemented yet.' });
});


// == Community Support (Forums, Groups) ==
// GET /api/forums/posts?category_kn=Pain%20Management&search=term
// GET /api/forums/posts/:postId
// POST /api/forums/posts (Auth required)
// POST /api/forums/posts/:postId/comments (Auth required)
// POST /api/forums/posts/:postId/like (Auth required)
// GET /api/support-groups?category_kn=...&search=...
// GET /api/support-groups/:groupId
// POST /api/support-groups (Auth required, user becomes admin)
// POST /api/support-groups/:groupId/join (Auth required) -> status 'pending_approval' if private
// POST /api/support-groups/:groupId/posts (Auth required, member only)
// POST /api/support-groups/:groupId/posts/:postId/like (Auth required, member only)
// GET /api/support-groups/:groupId/members (Admin/Moderator of group)
// PUT /api/support-groups/:groupId/members/:userId/status (Admin/Moderator, for approving/banning)


// == E-commerce (Cart, Orders, Payments) ==
// GET /api/cart (Requires Auth: patient, seeker)
// POST /api/cart/items (Requires Auth: patient, seeker) - Req: { medicineId, quantity }
// PUT /api/cart/items/:medicineId (Requires Auth: patient, seeker) - Req: { quantity }
// DELETE /api/cart/items/:medicineId (Requires Auth: patient, seeker)
// POST /api/orders (Requires Auth: patient, seeker) - Moves cart to an order, status 'Pending'
// GET /api/orders/my (Requires Auth: patient, seeker)
// POST /api/payments/initiate (Requires Auth: patient, seeker)
//   Req: { orderId?, amount, paymentMethod, reason, paymentMethodDetails (e.g., card token, phone number) }
//   Logic: Interact with payment gateway (Stripe, MoMo API), create payment record.
// POST /api/payments/webhook (Public, but secured with webhook signature)
//   Logic: Payment gateway sends updates here (e.g., payment success/failure). Update order and payment status.


// == AI Endpoints (Called from Backend, Genkit flows remain in frontend for now or moved to backend) ==
// If Genkit flows are moved to backend:
// POST /api/ai/analyze-symptoms (Auth optional/required based on policy)
//   Req: { symptomsDescription, imageDataUri? }
//   Logic: Call Genkit flow: analyzeSymptoms(req.body)
// POST /api/ai/medical-faq
// POST /api/ai/test-yourself


// == Online Consultation Signaling (Conceptual for WebRTC) ==
// POST /api/consultations/initiate (Auth: doctor)
//   Req: { appointmentId }
//   Res: { consultationSessionId, signalingServerUrl (if separate) }
//   Logic: Create consultation_sessions record.
// app.post('/api/consultations/initiate', authenticateToken, authorizeRole(['doctor']), async (req, res) => {
//   // const doctorId = req.user.id;
//   // const { appointmentId } = req.body;
//   // // DB: Create entry in consultation_sessions table, status 'initiated'.
//   // const sessionId = nanoid(); // Or DB generated UUID
//   // // DB: INSERT INTO consultation_sessions (id, appointment_id, doctor_id, patient_id, session_status) VALUES ...
//   // res.json({ consultationSessionId: sessionId, message: 'Consultation initiated, waiting for patient.' });
//   res.status(501).json({ message: 'Conceptual: Initiate consultation hit. Not implemented yet.' });
// });

// POST /api/consultations/:sessionId/join (Auth: patient)
//   Logic: Patient attempts to join the session.
// app.post('/api/consultations/:sessionId/join', authenticateToken, authorizeRole(['patient']), async (req, res) => {
//   // const patientId = req.user.id;
//   // const { sessionId } = req.params;
//   // // DB: Verify session exists and patient matches. Update status to 'pending_sdp_exchange' or similar.
//   // // Notify doctor via WebSocket that patient has joined and is ready for signaling.
//   // res.json({ message: 'Joined consultation session, awaiting signaling.' });
//   res.status(501).json({ message: 'Conceptual: Join consultation hit. Not implemented yet.' });
// });

// POST /api/consultations/:sessionId/signal (Auth: doctor, patient)
//   Req: { type: 'offer' | 'answer' | 'candidate', data: sdpOrCandidate }
//   Logic: Relay SDP offers/answers and ICE candidates between doctor and patient via WebSockets.
//   This endpoint might be replaced entirely by direct WebSocket messaging after initial handshake.
//   DB: Update sdp/ice_candidates in consultation_sessions table if needed for reconnects/logging.
// app.post('/api/consultations/:sessionId/signal', authenticateToken, async (req, res) => {
//   // const userId = req.user.id;
//   // const { sessionId } = req.params;
//   // const { type, data, targetUserId } = req.body; // targetUserId is the other participant
//   // // Forward signal to targetUserId via WebSocket (clients.get(targetUserId).send(...))
//   // // This endpoint itself might just acknowledge receipt if WS is primary signaling channel
//   // console.log(`Conceptual: Signal received for session ${sessionId} from ${userId}: type ${type}`);
//   // res.sendStatus(200);
//   res.status(501).json({ message: 'Conceptual: Consultation signal relay hit. Not implemented yet.' });
// });

// PUT /api/consultations/:sessionId/end (Auth: doctor or patient)
//   Logic: Mark session as 'ended'. Notify other participant via WebSocket.
// app.put('/api/consultations/:sessionId/end', authenticateToken, async (req, res) => {
//   // // DB: Update consultation_sessions status to 'ended'.
//   // // Notify other participant via WebSocket.
//   res.status(501).json({ message: 'Conceptual: End consultation hit. Not implemented yet.' });
// });

// --- Chat History API ---
// GET /api/chat/rooms/:roomId/messages (Auth required)
//  Params: roomId
//  Query: limit, before (timestamp for pagination)
//  Res: { messages: [ChatMessage] }
// app.get('/api/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
//   // const { roomId } = req.params;
//   // const userId = req.user.id;
//   // // DB: Check if user is part of this room (chat_room_participants)
//   // // DB: SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3 (implement pagination)
//   res.status(501).json({ message: 'Conceptual: Get chat messages hit. Not implemented yet.' });
// });


// --- Admin Specific Endpoints (More detail) ---
// GET /api/admin/dashboard-summary (Admin only)
//  Res: { totalUsers, totalOrders, totalRevenue, activeConsultations }
// GET /api/admin/users (Admin only, with pagination, search, filter)
// GET /api/admin/users/:userId (Admin only)
// PUT /api/admin/users/:userId (Admin only)
// DELETE /api/admin/users/:userId (Admin only)
// GET /api/admin/settings (Admin only)
// PUT /api/admin/settings (Admin only) - Req: { appName, defaultLanguage, maintenanceMode, paymentGatewayKeys, etc. }

// --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err);
//   // Consider more specific error handling based on err.name or err.status
//   res.status(err.status || 500).json({ error: err.message || 'Something broke!' });
// });

// --- Server Initialization ---
// server.listen(PORT, () => { // Use 'server.listen' instead of 'app.listen' for WebSockets
//   console.log(`MediServe Hub backend server (conceptual) would run on http://localhost:${PORT}`);
//   console.log(`MediServe Hub WebSocket server (conceptual) would be available on ws://localhost:${PORT}`);
// });

*/
```
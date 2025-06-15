// MediServe Hub - Conceptual Backend Server (Express.js & WebSocket Example)
// Version: 3.0 - Robust Conceptualization for Full-Stack Features
// This file outlines a highly detailed conceptual structure for the backend.
// It does NOT represent a fully functional server but serves as an in-depth guide
// for building a full-stack application using the defined schema.sql.

console.log("MediServe Hub - Robust Conceptual Backend Server Guide v3.0");

/*
--- Core Technologies (Conceptual Stack) ---
- Node.js: JavaScript runtime environment.
- Express.js: Web framework for Node.js (for REST APIs).
- PostgreSQL: Relational database (schema defined in `schema.sql`).
- `pg` (node-postgres): PostgreSQL client for Node.js (or an ORM like Prisma/Sequelize).
- `bcryptjs`: For hashing passwords securely (e.g., bcrypt.hash(password, 12)).
- `jsonwebtoken` (JWT): For authentication tokens (HS256 or RS256).
- `ws`: WebSocket library for Node.js (for real-time chat and WebRTC signaling).
- `cors`, `helmet`, `morgan`: Essential Express middleware.
- `dotenv`: For managing environment variables.
- Validation library (e.g., Zod, Joi): For validating request payloads and parameters.
- `nanoid` or `uuid`: For generating unique IDs.
- File Upload Handling: `multer` for multipart/form-data (e.g., profile pictures, symptom images).
- Storage Service Client: AWS S3 SDK, Firebase Storage SDK, or Cloudinary SDK for storing uploaded files.
- Notification Service: Firebase Cloud Messaging (FCM) or similar for push notifications.
- Email Service: Nodemailer with an SMTP provider (e.g., SendGrid, Mailgun) for verification, password reset, and notification emails.
- Payment Gateway SDK: Stripe SDK, PayPal SDK, or local Rwandan payment gateway SDKs (e.g., MoMo API wrappers).
- Potentially a message queue (e.g., RabbitMQ, Kafka) for asynchronous tasks (notifications, report generation).
- Potentially Redis for caching, session management, or as a WebSocket message broker in a scaled setup.

--- Server Initialization (Conceptual) ---
// require('dotenv').config(); // Load environment variables

// const express = require('express');
// const http = require('http');
// const WebSocket = require('ws');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { Pool } = require('pg');
// const { nanoid } = require('nanoid');
// const multer = require('multer');
// const path = require('path'); // For file path operations if storing locally temporarily

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server }); // WebSocket server shares the HTTP server

// const PORT = process.env.PORT || 3001;
// const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-and-unique-jwt-secret-key-in-env-for-hs256';
// // For RS256, use private and public keys from environment variables.
// const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mediserve_user:mediserve_pass@localhost:5432/mediserve_db';
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9002';
// const FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || 'uploads/'; // For temporary local storage before cloud

// // --- Database Connection (Conceptual) ---
// const pool = new Pool({ connectionString: DATABASE_URL });
// pool.connect()
//   .then(() => console.log('Conceptual: Database connected successfully.'))
//   .catch(err => console.error('Conceptual: Database connection error:', err.stack));

// // Example DB Query Function
// async function queryDB(sql, params = []) {
//   const client = await pool.connect();
//   try {
//     // console.log('Executing SQL:', sql, 'Params:', params); // For debugging
//     const result = await client.query(sql, params);
//     return result;
//   } catch (error) {
//     console.error('DB Query Error:', error.message, 'SQL:', sql, 'Params:', params);
//     throw error; // Re-throw to be caught by endpoint handlers
//   } finally {
//     client.release();
//   }
// }

// // --- Middleware ---
// app.use(cors({ origin: FRONTEND_URL, credentials: true }));
// app.use(helmet({ contentSecurityPolicy: false })); // Adjust CSP as needed
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(morgan('dev'));
// app.use('/uploads', express.static(path.join(__dirname, FILE_UPLOAD_PATH))); // Serve uploaded files if stored locally (for dev/prototype)

// // --- File Upload Configuration (Multer for temporary local storage) ---
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, FILE_UPLOAD_PATH),
//   filename: (req, file, cb) => cb(null, `${nanoid()}-${Date.now()}${path.extname(file.originalname)}`)
// });
// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true);
//   } else {
//     cb(new Error('Not an image! Please upload only images.'), false);
//   }
// };
// const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// // --- Authentication Middleware (Conceptual) ---
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
//   if (token == null) return res.status(401).json({ error: 'Authentication token required.' });

//   jwt.verify(token, JWT_SECRET, (err, userPayload) => {
//     if (err) {
//       console.error("JWT Verification Error:", err.message);
//       if (err.name === 'TokenExpiredError') return res.status(403).json({ error: 'Token expired.' });
//       return res.status(403).json({ error: 'Invalid token.' });
//     }
//     // userPayload should contain { id: userId, role: userRole, email: userEmail }
//     req.user = userPayload; // Attach user payload to request object
//     next();
//   });
// };

// // --- Authorization Middleware (Conceptual) ---
// const authorizeRole = (allowedRolesArray) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       return res.status(403).json({ error: 'Access denied. User role not determined.' });
//     }
//     if (!allowedRolesArray.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
//     }
//     next();
//   };
// };

// --- WebSocket Server Logic (Conceptual & More Robust) ---
// const connectedClients = new Map(); // Map<userId, WebSocketConnection>
// const chatRooms = new Map();       // Map<roomId, Set<WebSocketConnection>> (roomId = consultation_id or support_group_id)
// const callSessions = new Map();    // Map<callSessionId, { participants: Map<userId, WebSocketConnection>, sdpOffers: Map, etc. }>

// wss.on('connection', (ws, req) => {
//   let userId, userRole, userName; // To be populated after WS authentication

//   // Conceptual: Authenticate WebSocket connection using a token passed in the query string
//   // const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
//   // if (!token) {
//   //   ws.close(1008, "Authentication token missing.");
//   //   return;
//   // }
//   // try {
//   //   const decoded = jwt.verify(token, JWT_SECRET);
//   //   userId = decoded.id;
//   //   userRole = decoded.role;
//   //   // const profile = await queryDB('SELECT full_name FROM user_profiles WHERE user_id = $1', [userId]);
//   //   // userName = profile.rows[0]?.full_name || `User ${userId}`;
//   //   ws.userId = userId;
//   //   ws.userRole = userRole;
//   //   ws.userName = userName;
//   //   connectedClients.set(userId, ws);
//   //   console.log(`Conceptual WS: Client ${userId} (${userName}, Role: ${userRole}) connected.`);
//   //   ws.send(JSON.stringify({ type: 'WS_CONNECTION_SUCCESS', payload: { message: 'WebSocket connected and authenticated.' } }));
//   // } catch (err) {
//   //   console.error("Conceptual WS: Auth failed for WebSocket connection.", err.message);
//   //   ws.close(1008, "Authentication failed. Invalid token.");
//   //   return;
//   // }

//   ws.on('message', async (message) => {
//     // if (!userId) { /* Already handled by initial auth */ return; }
//     // try {
//     //   const parsedMessage = JSON.parse(message.toString());
//     //   console.log(`Conceptual WS: Received from ${userId} (${userName}):`, parsedMessage);

//     //   switch (parsedMessage.type) {
//     //     case 'JOIN_CHAT_ROOM': {
//     //       const { roomId, roomType /* 'consultation' or 'support_group' */ } = parsedMessage.payload;
//     //       // DB: Verify user has permission to join this room (e.g., appointment participant or group member)
//     //       // let canJoin = false;
//     //       // if (roomType === 'consultation') {
//     //       //   const appointment = await queryDB('SELECT doctor_id, patient_id FROM appointments WHERE id = $1 AND status = $2', [roomId, 'Confirmed']);
//     //       //   if (appointment.rows[0] && (appointment.rows[0].doctor_id === userId || appointment.rows[0].patient_id === userId)) canJoin = true;
//     //       // } else if (roomType === 'support_group') {
//     //       //   const membership = await queryDB('SELECT user_id FROM group_memberships WHERE group_id = $1 AND user_id = $2 AND status = $3', [roomId, userId, 'approved']);
//     //       //   if (membership.rows[0]) canJoin = true;
//     //       // }
//     //       // if (!canJoin) {
//     //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: `Not authorized to join room ${roomId}.` }));
//     //       //   break;
//     //       // }

//     //       if (!chatRooms.has(roomId)) chatRooms.set(roomId, new Set());
//     //       chatRooms.get(roomId).add(ws);
//     //       ws.currentRoomId = roomId;
//     //       ws.currentRoomType = roomType;

//     //       // Fetch recent message history
//     //       // const historyResult = await queryDB(
//     //       //   `SELECT cm.id, cm.sender_id, up.full_name as sender_name, cm.content_type, cm.message_text, cm.sent_at
//     //       //    FROM chat_messages cm JOIN user_profiles up ON cm.sender_id = up.user_id
//     //       //    WHERE cm.room_id = $1 ORDER BY cm.sent_at DESC LIMIT 20`, [roomId]
//     //       // );
//     //       // const messageHistory = historyResult.rows.reverse(); // To display in correct order on client

//     //       // ws.send(JSON.stringify({ type: 'CHAT_ROOM_JOINED', payload: { roomId, history: messageHistory } }));
//     //       // console.log(`Conceptual WS: User ${userId} (${userName}) joined chat room ${roomId}`);

//     //       // Broadcast to other room members
//     //       // chatRooms.get(roomId).forEach(client => {
//     //       //   if (client !== ws && client.readyState === WebSocket.OPEN) {
//     //       //     client.send(JSON.stringify({ type: 'USER_JOINED_CHAT', payload: { roomId, userId, userName } }));
//     //       //   }
//     //       // });
//     //       break;
//     //     }
//     //     case 'LEAVE_CHAT_ROOM': { /* ... Similar to before, robust cleanup ... */ break; }
//     //     case 'SEND_CHAT_MESSAGE': {
//     //       const { roomId, content, contentType = 'text' } = parsedMessage.payload;
//     //       // if (ws.currentRoomId !== roomId || !chatRooms.has(roomId) || !chatRooms.get(roomId).has(ws)) {
//     //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not in a valid room to send message or room mismatch.' }));
//     //       //   break;
//     //       // }
//     //       // const messageData = {
//     //       //   id: nanoid(), // Or DB generated UUID
//     //       //   room_id: roomId,
//     //       //   sender_id: userId,
//     //       //   sender_name: userName, // Fetched during WS auth
//     //       //   content_type: contentType,
//     //       //   message_text: content, // Sanitize this content before saving/broadcasting
//     //       //   sent_at: new Date().toISOString()
//     //       // };
//     //       // // DB: INSERT INTO chat_messages (id, room_id, sender_id, content_type, message_text, sent_at) VALUES ($1, $2, $3, $4, $5, $6)
//     //       // // await queryDB('INSERT INTO chat_messages (id, room_id, sender_id, content_type, message_text, sent_at) VALUES ($1, $2, $3, $4, $5, $6)',
//     //       // //   [messageData.id, messageData.room_id, messageData.sender_id, messageData.content_type, messageData.message_text, messageData.sent_at]);

//     //       // // Broadcast to all clients in the room
//     //       // chatRooms.get(roomId).forEach(client => {
//     //       //   if (client.readyState === WebSocket.OPEN) {
//     //       //     client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', payload: messageData }));
//     //       //   }
//     //       // });
//     //       break;
//     //     }

//     //     // --- WebRTC Signaling for Video/Audio Calls ---
//     //     case 'WEBRTC_JOIN_CALL_SESSION': { // User wants to join/start a call for an appointment
//     //       const { appointmentId } = parsedMessage.payload;
//     //       // // DB: Fetch appointment to get participants (doctor_id, patient_id) and status
//     //       // const appointmentResult = await queryDB('SELECT id, doctor_id, patient_id, status FROM appointments WHERE id = $1', [appointmentId]);
//     //       // if (appointmentResult.rows.length === 0) {
//     //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Appointment not found.'})); break;
//     //       // }
//     //       // const appointment = appointmentResult.rows[0];
//     //       // if (appointment.status !== 'Confirmed') {
//     //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: `Call cannot be started. Appointment status: ${appointment.status}`})); break;
//     //       // }
//     //       // if (userId !== appointment.doctor_id && userId !== appointment.patient_id) {
//     //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not authorized for this call.'})); break;
//     //       // }

//     //       const callSessionId = `call-${appointmentId}`; // Unique session ID
//     //       ws.currentCallSessionId = callSessionId;

//     //       if (!callSessions.has(callSessionId)) {
//     //         callSessions.set(callSessionId, { participants: new Map(), appointmentDetails: appointment });
//     //       }
//     //       const session = callSessions.get(callSessionId);
//     //       session.participants.set(userId, ws);

//     //       const otherParticipantId = userId === appointment.doctor_id ? appointment.patient_id : appointment.doctor_id;

//     //       if (session.participants.size === 1) { // First participant (caller)
//     //         // console.log(`Conceptual WS: User ${userId} (${userName}) initiated call in session ${callSessionId}`);
//     //         // ws.send(JSON.stringify({ type: 'WEBRTC_CALL_WAITING_PEER', payload: { callSessionId, waitingFor: otherParticipantId } }));
//     //       } else if (session.participants.size === 2) { // Second participant (callee) joins
//     //         const otherParticipantWs = session.participants.get(otherParticipantId);
//     //         if (otherParticipantWs && otherParticipantWs.readyState === WebSocket.OPEN) {
//     //           // Notify first user that second has joined, so first user can send offer
//     //           // otherParticipantWs.send(JSON.stringify({ type: 'WEBRTC_PEER_JOINED', payload: { callSessionId, peerId: userId, peerName: userName } }));
//     //           // ws.send(JSON.stringify({ type: 'WEBRTC_PEER_AVAILABLE', payload: { callSessionId, peerId: otherParticipantId, peerName: otherParticipantWs.userName } }));
//     //           // console.log(`Conceptual WS: User ${userId} (${userName}) joined call with ${otherParticipantId} (${otherParticipantWs.userName}) in session ${callSessionId}`);
//     //         }
//     //       }
//     //       // DB: Optionally log call initiation in `consultation_sessions`
//     //       // await queryDB('INSERT INTO consultation_sessions (appointment_id, status, started_at) VALUES ($1, $2, NOW()) ON CONFLICT (appointment_id) DO UPDATE SET status = $2, started_at = NOW()',
//     //       //                [appointmentId, 'initiated']);
//     //       break;
//     //     }
//     //     case 'WEBRTC_SIGNAL': { // Generic signaling message (offer, answer, iceCandidate)
//     //       const { callSessionId, targetUserId, signalType, data } = parsedMessage.payload;
//     //       const session = callSessions.get(callSessionId);
//     //       if (session && session.participants.has(targetUserId) && session.participants.has(userId)) {
//     //         const targetWs = session.participants.get(targetUserId);
//     //         if (targetWs && targetWs.readyState === WebSocket.OPEN) {
//     //           // targetWs.send(JSON.stringify({ type: 'WEBRTC_SIGNAL', payload: { callSessionId, senderId: userId, senderName: userName, signalType, data } }));
//     //           // console.log(`Conceptual WS: Relayed ${signalType} from ${userId} to ${targetUserId} in ${callSessionId}`);
//     //         } else { /* console.log(`Conceptual WS: Target ${targetUserId} not connected or session invalid for signal.`); */ }
//     //       }
//     //       break;
//     //     }
//     //     case 'WEBRTC_CALL_END': {
//     //       const { callSessionId } = parsedMessage.payload;
//     //       if (ws.currentCallSessionId === callSessionId && callSessions.has(callSessionId)) {
//     //         const session = callSessions.get(callSessionId);
//     //         // Notify other participant(s)
//     //         session.participants.forEach((peerWs, peerId) => {
//     //           if (peerId !== userId && peerWs.readyState === WebSocket.OPEN) {
//     //             // peerWs.send(JSON.stringify({ type: 'WEBRTC_PEER_LEFT', payload: { callSessionId, peerId: userId, peerName: userName }}));
//     //           }
//     //         });
//     //         session.participants.delete(userId);
//     //         if (session.participants.size === 0) { callSessions.delete(callSessionId); } // Clean up empty call session
//     //         delete ws.currentCallSessionId;
//     //         // ws.send(JSON.stringify({ type: 'WEBRTC_CALL_ENDED_CONFIRMED', payload: { callSessionId } }));
//     //         // console.log(`Conceptual WS: User ${userId} (${userName}) ended/left call session ${callSessionId}`);
//     //         // DB: Update consultation_sessions.status to 'completed' or 'ended', set duration.
//     //         // await queryDB('UPDATE consultation_sessions SET status = $1, ended_at = NOW() WHERE appointment_id = (SELECT appointment_id FROM call_sessions WHERE id = $2) AND status = $3',
//     //         //                 ['completed', callSessionId.split('-')[1], 'initiated']); // Example logic
//     //       }
//     //       break;
//     //     }
//     //     default:
//     //       // ws.send(JSON.stringify({ type: 'ERROR', payload: 'Unknown message type received.' }));
//     //       break;
//     //   }
//     // } catch (e) {
//     //   console.error('Conceptual WS: Failed to process message or invalid JSON', e, message.toString());
//     //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid message format or server error.' }));
//     // }
//   });

//   ws.on('close', (code, reason) => {
//     // console.log(`Conceptual WS: Client ${userId || 'Unknown'} disconnected. Code: ${code}, Reason: ${reason.toString()}`);
//     // if (userId) connectedClients.delete(userId);

//     // // Gracefully leave current chat room
//     // if (ws.currentRoomId && chatRooms.has(ws.currentRoomId)) {
//     //   const room = chatRooms.get(ws.currentRoomId);
//     //   room.delete(ws);
//     //   if (room.size === 0) chatRooms.delete(ws.currentRoomId);
//     //   // room.forEach(client => { // Notify others in chat room
//     //   //   if (client.readyState === WebSocket.OPEN) {
//     //   //     client.send(JSON.stringify({ type: 'USER_LEFT_CHAT', payload: { roomId: ws.currentRoomId, userId, userName } }));
//     //   //   }
//     //   // });
//     // }
//     // // Gracefully leave current call session
//     // if (ws.currentCallSessionId && callSessions.has(ws.currentCallSessionId)) {
//     //   const session = callSessions.get(ws.currentCallSessionId);
//     //   session.participants.delete(userId);
//     //   // session.participants.forEach((peerWs, peerId) => { // Notify others in call
//     //   //   if (peerWs.readyState === WebSocket.OPEN) {
//     //   //     peerWs.send(JSON.stringify({ type: 'WEBRTC_PEER_LEFT', payload: { callSessionId: ws.currentCallSessionId, peerId: userId, peerName: userName }}));
//     //   //   }
//     //   // });
//     //   if (session.participants.size === 0) callSessions.delete(ws.currentCallSessionId);
//     // }
//   });
//   ws.on('error', (error) => { /* console.error(`Conceptual WS Error for ${userId}:`, error); */ });
// });


// --- API Endpoints (Conceptual & More Robust) ---

// == User Authentication & Management ==
// POST /api/auth/register
// app.post('/api/auth/register', async (req, res) => {
  // const { fullName, email, password, phone, roleName /* 'patient' or 'seeker' */ } = req.body;
  // // INPUT VALIDATION (Zod example):
  // // const registerSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), ... });
  // // const validationResult = registerSchema.safeParse(req.body);
  // // if (!validationResult.success) return res.status(400).json({ errors: validationResult.error.issues });

  // if (roleName === 'admin' || roleName === 'doctor') {
  //   return res.status(403).json({ error: `Registration for ${roleName} role is managed by administrators.` });
  // }

  // try {
    // // DB: Check if role exists
    // const roleResult = await queryDB('SELECT id FROM roles WHERE name = $1', [roleName]);
    // if (roleResult.rows.length === 0) return res.status(400).json({ error: 'Invalid role specified.' });
    // const roleId = roleResult.rows[0].id;

    // // DB: Check if email already exists
    // const existingUser = await queryDB('SELECT id FROM users WHERE email = $1', [email]);
    // if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });

    // const salt = await bcrypt.genSalt(12);
    // const hashedPassword = await bcrypt.hash(password, salt);
    // const verificationToken = nanoid(32); // For email verification
    // const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // // DB TRANSACTION:
    // const client = await pool.connect();
    // try {
    //   await client.query('BEGIN');
    //   const userInsertResult = await client.query(
    //     'INSERT INTO users (email, password_hash, role_id, verification_token, verification_token_expires_at, is_verified) VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING id',
    //     [email, hashedPassword, roleId, verificationToken, verificationTokenExpiresAt]
    //   );
    //   const userId = userInsertResult.rows[0].id;
    //   await client.query(
    //     'INSERT INTO user_profiles (user_id, full_name, phone_number) VALUES ($1, $2, $3)',
    //     [userId, fullName, phone || null]
    //   );
    //   await client.query('COMMIT');

      // LOGIC: Send verification email
      // sendEmail(email, 'Verify Your MediServe Hub Account', `Please verify your email by clicking: ${FRONTEND_URL}/verify-email?token=${verificationToken}`);

  //     res.status(201).json({
  //       message: 'User registered successfully. Please check your email for verification link.',
  //     });
  //   } catch (dbError) { /* Rollback, log, respond 500 */ } finally { /* client.release() */ }
  // } catch (err) { /* Log, respond 500 */ }
//   res.status(501).json({ message: 'Conceptual: Register endpoint hit. Not implemented yet.' });
// });

// POST /api/auth/verify-email
// app.post('/api/auth/verify-email', async (req, res) => {
  // const { token } = req.body;
  // // DB: Find user by verification_token, check expiry, set is_verified=TRUE, clear token.
  // res.status(501).json({ message: 'Conceptual: Verify email endpoint hit.' });
// });

// POST /api/auth/login
// app.post('/api/auth/login', async (req, res) => {
  // const { email, password, role /* Optional: client indicates intended role portal */ } = req.body;
  // try {
    // // DB: Fetch user by email with role and profile
    // const userResult = await queryDB( /* SQL to get user, role, profile */ );
    // if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
    // const user = userResult.rows[0];

    // if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated.' });
    // if (!user.is_verified && user.role_name !== 'admin') return res.status(403).json({ error: 'Account not verified. Please check your email.' }); // Admins might be pre-verified

    // if (role && role !== user.role_name && role !== 'admin_portal_attempting_non_admin_login') { // More nuanced check
    //    return res.status(401).json({ error: `This login form is not for ${user.role_name} accounts.` });
    // }

    // const isMatch = await bcrypt.compare(password, user.password_hash);
    // if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

    // const tokenPayload = { id: user.id, role: user.role_name, email: user.email };
    // const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }); // Use '1d' for days
    // const refreshToken = nanoid(64); // Generate a refresh token
    // const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // // DB: Store refresh token (hashed) and update last_login_at
    // // const hashedRefreshToken = await bcrypt.hash(refreshToken, 10); // Hash refresh token before storing
    // // await queryDB('UPDATE users SET last_login_at = CURRENT_TIMESTAMP, refresh_token_hash = $1, refresh_token_expires_at = $2 WHERE id = $3',
    // //               [hashedRefreshToken, refreshTokenExpiresAt, user.id]);

    // // res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    // res.json({
    //   message: 'Login successful.',
    //   token, // Access token
    //   user: { id: user.id, fullName: user.full_name, email: user.email, roleName: user.role_name, /* other non-sensitive profile data */ },
    // });
  // } catch (err) { /* ... */ }
//   res.status(501).json({ message: 'Conceptual: Login endpoint hit. Not implemented yet.' });
// });

// POST /api/auth/refresh-token
// app.post('/api/auth/refresh-token', async (req, res) => {
  // const clientRefreshToken = req.cookies.refreshToken; // Get refresh token from httpOnly cookie
  // if (!clientRefreshToken) return res.status(401).json({ error: 'Refresh token not found.' });
  // // DB: Find user by non-hashed refresh token (if not hashing them) or by a selector if using rotating refresh tokens.
  // // More securely: find user by ID from an expired access token (if you allow that), then compare hashed refresh tokens.
  // // For simplicity here, assume we fetch user by a stored, unhashed refresh token (NOT recommended for prod).
  // // const userResult = await queryDB('SELECT id, email, role_id, refresh_token_expires_at, is_active FROM users WHERE refresh_token = $1', [clientRefreshToken]);
  // // const user = userResult.rows[0];
  // // if (!user) return res.status(403).json({ error: 'Invalid refresh token.' });
  // // if (new Date() > new Date(user.refresh_token_expires_at)) return res.status(403).json({ error: 'Refresh token expired.' });
  // // if (!user.is_active) return res.status(403).json({ error: 'Account deactivated.' });

  // // // (Optional: Implement refresh token rotation - issue new refresh token, invalidate old one)
  // // const role = await queryDB('SELECT name FROM roles WHERE id = $1', [user.role_id]);
  // // const tokenPayload = { id: user.id, role: role.rows[0].name, email: user.email };
  // // const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  // // res.json({ token: newAccessToken });
  // res.status(501).json({ message: 'Conceptual: Refresh token endpoint.' });
// });

// POST /api/auth/logout
// app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  // // DB: Invalidate refresh token for req.user.id
  // // await queryDB('UPDATE users SET refresh_token_hash = NULL, refresh_token_expires_at = NULL WHERE id = $1', [req.user.id]);
  // // res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
  // res.json({ message: 'Logout successful.' });
// });

// POST /api/auth/request-password-reset
// app.post('/api/auth/request-password-reset', async (req, res) => {
  // const { email } = req.body;
  // // DB: Find user. Generate password_reset_token and expiry. Store them.
  // // Send email with reset link: ${FRONTEND_URL}/reset-password?token=reset_token
  // res.status(501).json({ message: 'Conceptual: Request password reset.' });
// });

// POST /api/auth/reset-password
// app.post('/api/auth/reset-password', async (req, res) => {
  // const { token, newPassword } = req.body;
  // // DB: Find user by reset_token, check expiry. Hash newPassword. Update password_hash, clear reset_token.
  // res.status(501).json({ message: 'Conceptual: Reset password.' });
// });

// GET /api/users/me (Requires Auth) - Retrieve current user's full profile
// app.get('/api/users/me', authenticateToken, async (req, res) => { /* ... */ });

// PUT /api/users/me (Requires Auth) - Update current user's profile
// app.put('/api/users/me', authenticateToken, upload.single('profileImageFile'), async (req, res) => { // Handle file upload
  // // const userId = req.user.id;
  // // const { fullName, phone, dob, ... other fields from ProfileFormValues ... } = req.body;
  // // let profileImageUrl = req.body.profileImageUrl; // Existing URL or data URI
  // // if (req.file) {
  // //   // LOGIC: Upload req.file.path to cloud storage (S3, Firebase Storage)
  // //   // profileImageUrl = 'url_from_cloud_storage';
  // //   // fs.unlinkSync(req.file.path); // Delete temporary local file
  // // } else if (profileImageUrl && !profileImageUrl.startsWith('http')) {
  // //    // It's a data URI from client image preview, upload it if not already an external URL
  // //    // Convert data URI to buffer, upload to cloud.
  // // }
  // // DB: UPDATE user_profiles SET ... WHERE user_id = $1.
  // // Return updated profile.
//   res.status(501).json({ message: 'Conceptual: Update user profile endpoint.' });
// });

// PUT /api/users/me/password (Requires Auth) - Change current user's password
// app.put('/api/users/me/password', authenticateToken, async (req, res) => { /* ... */ });


// == Admin User Management (Admin only) ==
// GET /api/admin/users?page=1&limit=10&search=term&role=patient&status=active
// app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... comprehensive query ... */ });
// POST /api/admin/users (Admin only) - Create a new user (e.g., a doctor)
// app.post('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });
// GET /api/admin/users/:userId (Admin only)
// app.get('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });
// PUT /api/admin/users/:userId (Admin only) - Update user details, role, status
// app.put('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });
// DELETE /api/admin/users/:userId (Admin only) - Soft delete or deactivate user
// app.delete('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });


// == Medicines, Inventory, Services ==
// GET /api/medicines (Public - Paginated, Searchable, Filterable by Category)
// app.get('/api/medicines', async (req, res) => {
  // const { page = 1, limit = 12, search = '', category_kn = '' } = req.query;
  // // DB: SELECT * FROM medicines WHERE (name_kn ILIKE $1 OR name_en ILIKE $1) AND (category_kn = $2 OR $2 = 'all') ...
  // // Join with medicine_inventory for stock_level.
  // res.status(501).json({ message: 'Conceptual: Get medicines endpoint.' });
// });

// GET /api/medicines/:medicineId (Public)
// app.get('/api/medicines/:medicineId', async (req, res) => { /* ... */ });

// POST /api/admin/medicines (Admin only - Create new medicine and initial inventory record)
// app.post('/api/admin/medicines', authenticateToken, authorizeRole(['admin']), upload.single('medicineImageFile'), async (req, res) => {
  // // const { name_en, name_kn, description_en, description_kn, price, category_kn, initial_stock, supplier, expiry_date } = req.body;
  // // let imageUrl = '';
  // // if (req.file) { /* Upload to cloud, get URL */ }
  // // DB TRANSACTION:
  // //   INSERT INTO medicines (...) RETURNING id;
  // //   INSERT INTO medicine_inventory (medicine_id, stock_level, supplier, expiry_date, last_updated_by_user_id) VALUES (...);
  // res.status(501).json({ message: 'Conceptual: Create medicine endpoint.' });
// });

// PUT /api/admin/medicines/:medicineId (Admin only - Update medicine details)
// app.put('/api/admin/medicines/:medicineId', authenticateToken, authorizeRole(['admin']), upload.single('medicineImageFile'), async (req, res) => { /* ... */ });

// DELETE /api/admin/medicines/:medicineId (Admin only - Soft delete medicine)
// app.delete('/api/admin/medicines/:medicineId', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });

// GET /api/admin/inventory (Admin only - View all inventory, filter by low stock)
// app.get('/api/admin/inventory', authenticateToken, authorizeRole(['admin']), async (req, res) => { /* ... */ });
// PUT /api/admin/inventory/:medicineId (Admin only - Update stock level, supplier, expiry for a medicine)
// app.put('/api/admin/inventory/:medicineId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // // const { medicineId } = req.params;
  // // const { stock_level_change, new_stock_level, supplier, expiry_date } = req.body; // Allow adjusting or setting absolute
  // // DB: UPDATE medicine_inventory SET ... WHERE medicine_id = $1. Log change in inventory_logs.
  // res.status(501).json({ message: 'Conceptual: Update inventory endpoint.' });
// });

// GET /api/medical-services (Public - List all available medical tests and consultations)
// app.get('/api/medical-services', async (req, res) => { /* ... */ });
// (Admin CRUD for medical_services: POST, PUT /:id, DELETE /:id require authorizeRole(['admin']))
// POST /api/admin/medical-services
// PUT /api/admin/medical-services/:serviceId
// DELETE /api/admin/medical-services/:serviceId

// == Appointments ==
// POST /api/appointments (Auth: patient, seeker)
// app.post('/api/appointments', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // // const { doctor_id, service_id, appointment_date, appointment_time, reason, appointment_type } = req.body;
  // // const patient_id = req.user.id;
  // // LOGIC:
  // //   1. Validate inputs (date format, future date, doctor exists, service exists).
  // //   2. Check doctor's availability from `doctor_schedules` for the given date and time.
  // //   3. Check for conflicting appointments for the doctor AND patient at that time.
  // //   4. Check service duration to calculate end time if needed.
  // // DB: INSERT INTO appointments (patient_id, doctor_id, service_id, appointment_datetime, duration_minutes, reason, appointment_type, status)
  // //     VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING *;
  // // NOTIFICATION: Send to doctor about new appointment request. Send to patient confirmation of request.
  // res.status(501).json({ message: 'Conceptual: Book appointment endpoint.' });
// });

// GET /api/appointments/my (Auth: patient, seeker, doctor)
// app.get('/api/appointments/my', authenticateToken, async (req, res) => {
  // // if (req.user.role === 'doctor') { /* Fetch for doctor_id = req.user.id */ }
  // // else { /* Fetch for patient_id = req.user.id */ }
  // res.status(501).json({ message: 'Conceptual: Get my appointments endpoint.' });
// });

// PUT /api/appointments/:appointmentId/status (Auth: patient, doctor, admin)
// app.put('/api/appointments/:appointmentId/status', authenticateToken, async (req, res) => {
  // // const { appointmentId } = req.params;
  // // const { status, reason_for_cancellation } = req.body; // status: 'Confirmed', 'Cancelled_By_Patient', etc.
  // // LOGIC:
  // //   Verify user has permission to change status (e.g., patient can cancel their own, doctor can confirm/cancel).
  // //   Validate status transition (e.g., can't complete a pending appointment).
  // // DB: UPDATE appointments SET status = $1, status_reason = $2 WHERE id = $3 AND (patient_id = $4 OR doctor_id = $4 OR 'admin' = $5_role);
  // // NOTIFICATION: Notify relevant parties about status change.
  // res.status(501).json({ message: 'Conceptual: Update appointment status endpoint.' });
// });

// GET /api/doctors/:doctorId/availability?date=YYYY-MM-DD (Public or Auth) - Fetch doctor's available slots for a date
// app.get('/api/doctors/:doctorId/availability', async (req, res) => {
  // // const { doctorId } = req.params;
  // // const { date } = req.query;
  // // DB: Query `doctor_schedules` for general availability for the day of the week of `date`.
  // // DB: Query `appointments` for already booked slots for `doctorId` on `date`.
  // // Calculate available slots.
  // res.status(501).json({ message: 'Conceptual: Get doctor availability endpoint.' });
// });


// == Prescriptions ==
// POST /api/prescriptions (Auth: doctor)
// app.post('/api/prescriptions', authenticateToken, authorizeRole(['doctor']), async (req, res) => {
  // // const { patient_id, appointment_id, medicines: [{ medicine_id, dosage, frequency, duration, instructions }], notes } = req.body;
  // // const doctor_id = req.user.id;
  // // DB TRANSACTION:
  // //   INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, date_prescribed, notes, status) VALUES (...) RETURNING id;
  // //   For each medicine: INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, instructions) VALUES (...);
  // // NOTIFICATION: Send to patient about new prescription.
  // res.status(501).json({ message: 'Conceptual: Create prescription endpoint.' });
// });

// GET /api/prescriptions/my (Auth: patient)
// app.get('/api/prescriptions/my', authenticateToken, authorizeRole(['patient']), async (req, res) => { /* ... */ });
// GET /api/prescriptions/doctor (Auth: doctor) - Prescriptions issued by this doctor
// app.get('/api/prescriptions/doctor', authenticateToken, authorizeRole(['doctor']), async (req, res) => { /* ... */ });
// GET /api/prescriptions/:prescriptionId (Auth: patient who owns it, doctor who issued, admin)
// app.get('/api/prescriptions/:prescriptionId', authenticateToken, async (req, res) => { /* ... */ });


// == Online Consultation & Chat History API ==
// (Handled by WebSocket logic primarily, but REST endpoints can support session management)
// POST /api/consultations/:appointmentId/start (Auth: doctor or patient)
// app.post('/api/consultations/:appointmentId/start', authenticateToken, async (req, res) => {
  // // const { appointmentId } = req.params;
  // // // DB: Verify appointment, update status to 'ongoing_consultation' or similar.
  // // // DB: Create/update consultation_sessions table (start_time, status).
  // // // Return a unique callSessionId or chatRoomId for WebSocket connection.
  // // const callSessionId = `call-${appointmentId}`;
  // // const chatRoomId = `chat-${appointmentId}`;
  // // res.json({ callSessionId, chatRoomId, message: 'Consultation session initiated.' });
  // res.status(501).json({ message: 'Conceptual: Start consultation session endpoint.' });
// });

// GET /api/chat/rooms/:roomId/messages (Auth: room participants)
// app.get('/api/chat/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  // // const { roomId } = req.params;
  // // const { limit = 50, before_timestamp } = req.query;
  // // // DB: Check if req.user.id is participant of roomId.
  // // // DB: Fetch messages for roomId, paginated.
  // res.status(501).json({ message: 'Conceptual: Get chat messages endpoint.' });
// });


// == Community (Forums, Groups) ==
// (Detailed CRUD operations for posts, comments, likes, groups, memberships, group posts)
// GET /api/forums/posts, GET /api/forums/posts/:postId, POST /api/forums/posts, etc.
// GET /api/support-groups, GET /api/support-groups/:groupId, POST /api/support-groups, etc.
// All POST/PUT/DELETE require authentication. Joining private groups may involve 'pending_approval' status.


// == E-commerce (Cart, Orders, Payments) ==
// GET /api/cart (Auth: patient, seeker)
// app.get('/api/cart', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // // DB: SELECT ci.*, m.name_kn, m.price, m.image_url FROM cart_items ci JOIN medicines m ON ci.medicine_id = m.id WHERE ci.user_id = $1;
  // res.status(501).json({ message: 'Conceptual: Get cart endpoint.' });
// });

// POST /api/cart/items (Auth: patient, seeker)
// app.post('/api/cart/items', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // // const { medicine_id, quantity } = req.body;
  // // // DB: Check stock_level. Add/update cart_items for req.user.id.
  // // // Handle cases: item not in cart, item in cart (update quantity), quantity > stock.
  // res.status(501).json({ message: 'Conceptual: Add to cart endpoint.' });
// });
// PUT /api/cart/items/:cartItemId (Auth: patient, seeker)
// DELETE /api/cart/items/:cartItemId (Auth: patient, seeker)

// POST /api/orders (Auth: patient, seeker)
// app.post('/api/orders', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // // const { shipping_address, billing_address, payment_intent_id, notes } = req.body; // payment_intent_id from Stripe, for example
  // // DB TRANSACTION:
  // //   1. Fetch cart items for user. Calculate total.
  // //   2. Check stock for all items.
  // //   3. INSERT into `orders` (user_id, total_amount, status='Pending_Payment' or 'Processing' if payment confirmed).
  // //   4. INSERT cart items into `order_items`.
  // //   5. DECREMENT stock_level in `medicine_inventory`.
  // //   6. DELETE from `cart_items`.
  // //   7. Potentially store shipping/billing address if not linked to user profile.
  // // NOTIFICATION: Order confirmation to patient.
  // res.status(501).json({ message: 'Conceptual: Create order endpoint.' });
// });

// GET /api/orders/my (Auth: patient, seeker)
// GET /api/orders/:orderId (Auth: owner or admin)

// POST /api/payments/create-intent (Auth: patient, seeker) - For Stripe, etc.
// app.post('/api/payments/create-intent', authenticateToken, async (req, res) => {
  // // const { orderId, amount_rwf } = req.body; // amount should be verified server-side based on orderId
  // // // LOGIC: Interact with payment gateway SDK (e.g., Stripe) to create a PaymentIntent.
  // // // const paymentIntent = await stripe.paymentIntents.create({ amount: amount_rwf, currency: 'rwf', ... });
  // // // res.json({ clientSecret: paymentIntent.client_secret });
  // res.status(501).json({ message: 'Conceptual: Create payment intent endpoint.' });
// });

// POST /api/payments/webhook (Public, but secured by webhook signature verification from payment gateway)
// app.post('/api/payments/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  // // const sig = req.headers['stripe-signature']; // Example for Stripe
  // // let event;
  // // try {
  // //   event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  // // } catch (err) { res.status(400).send(`Webhook Error: ${err.message}`); return; }
  // // // Handle the event (e.g., payment_intent.succeeded, payment_intent.payment_failed)
  // // // DB: Update order status, log payment.
  // // res.json({ received: true });
  // res.status(501).json({ message: 'Conceptual: Payment webhook endpoint.' });
// });


// == AI Endpoints (Backend calls Genkit flows, requires Auth) ==
// POST /api/ai/symptom-analyzer (Auth required)
// app.post('/api/ai/symptom-analyzer', authenticateToken, async (req, res) => {
  // // const { symptomsDescription, imageDataUri } = req.body;
  // // // Optional: Store interaction for user history or analytics
  // // // const result = await genkitFlows.analyzeSymptoms({ symptomsDescription, imageDataUri });
  // // // res.json(result);
  // res.status(501).json({ message: 'Conceptual: Symptom Analyzer AI endpoint.' });
// });
// POST /api/ai/medical-faq (Auth required)
// POST /api/ai/test-yourself (Auth required)


// == Admin Dashboard & Settings ==
// GET /api/admin/dashboard-stats (Admin only)
// app.get('/api/admin/dashboard-stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // // DB: Aggregate data (total users, new users this month, total orders, revenue, low stock items, active consultations etc.)
  // // const stats = {
  // //   totalUsers: (await queryDB('SELECT COUNT(*) FROM users')).rows[0].count,
  // //   totalOrders: (await queryDB('SELECT COUNT(*) FROM orders')).rows[0].count,
  // //   /* ... more stats ... */
  // // };
  // // res.json(stats);
  // res.status(501).json({ message: 'Conceptual: Admin dashboard stats endpoint.' });
// });
// GET /api/admin/settings (Admin only)
// PUT /api/admin/settings (Admin only)

// --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err.name, err.message, err.stack ? err.stack.substring(0, 300) : '');
//   // Handle Zod validation errors specifically
//   // if (err instanceof z.ZodError) {
//   //   return res.status(400).json({ error: 'Validation failed.', issues: err.errors });
//   // }
//   if (err.name === 'UnauthorizedError') { return res.status(401).json({ error: 'Invalid token or not authenticated.' }); }
//   if (err.code === '23505') { // PostgreSQL unique violation
//     return res.status(409).json({ error: 'A record with this value already exists.', field: err.constraint }); // Be more specific if possible
//   }
//   // Multer errors
//   // if (err instanceof multer.MulterError) {
//   //   if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large.'});
//   //   return res.status(400).json({ error: `File upload error: ${err.message}`});
//   // }
//   // if (err.message === 'Not an image! Please upload only images.') { // From custom fileFilter
//   //    return res.status(400).json({ error: err.message });
//   // }

//   res.status(err.status || 500).json({
//     error: err.message || 'An unexpected error occurred on the server.',
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack?.substring(0, 200) + "..." }),
//   });
// });

// --- Server Start ---
// server.listen(PORT, () => {
//   console.log(`MediServe Hub Conceptual Backend Server listening on http://localhost:${PORT}`);
//   console.log(`MediServe Hub Conceptual WebSocket Server available on ws://localhost:${PORT}`);
// });

/*
This enhanced conceptual server.js provides a far more detailed blueprint for
the backend architecture. It includes:
- More specific technology considerations.
- Detailed authentication flow (registration with verification, login with JWT and refresh tokens, password reset).
- Robust WebSocket handling for real-time chat and WebRTC signaling, including room management and permissions.
- Comprehensive API endpoint structures for all major features, with considerations for request/response data,
  database interactions, and business logic.
- File upload handling concepts.
- More specific error handling considerations.
- Conceptual integration points for payment gateways and AI flows.

This serves as a strong foundation for actual backend development.
*/


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
// const cors =require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const { Pool } = require('pg');
// const { nanoid } = require('nanoid'); // Or const { v4: uuidv4 } = require('uuid');
// const multer = require('multer');
// const path = require('path'); // For file path operations if storing locally temporarily
// // const z = require('zod'); // Example for input validation

// const app = express();
// const server = http.createServer(app);
// const wss = new WebSocket.Server({ server }); // WebSocket server shares the HTTP server

// const PORT = process.env.PORT || 3001;
// const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-and-unique-jwt-secret-key-in-env-for-hs256';
// // For RS256, use private and public keys from environment variables.
// const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mediserve_user:mediserve_pass@localhost:5432/mediserve_db';
// const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:9002'; // Set in .env
// const FILE_UPLOAD_PATH = process.env.FILE_UPLOAD_PATH || 'uploads/'; // For temporary local storage before cloud

// // --- Database Connection (Conceptual) ---
// const pool = new Pool({ connectionString: DATABASE_URL });
// pool.connect()
//   .then(() => console.log('Conceptual: Database connected successfully.'))
//   .catch(err => console.error('Conceptual: Database connection error:', err.stack));

// // Example DB Query Function with basic error handling
// async function queryDB(sql, params = []) {
//   const client = await pool.connect();
//   try {
//     // For debugging: console.log('Executing SQL:', sql, 'Params:', params);
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
// app.use(cors({ origin: FRONTEND_URL, credentials: true })); // Configure for your frontend URL
// app.use(helmet({ contentSecurityPolicy: false })); // Adjust CSP for your needs. false is for broad dev, tighten for prod.
// app.use(express.json({ limit: '10mb' })); // For parsing application/json, increased limit for potential image data URIs
// app.use(express.urlencoded({ extended: true, limit: '10mb' })); // For parsing application/x-www-form-urlencoded
// app.use(morgan('dev')); // HTTP request logger
// app.use('/uploads', express.static(path.join(__dirname, FILE_UPLOAD_PATH))); // Serve uploaded files if stored locally (for dev/prototype)

// // --- File Upload Configuration (Multer for temporary local storage) ---
// // Configure storage (e.g., diskStorage for local, memoryStorage for direct to cloud)
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, FILE_UPLOAD_PATH),
//   filename: (req, file, cb) => cb(null, `${nanoid()}-${Date.now()}${path.extname(file.originalname)}`)
// });
// const fileFilter = (req, file, cb) => {
//   // Accept images only
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
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//   if (token == null) {
//     console.log('Conceptual Auth: Token missing.');
//     return res.status(401).json({ error: 'Authentication token required.' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, userPayload) => {
//     if (err) {
//       console.error("Conceptual Auth: JWT Verification Error:", err.message);
//       if (err.name === 'TokenExpiredError') return res.status(403).json({ error: 'Token expired. Please log in again.' });
//       return res.status(403).json({ error: 'Invalid token.' });
//     }
//     // userPayload should contain { id: userId, role: userRole, email: userEmail }
//     req.user = userPayload; // Attach user payload to request object
//     // console.log('Conceptual Auth: Token verified for user:', req.user.id, 'Role:', req.user.role);
//     next();
//   });
// };

// // --- Authorization Middleware (Conceptual) ---
// const authorizeRole = (allowedRolesArray) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role) {
//       console.log('Conceptual Auth: Role check failed - user or role undefined.');
//       return res.status(403).json({ error: 'Access denied. User role not determined.' });
//     }
//     if (!allowedRolesArray.includes(req.user.role)) {
//       console.log(`Conceptual Auth: Role check failed - User role ${req.user.role} not in ${allowedRolesArray}`);
//       return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
//     }
//     // console.log(`Conceptual Auth: Role ${req.user.role} authorized for this route.`);
//     next();
//   };
// };


// --- WebSocket Server Logic (Conceptual & More Robust) ---
// // const connectedClients = new Map(); // Map<userId, WebSocketConnection>
// // const chatRooms = new Map();       // Map<roomId, Set<WebSocketConnection>> (roomId can be consultation_id or support_group_id)
// // const callSessions = new Map();    // Map<callSessionId, { participants: Map<userId, WebSocketConnection>, appointmentDetails: object, sdpOffers?: Map, iceCandidates?: Map }>

// // wss.on('connection', (ws, req) => {
// //   let userId, userRole, userName; // To be populated after WS authentication

//   // Conceptual: Authenticate WebSocket connection using a token passed in the query string or initial message
//   // Example using query parameter (ensure secure handling in production)
//   // const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
//   // if (!token) {
//   //   ws.close(1008, "Authentication token missing for WebSocket.");
//   //   return;
//   // }
//   // try {
//   //   const decoded = jwt.verify(token, JWT_SECRET); // Same JWT_SECRET as HTTP auth
//   //   userId = decoded.id;
//   //   userRole = decoded.role;
//       // Fetch user_profile to get full_name for userName
//   //   const profileResult = await queryDB('SELECT full_name FROM user_profiles WHERE user_id = $1', [userId]);
//   //   userName = profileResult.rows[0]?.full_name || `User_${userId}`;

//   //   ws.userId = userId; // Attach userId to WebSocket instance
//   //   ws.userRole = userRole;
//   //   ws.userName = userName;
//   //   connectedClients.set(userId, ws);
//   //   console.log(`Conceptual WS: Client ${userId} (${userName}, Role: ${userRole}) connected via WebSocket.`);
//   //   ws.send(JSON.stringify({ type: 'WS_CONNECTION_SUCCESS', payload: { message: 'WebSocket connected and authenticated.' } }));
//   // } catch (err) {
//   //   console.error("Conceptual WS: Authentication failed for WebSocket connection.", err.message);
//   //   ws.close(1008, "Authentication failed. Invalid token for WebSocket.");
//   //   return;
//   // }

// //   ws.on('message', async (message) => {
// //     if (!userId) { /* Should be handled by initial auth block */ return; }
// //     try {
// //       const parsedMessage = JSON.parse(message.toString());
// //       console.log(`Conceptual WS: Received from ${userId} (${userName}):`, parsedMessage.type, parsedMessage.payload || '');

// //       switch (parsedMessage.type) {
// //         case 'JOIN_CHAT_ROOM': {
// //           const { roomId, roomType /* 'consultation' or 'support_group' */ } = parsedMessage.payload;
// //           // Security: DB check if user is authorized to join this room
// //           let canJoin = false;
// //           if (roomType === 'consultation') {
// //             const appointment = await queryDB('SELECT id, doctor_id, patient_id FROM appointments WHERE id = $1 AND status = $2', [roomId, 'Confirmed']); // Or 'Ongoing_Consultation'
// //             if (appointment.rows[0] && (appointment.rows[0].doctor_id === userId || appointment.rows[0].patient_id === userId)) canJoin = true;
// //           } else if (roomType === 'support_group') {
// //             const membership = await queryDB('SELECT user_id FROM group_memberships WHERE group_id = $1 AND user_id = $2 AND status = $3', [roomId, userId, 'approved']);
// //             if (membership.rows[0]) canJoin = true;
// //           }
// //           if (!canJoin) {
// //             ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Not authorized to join room ${roomId}.` } }));
// //             break;
// //           }

// //           if (!chatRooms.has(roomId)) chatRooms.set(roomId, new Set());
// //           chatRooms.get(roomId).add(ws);
// //           ws.currentRoomId = roomId;
// //           ws.currentRoomType = roomType;

// //           // Fetch recent message history for the room
// //           const historyResult = await queryDB(
// //             `SELECT cm.id, cm.sender_id, up.full_name as sender_name, cm.content_type, cm.message_text, cm.sent_at
// //              FROM chat_messages cm JOIN user_profiles up ON cm.sender_id = up.user_id
// //              WHERE cm.room_id = $1 ORDER BY cm.sent_at DESC LIMIT 50`, [roomId] // Limit to recent messages
// //           );
// //           const messageHistory = historyResult.rows.reverse(); // To display in correct order on client

// //           ws.send(JSON.stringify({ type: 'CHAT_ROOM_JOINED', payload: { roomId, history: messageHistory } }));
// //           console.log(`Conceptual WS: User ${userId} (${userName}) joined chat room ${roomId}`);

// //           // Broadcast to other room members
// //           chatRooms.get(roomId).forEach(client => {
// //             if (client !== ws && client.readyState === WebSocket.OPEN) {
// //               client.send(JSON.stringify({ type: 'USER_JOINED_CHAT', payload: { roomId, userId, userName } }));
// //             }
// //           });
// //           break;
// //         }
// //         case 'LEAVE_CHAT_ROOM': {
// //           const { roomId } = parsedMessage.payload;
// //           if (ws.currentRoomId === roomId && chatRooms.has(roomId)) {
// //             chatRooms.get(roomId).delete(ws);
// //             if (chatRooms.get(roomId).size === 0) chatRooms.delete(roomId);
// //             delete ws.currentRoomId; delete ws.currentRoomType;
// //             console.log(`Conceptual WS: User ${userId} (${userName}) left chat room ${roomId}`);
// //             // Broadcast to remaining room members
// //             if(chatRooms.has(roomId)) {
// //               chatRooms.get(roomId).forEach(client => {
// //                 if (client.readyState === WebSocket.OPEN) {
// //                   client.send(JSON.stringify({ type: 'USER_LEFT_CHAT', payload: { roomId, userId, userName } }));
// //                 }
// //               });
// //             }
// //           }
// //           break;
// //         }
// //         case 'SEND_CHAT_MESSAGE': {
// //           const { roomId, content, contentType = 'text' } = parsedMessage.payload;
// //           if (ws.currentRoomId !== roomId || !chatRooms.has(roomId) || !chatRooms.get(roomId).has(ws)) {
// //             ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Not in a valid room to send message or room mismatch.' } }));
// //             break;
// //           }
// //           // Sanitize 'content' before processing/storing
// //           const sanitizedContent = content; // Placeholder for actual sanitization logic

// //           const messageData = {
// //             id: nanoid(), // Or DB generated UUID
// //             room_id: roomId,
// //             sender_id: userId,
// //             sender_name: userName,
// //             content_type: contentType,
// //             message_text: sanitizedContent,
// //             sent_at: new Date().toISOString()
// //           };
// //           // DB: INSERT INTO chat_messages (id, room_id, sender_id, content_type, message_text, sent_at) VALUES ($1, $2, $3, $4, $5, $6)
// //           await queryDB('INSERT INTO chat_messages (room_id, sender_id, content_type, message_text, sent_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, sent_at', // Let DB generate ID
// //             [messageData.room_id, messageData.sender_id, messageData.content_type, messageData.message_text, messageData.sent_at]);
// //           // Update messageData with DB generated id and precise sent_at if needed

// //           // Broadcast to all clients in the room
// //           chatRooms.get(roomId).forEach(client => {
// //             if (client.readyState === WebSocket.OPEN) {
// //               client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', payload: messageData }));
// //             }
// //           });
// //           break;
// //         }

//         // --- WebRTC Signaling for Video/Audio Calls ---
// //         case 'WEBRTC_JOIN_CALL_SESSION': { // User wants to join/start a call for an appointment
// //           const { appointmentId } = parsedMessage.payload;
// //           const appointmentResult = await queryDB('SELECT id, doctor_id, patient_id, status FROM appointments WHERE id = $1', [appointmentId]);
// //           if (appointmentResult.rows.length === 0) {
// //             ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Appointment not found for call session.'}})); break;
// //           }
// //           const appointment = appointmentResult.rows[0];
// //           if (appointment.status !== 'Confirmed' && appointment.status !== 'Ongoing_Consultation') { // Allow rejoining ongoing
// //             ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Call cannot be started. Appointment status: ${appointment.status}`}})); break;
// //           }
// //           if (userId !== appointment.doctor_id && userId !== appointment.patient_id) {
// //             ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Not authorized for this call session.'}})); break;
// //           }

// //           const callSessionId = `call-${appointmentId}`; // Unique session ID
// //           ws.currentCallSessionId = callSessionId;

// //           if (!callSessions.has(callSessionId)) {
// //             callSessions.set(callSessionId, { participants: new Map(), appointmentDetails: appointment, sdpOffers: new Map(), iceCandidates: new Map() });
// //           }
// //           const session = callSessions.get(callSessionId);
// //           session.participants.set(userId, ws);

// //           const otherParticipantId = userId === appointment.doctor_id ? appointment.patient_id : appointment.doctor_id;

// //           if (session.participants.size === 1) { // First participant (initiator)
// //             console.log(`Conceptual WS: User ${userId} (${userName}) initiated/joined call session ${callSessionId}, waiting for peer ${otherParticipantId}.`);
// //             ws.send(JSON.stringify({ type: 'WEBRTC_CALL_WAITING_PEER', payload: { callSessionId, waitingFor: otherParticipantId } }));
// //           } else if (session.participants.size === 2) { // Second participant joins
// //             const otherParticipantWs = session.participants.get(otherParticipantId);
// //             if (otherParticipantWs && otherParticipantWs.readyState === WebSocket.OPEN) {
// //               // Notify first user (initiator) that second has joined, so initiator can send offer
// //               otherParticipantWs.send(JSON.stringify({ type: 'WEBRTC_PEER_JOINED_READY_FOR_OFFER', payload: { callSessionId, peerId: userId, peerName: userName } }));
// //               // Notify current user (joiner) that the other peer is available to receive offer
// //               ws.send(JSON.stringify({ type: 'WEBRTC_PEER_AVAILABLE_SEND_OFFER', payload: { callSessionId, peerId: otherParticipantId, peerName: otherParticipantWs.userName } }));
// //               console.log(`Conceptual WS: User ${userId} (${userName}) joined call with ${otherParticipantId} (${otherParticipantWs.userName}) in session ${callSessionId}. Both present.`);
// //             }
// //           }
//             // DB: Update appointment status to 'Ongoing_Consultation' if not already
// //           if (appointment.status === 'Confirmed') {
// //             await queryDB('UPDATE appointments SET status = $1 WHERE id = $2', ['Ongoing_Consultation', appointmentId]);
// //             // DB: Log start in `consultation_sessions`
// //             await queryDB('INSERT INTO consultation_sessions (appointment_id, status, started_at) VALUES ($1, $2, NOW()) ON CONFLICT (appointment_id) DO UPDATE SET status = $2, started_at = NOW()',
// //                            [appointmentId, 'initiated']);
// //           }
// //           break;
// //         }
// //         case 'WEBRTC_SIGNAL': { // Generic signaling message (offer, answer, iceCandidate)
// //           const { callSessionId, targetUserId, signalType, data } = parsedMessage.payload;
// //           const session = callSessions.get(callSessionId);
// //           if (session && session.participants.has(targetUserId) && session.participants.has(userId)) {
// //             const targetWs = session.participants.get(targetUserId);
// //             if (targetWs && targetWs.readyState === WebSocket.OPEN) {
// //               targetWs.send(JSON.stringify({ type: 'WEBRTC_SIGNAL', payload: { callSessionId, senderId: userId, senderName: userName, signalType, data } }));
// //               console.log(`Conceptual WS: Relayed ${signalType} from ${userId} to ${targetUserId} in ${callSessionId}`);
// //             } else { console.log(`Conceptual WS: Target ${targetUserId} not connected or session invalid for signal relay.`); }
// //           } else { console.log(`Conceptual WS: Could not relay signal. Session or participant not found for ${callSessionId}.`);}
// //           break;
// //         }
// //         case 'WEBRTC_CALL_END': { // User explicitly ends or leaves the call
// //           const { callSessionId } = parsedMessage.payload;
// //           if (ws.currentCallSessionId === callSessionId && callSessions.has(callSessionId)) {
// //             const session = callSessions.get(callSessionId);
// //             // Notify other participant(s)
// //             session.participants.forEach((peerWs, peerId) => {
// //               if (peerId !== userId && peerWs.readyState === WebSocket.OPEN) {
// //                 peerWs.send(JSON.stringify({ type: 'WEBRTC_PEER_LEFT', payload: { callSessionId, peerId: userId, peerName: userName }}));
// //               }
// //             });
// //             session.participants.delete(userId);
// //             if (session.participants.size === 0) {
// //                 callSessions.delete(callSessionId); // Clean up empty call session
// //                 console.log(`Conceptual WS: Call session ${callSessionId} ended and removed.`);
// //                 // DB: Update consultation_sessions.status to 'completed' or 'ended', set duration.
// //                 // await queryDB("UPDATE consultation_sessions SET status = 'completed', ended_at = NOW(), duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at)) WHERE appointment_id = $1 AND status = 'initiated'",
// //                 //             [session.appointmentDetails.id]);
// //                 // await queryDB("UPDATE appointments SET status = 'Completed' WHERE id = $1 AND status = 'Ongoing_Consultation'", [session.appointmentDetails.id]);
// //             }
// //             delete ws.currentCallSessionId;
// //             ws.send(JSON.stringify({ type: 'WEBRTC_CALL_ENDED_CONFIRMED', payload: { callSessionId } }));
// //             console.log(`Conceptual WS: User ${userId} (${userName}) ended/left call session ${callSessionId}`);
// //           }
// //           break;
// //         }
// //         case 'USER_MEDIA_STATE_CHANGE': { // e.g., { audioMuted: true, videoOff: false }
// //             const { callSessionId, audioMuted, videoOff } = parsedMessage.payload;
// //             if(ws.currentCallSessionId === callSessionId && callSessions.has(callSessionId)) {
// //                 const session = callSessions.get(callSessionId);
// //                 session.participants.forEach((peerWs, peerId) => {
// //                     if (peerId !== userId && peerWs.readyState === WebSocket.OPEN) {
// //                         peerWs.send(JSON.stringify({ type: 'PEER_MEDIA_STATE_CHANGED', payload: { callSessionId, peerId: userId, audioMuted, videoOff }}));
// //                     }
// //                 });
// //                 console.log(`Conceptual WS: User ${userId} media state changed in ${callSessionId}: Audio Muted: ${audioMuted}, Video Off: ${videoOff}`);
// //             }
// //             break;
// //         }
// //         default:
// //           ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Unknown message type received by server.' } }));
// //           break;
// //       }
// //     } catch (e) {
// //       console.error('Conceptual WS: Failed to process message or invalid JSON', e, message.toString());
// //       ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Invalid message format or server error.' } }));
// //     }
// //   });

// //   ws.on('close', (code, reason) => {
// //     console.log(`Conceptual WS: Client ${userId || 'Unknown'} disconnected. Code: ${code}, Reason: ${reason.toString()}`);
// //     if (userId) connectedClients.delete(userId);

//     // Gracefully leave current chat room
// //     if (ws.currentRoomId && chatRooms.has(ws.currentRoomId)) {
// //       const room = chatRooms.get(ws.currentRoomId);
// //       room.delete(ws);
// //       if (room.size === 0) chatRooms.delete(ws.currentRoomId);
// //       room.forEach(client => { // Notify others in chat room
// //         if (client.readyState === WebSocket.OPEN) {
// //           client.send(JSON.stringify({ type: 'USER_LEFT_CHAT', payload: { roomId: ws.currentRoomId, userId, userName } }));
// //         }
// //       });
// //     }
//     // Gracefully leave current call session
// //     if (ws.currentCallSessionId && callSessions.has(ws.currentCallSessionId)) {
// //       const session = callSessions.get(ws.currentCallSessionId);
// //       session.participants.delete(userId);
// //       session.participants.forEach((peerWs, peerId) => { // Notify others in call
// //         if (peerWs.readyState === WebSocket.OPEN) {
// //           peerWs.send(JSON.stringify({ type: 'WEBRTC_PEER_LEFT', payload: { callSessionId: ws.currentCallSessionId, peerId: userId, peerName: userName }}));
// //         }
// //       });
// //       if (session.participants.size === 0) {
// //          callSessions.delete(ws.currentCallSessionId);
// //          // DB: Update consultation_sessions and appointments status if call ends due to disconnection
// //       }
// //     }
// //   });
// //   ws.on('error', (error) => { console.error(`Conceptual WS Error for ${userId || 'Unknown'}:`, error); });
// // });


// --- API Endpoints (Conceptual & More Robust) ---

// == User Authentication & Management ==
// POST /api/auth/register
// app.post('/api/auth/register', async (req, res) => {
  // const { fullName, email, password, phone, roleName /* 'patient' or 'seeker' only by public */ } = req.body;
  // // INPUT VALIDATION (e.g., using Zod)
  // // const RegisterSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), password: z.string().min(6), phone: z.string().min(10), roleName: z.enum(['patient', 'seeker']) });
  // // const validationResult = RegisterSchema.safeParse(req.body);
  // // if (!validationResult.success) return res.status(400).json({ error: 'Validation failed', issues: validationResult.error.issues });

  // if (roleName === 'admin' || roleName === 'doctor') {
  //   return res.status(403).json({ error: `Registration for ${roleName} role is managed by administrators.` });
  // }

  // try {
  //   const roleResult = await queryDB('SELECT id FROM roles WHERE name = $1', [roleName]);
  //   if (roleResult.rows.length === 0) return res.status(400).json({ error: 'Invalid role specified.' });
  //   const roleId = roleResult.rows[0].id;

  //   const existingUser = await queryDB('SELECT id FROM users WHERE email = $1', [email]);
  //   if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });

  //   const salt = await bcrypt.genSalt(12);
  //   const hashedPassword = await bcrypt.hash(password, salt);
  //   const verificationToken = nanoid(32);
  //   const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  //   const client = await pool.connect();
  //   try {
  //     await client.query('BEGIN');
  //     const userInsertResult = await client.query(
  //       'INSERT INTO users (email, password_hash, role_id, verification_token, verification_token_expires_at, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, FALSE, TRUE) RETURNING id',
  //       [email, hashedPassword, roleId, verificationToken, verificationTokenExpiresAt]
  //     );
  //     const userId = userInsertResult.rows[0].id;
  //     await client.query(
  //       'INSERT INTO user_profiles (user_id, full_name, phone_number) VALUES ($1, $2, $3)',
  //       [userId, fullName, phone] // Assume phone is always provided per schema.sql
  //     );
  //     await client.query('COMMIT');

      // // LOGIC: Send verification email
      // // await sendEmail(email, 'Verify Your MediServe Hub Account', `Please verify your email: ${FRONTEND_URL}/verify-email?token=${verificationToken}`);

  //     res.status(201).json({
  //       message: 'User registered successfully. Please check your email for verification link.',
  //       userId: userId // Useful for client-side analytics or follow-up
  //     });
  //   } catch (dbError) {
  //     await client.query('ROLLBACK');
  //     console.error("DB Transaction Error (Register):", dbError);
  //     res.status(500).json({ error: 'Database error during registration.' });
  //   } finally {
  //     client.release();
  //   }
  // } catch (err) {
  //   console.error("Error (Register):", err);
  //   res.status(500).json({ error: 'Server error during registration.' });
  // }
//   res.status(501).json({ message: 'Conceptual: Register endpoint hit. Not implemented yet.' });
// });

// POST /api/auth/verify-email?token=YOUR_TOKEN
// app.get('/api/auth/verify-email', async (req, res) => { // Changed to GET for link clicking
  // const { token } = req.query;
  // // Validate token: Ensure it's a string and has expected length/format.
  // if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Invalid verification token.' });
  // try {
  //   const userResult = await queryDB(
  //       'UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL WHERE verification_token = $1 AND verification_token_expires_at > NOW() AND is_verified = FALSE RETURNING id, email',
  //       [token]
  //   );
  //   if (userResult.rows.length > 0) {
  //       // // Optional: Log verification, send welcome email
  //       // await sendEmail(userResult.rows[0].email, 'Welcome to MediServe Hub!', 'Your account is now verified.');
  //       // res.send('Email verified successfully! You can now login.'); // Or redirect to login page with success message
  //       res.redirect(`${FRONTEND_URL}/login?verified=true`);
  //   } else {
  //       // Token not found, expired, or user already verified.
  //       // Check if already verified to provide a specific message
  //       const alreadyVerifiedUser = await queryDB('SELECT id FROM users WHERE verification_token = $1 AND is_verified = TRUE', [token]);
  //       if (alreadyVerifiedUser.rows.length > 0) {
  //           // res.send('This account is already verified. Please login.');
  //           res.redirect(`${FRONTEND_URL}/login?already_verified=true`);
  //       } else {
  //           res.status(400).json({ error: 'Invalid or expired verification token.' });
  //       }
  //   }
  // } catch (error) { /* ... */ }
// });

// POST /api/auth/login
// app.post('/api/auth/login', async (req, res) => {
  // const { email, password, role: intendedRole /* Optional: client indicates intended role portal for UI guidance */ } = req.body;
  // // INPUT VALIDATION
  // // const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1), role: z.string().optional() });
  // try {
  //   const userResult = await queryDB(
  //       `SELECT u.id, u.email, u.password_hash, u.is_active, u.is_verified, r.name as role_name, up.full_name, up.profile_image_url
  //        FROM users u
  //        JOIN roles r ON u.role_id = r.id
  //        LEFT JOIN user_profiles up ON u.id = up.user_id
  //        WHERE u.email = $1`,
  //       [email]
  //   );
  //   if (userResult.rows.length === 0) {
  //     return res.status(401).json({ error: 'Invalid email or password.' });
  //   }
  //   const user = userResult.rows[0];

  //   if (!user.is_active) {
  //     return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
  //   }
  //   if (!user.is_verified && user.role_name !== 'admin' && user.role_name !== 'doctor') { // Admins/Doctors might be pre-verified or have different flow
  //     return res.status(403).json({ error: 'Your account is not verified. Please check your email or contact support.' });
  //   }

  //   // If client provides an intended role, check if it matches the user's actual role for that portal.
  //   // This is more for UI routing guidance than strict auth, as the JWT will contain the true role.
  //   if (intendedRole && intendedRole !== user.role_name) {
  //       if ((intendedRole === 'admin' && user.role_name !== 'admin') ||
  //           (intendedRole === 'doctor' && user.role_name !== 'doctor')) {
  //           return res.status(401).json({ error: `This login portal is not for ${user.role_name} accounts.` });
  //       }
  //   }

  //   const isMatch = await bcrypt.compare(password, user.password_hash);
  //   if (!isMatch) {
  //     return res.status(401).json({ error: 'Invalid email or password.' });
  //   }

  //   const tokenPayload = { id: user.id, role: user.role_name, email: user.email };
  //   const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  //   // For refresh tokens, ensure they are stored securely (e.g., httpOnly cookie) and managed properly.

  //   await queryDB('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

  //   res.json({
  //     message: 'Login successful.',
  //     token,
  //     user: {
  //       id: user.id,
  //       fullName: user.full_name,
  //       email: user.email,
  //       role: user.role_name,
  //       profileImageUrl: user.profile_image_url
  //       // other non-sensitive profile data
  //     },
  //   });
  // } catch (err) { /* ... */ }
// });

// // ... (Other auth endpoints: refresh-token, logout, password-reset) ...

// // GET /api/users/me (Requires Auth)
// app.get('/api/users/me', authenticateToken, async (req, res) => {
  // try {
  //   const userProfileResult = await queryDB(
  //     `SELECT u.id, u.email, u.is_verified, u.is_active, u.created_at, u.last_login_at,
  //             r.name as role_name,
  //             up.full_name, up.phone_number, up.date_of_birth, up.address_line1, up.city, up.country, up.bio, up.profile_image_url,
  //             up.preferred_language, up.notification_preferences, up.theme_preference,
  //             ec.contact_name as emergency_contact_name, ec.contact_phone as emergency_contact_phone, ec.relationship as emergency_contact_relationship
  //      FROM users u
  //      JOIN roles r ON u.role_id = r.id
  //      LEFT JOIN user_profiles up ON u.id = up.user_id
  //      LEFT JOIN emergency_contacts ec ON u.id = ec.user_id
  //      WHERE u.id = $1`,
  //     [req.user.id]
  //   );
  //   if (userProfileResult.rows.length === 0) return res.status(404).json({ error: 'User profile not found.' });
  //   res.json(userProfileResult.rows[0]);
  // } catch (error) { /* ... */ }
// });

// // PUT /api/users/me (Requires Auth)
// app.put('/api/users/me', authenticateToken, upload.single('profileImageFile'), async (req, res) => {
  // const userId = req.user.id;
  // const {
  //   fullName, phone, dob, address, city, country, bio,
  //   preferredLanguage, enableMarketingEmails, enableAppNotifications, theme,
  //   emergencyContactName, emergencyContactPhone
  // } = req.body; // And other fields from ProfileFormValues

  // let profileImageUrl = req.body.profileImageUrl; // Existing URL or base64 data URI

  // if (req.file) {
  //   // Securely: Upload req.file.path to cloud storage (S3, Firebase Storage, Cloudinary)
  //   // For conceptual prototype: profileImageUrl = `/uploads/${req.file.filename}`;
  //   // In a real app, after successful cloud upload:
  //   // profileImageUrl = 'url_from_cloud_storage';
  //   // And delete the temporary local file: fs.unlinkSync(req.file.path);
  //   profileImageUrl = `/uploads/${req.file.filename}`; // Example for local
  // } else if (profileImageUrl && profileImageUrl.startsWith('data:image')) {
  //   // Handle base64 image upload (convert to buffer, upload to cloud, get URL)
  //   // For conceptual prototype: This part is complex. Assume direct URL or file upload for now.
  //   // Could save as a file then treat as req.file, or use a library to stream to cloud.
  //   console.log('Conceptual: Received base64 image data URI for profile. Cloud upload logic needed.');
  //   // For now, if it's data URI and no file, we might just clear it or ignore it for simplicity
  //   // unless we implement the save-data-uri-to-file-then-upload logic.
  // }


  // const client = await pool.connect();
  // try {
  //   await client.query('BEGIN');
  //   // Update user_profiles
  //   const profileUpdateQuery = `
  //     UPDATE user_profiles SET
  //       full_name = $1, phone_number = $2, date_of_birth = $3, address_line1 = $4, city = $5, country = $6, bio = $7,
  //       ${profileImageUrl ? 'profile_image_url = $8,' : ''}
  //       preferred_language = $${profileImageUrl ? 9 : 8},
  //       notification_preferences = jsonb_set(COALESCE(notification_preferences, '{}'::jsonb), '{email_marketing}', to_jsonb($${profileImageUrl ? 10 : 9}::boolean))
  //                            #jsonb_set(COALESCE(notification_preferences, '{}'::jsonb), '{app_notifications}', to_jsonb($${profileImageUrl ? 11 : 10}::boolean)),
  //       theme_preference = $${profileImageUrl ? 12 : 11}
  //     WHERE user_id = $${profileImageUrl ? 13 : 12}
  //     RETURNING *;
  //   `;
  //   const profileParams = [
  //     fullName, phone || null, dob || null, address || null, city || null, country || null, bio || null,
  //   ];
  //   if (profileImageUrl) profileParams.push(profileImageUrl);
  //   profileParams.push(
  //     preferredLanguage || 'kn',
  //     (enableMarketingEmails === 'true' || enableMarketingEmails === true), // Ensure boolean
  //     // (enableAppNotifications === 'true' || enableAppNotifications === true),
  //     theme || 'system',
  //     userId
  //   );

  //   const updatedProfile = await client.query(profileUpdateQuery, profileParams);

  //   // Update/Insert emergency_contacts
  //   if (emergencyContactName && emergencyContactPhone) {
  //     await client.query(
  //       `INSERT INTO emergency_contacts (user_id, contact_name, contact_phone, relationship)
  //        VALUES ($1, $2, $3, $4)
  //        ON CONFLICT (user_id) DO UPDATE SET
  //          contact_name = EXCLUDED.contact_name, contact_phone = EXCLUDED.contact_phone, relationship = EXCLUDED.relationship, updated_at = NOW()`,
  //       [userId, emergencyContactName, emergencyContactPhone, req.body.emergencyContactRelationship || null]
  //     );
  //   } else if (!emergencyContactName && !emergencyContactPhone) { // If both are empty, clear existing
  //       await client.query('DELETE FROM emergency_contacts WHERE user_id = $1', [userId]);
  //   }


  //   // Handle password change if newPassword is provided
  //   const { currentPassword, newPassword, confirmNewPassword } = req.body;
  //   if (newPassword) {
  //       if (!currentPassword || newPassword !== confirmNewPassword || newPassword.length < 6) {
  //           await client.query('ROLLBACK');
  //           return res.status(400).json({ error: 'Invalid password change request. Check current password, and ensure new passwords match and meet length requirements.' });
  //       }
  //       const userAuthData = await client.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
  //       if (userAuthData.rows.length === 0) throw new Error('User not found for password change.');

  //       const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, userAuthData.rows[0].password_hash);
  //       if (!isCurrentPasswordMatch) {
  //           await client.query('ROLLBACK');
  //           return res.status(401).json({ error: 'Current password incorrect.' });
  //       }
  //       const newHashedPassword = await bcrypt.hash(newPassword, 12);
  //       await client.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHashedPassword, userId]);
  //   }

  //   // Handle 2FA (conceptual)
  //   // if (req.body.enableTwoFactor !== undefined) {
  //   //    await client.query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [Boolean(req.body.enableTwoFactor), userId]);
  //   // }

  //   await client.query('COMMIT');
  //   res.json({ message: 'Profile updated successfully.', profile: updatedProfile.rows[0] });
  // } catch (error) { /* ... */ } finally { /* client.release() */ }
// });

// // == Admin Endpoints (authorizeRole(['admin'])) ==
// // GET /api/admin/users
// // POST /api/admin/users (Create user, e.g., doctor or another admin)
// // GET /api/admin/users/:userId
// // PUT /api/admin/users/:userId (Update any user's profile, role, status)
// // DELETE /api/admin/users/:userId (Soft delete)

// // GET /api/admin/medicines, POST, PUT /:id, DELETE /:id
// // GET /api/admin/inventory, PUT /api/admin/inventory/:medicineId
// // GET /api/admin/medical-services, POST, PUT /:id, DELETE /:id
// // GET /api/admin/appointments (view all, filter)
// // GET /api/admin/orders (view all, filter)
// // GET /api/admin/payments (view all, filter)
// // GET /api/admin/system-settings, PUT /api/admin/system-settings
// // GET /api/admin/analytics/dashboard-stats


// == Medicines Catalog (Public) ==
// app.get('/api/medicines', async (req, res) => {
  // // const { page = 1, limit = 10, search = '', category_kn = 'all', sort_by = 'name_kn', sort_order = 'asc' } = req.query;
  // // const offset = (parseInt(page) - 1) * parseInt(limit);
  // // let whereClauses = [];
  // // let queryParams = [];
  // // let paramIndex = 1;

  // // if (search) {
  // //   whereClauses.push(`(m.name_kn ILIKE $${paramIndex} OR m.name_en ILIKE $${paramIndex} OR m.description_kn ILIKE $${paramIndex} OR m.description_en ILIKE $${paramIndex})`);
  // //   queryParams.push(`%${search}%`);
  // //   paramIndex++;
  // // }
  // // if (category_kn && category_kn !== 'all') {
  // //   whereClauses.push(`m.category_kn = $${paramIndex}`);
  // //   queryParams.push(category_kn);
  // //   paramIndex++;
  // // }
  // // const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  // // const validSortColumns = ['name_kn', 'name_en', 'price', 'category_kn'];
  // // const orderBy = validSortColumns.includes(sort_by) ? sort_by : 'name_kn';
  // // const orderDirection = sort_order === 'desc' ? 'DESC' : 'ASC';

  // // try {
  // //   const medicinesResult = await queryDB(
  // //     `SELECT m.id, m.name_en, m.name_kn, m.description_en, m.description_kn, m.price, m.image_url, m.category_kn, mi.stock_level
  // //      FROM medicines m
  // //      LEFT JOIN medicine_inventory mi ON m.id = mi.medicine_id
  // //      ${whereCondition}
  // //      ORDER BY ${orderBy} ${orderDirection}
  // //      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
  // //     [...queryParams, parseInt(limit), offset]
  // //   );
  // //   const totalCountResult = await queryDB(`SELECT COUNT(*) FROM medicines m ${whereCondition}`, queryParams.slice(0, paramIndex -1)); // Adjust params for count
  // //   res.json({
  // //       medicines: medicinesResult.rows,
  // //       pagination: { total: parseInt(totalCountResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) }
  // //   });
  // // } catch (error) { /* ... */ }
// });
// // GET /api/medicines/:medicineId (Public)


// // == Medical Tests & Services (Public) ==
// // GET /api/medical-tests (Public)
// app.get('/api/medical-tests', async (req, res) => {
  // // try {
  // //   const testsResult = await queryDB("SELECT id, name_en, name_kn, description_en, description_kn, price_rwf, typical_turnaround_time_days, preparation_instructions_en, preparation_instructions_kn, image_url, category_kn FROM medical_services WHERE service_type = 'Test' AND is_active = TRUE ORDER BY name_kn;");
  // //   res.json({ medicalTests: testsResult.rows });
  // // } catch (error) { /* ... */ }
// });


// == Appointments (Auth required) ==
// POST /api/appointments/book
// app.post('/api/appointments/book', authenticateToken, authorizeRole(['patient', 'seeker']), async (req, res) => {
  // // const { doctor_id, service_id, appointment_date, appointment_time, reason, appointment_type } = req.body;
  // // // INPUT VALIDATION (Zod example)
  // // const patient_id = req.user.id;
  // // const appointment_datetime = new Date(`${appointment_date}T${appointment_time}`); // Combine and parse

  // // // LOGIC:
  // // // 1. Validate inputs (is date in future? doctor exists? service exists? time slot format valid?)
  // // // 2. Fetch service duration from `medical_services` or use default.
  // // // 3. Check doctor's schedule (`doctor_schedules`) for general availability (day of week, time range).
  // // // 4. Check for conflicting existing appointments for the DOCTOR at that datetime + duration.
  // // // 5. Check for conflicting existing appointments for the PATIENT at that datetime + duration.
  // // // 6. If all checks pass:
  // // try {
  // //   const newAppointment = await queryDB(
  // //     `INSERT INTO appointments (patient_id, doctor_id, service_id, appointment_datetime, reason, appointment_type, status, duration_minutes)
  // //      VALUES ($1, $2, $3, $4, $5, $6, 'Pending', (SELECT duration_minutes FROM medical_services WHERE id = $2 LIMIT 1)) RETURNING *`,
  // //     [patient_id, doctor_id, service_id, appointment_datetime, reason, appointment_type]
  // //   );
  // //   // NOTIFICATION: Send to doctor (new request) and patient (request submitted).
  // //   res.status(201).json({ message: 'Appointment requested successfully.', appointment: newAppointment.rows[0] });
  // // } catch (error) { /* ... */ }
// });

// // GET /api/appointments/my (Auth: patient, seeker, doctor)
// app.get('/api/appointments/my', authenticateToken, async (req, res) => {
  // // let query;
  // // let params = [req.user.id];
  // // if (req.user.role === 'doctor') {
  // //   query = `SELECT a.*, ps.full_name as patient_name, ds.full_name as doctor_name, ms.name_kn as service_name
  // //            FROM appointments a
  // //            JOIN user_profiles ps ON a.patient_id = ps.user_id
  // //            JOIN user_profiles ds ON a.doctor_id = ds.user_id
  // //            LEFT JOIN medical_services ms ON a.service_id = ms.id
  // //            WHERE a.doctor_id = $1 ORDER BY a.appointment_datetime DESC`;
  // // } else { // patient or seeker
  // //   query = `SELECT a.*, ps.full_name as patient_name, ds.full_name as doctor_name, ms.name_kn as service_name
  // //            FROM appointments a
  // //            JOIN user_profiles ps ON a.patient_id = ps.user_id
  // //            JOIN user_profiles ds ON a.doctor_id = ds.user_id
  // //            LEFT JOIN medical_services ms ON a.service_id = ms.id
  // //            WHERE a.patient_id = $1 ORDER BY a.appointment_datetime DESC`;
  // // }
  // // try {
  // //   const appointmentsResult = await queryDB(query, params);
  // //   res.json({ appointments: appointmentsResult.rows });
  // // } catch (error) { /* ... */ }
// });

// // PUT /api/appointments/:appointmentId/status (Auth: doctor, patient (for cancelling), admin)
// // This needs careful permission logic based on current status and user role.


// == Prescriptions (Auth required) ==
// POST /api/prescriptions (Auth: doctor)
// app.post('/api/prescriptions', authenticateToken, authorizeRole(['doctor']), async (req, res) => {
  // // const { patient_id, appointment_id, medicines /* array of { medicine_id, dosage, frequency, duration, instructions } */, notes } = req.body;
  // // // INPUT VALIDATION
  // // const doctor_id = req.user.id;
  // // const client = await pool.connect();
  // // try {
  // //   await client.query('BEGIN');
  // //   const prescriptionInsertResult = await client.query(
  // //     `INSERT INTO prescriptions (patient_id, doctor_id, appointment_id, date_prescribed, notes_for_patient, status)
  // //      VALUES ($1, $2, $3, NOW(), $4, 'Active') RETURNING id`,
  // //     [patient_id, doctor_id, appointment_id || null, notes || null]
  // //   );
  // //   const prescriptionId = prescriptionInsertResult.rows[0].id;
  // //   for (const med of medicines) {
  // //     await client.query(
  // //       `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, frequency, duration, instructions)
  // //        VALUES ($1, $2, $3, $4, $5, $6)`,
  // //       [prescriptionId, med.medicine_id, med.dosage, med.frequency, med.duration, med.instructions || null]
  // //     );
  // //   }
  // //   await client.query('COMMIT');
  // //   // NOTIFICATION: Send to patient.
  // //   res.status(201).json({ message: 'Prescription created successfully.', prescriptionId });
  // // } catch (error) { /* Rollback, respond */ } finally { /* client.release() */ }
// });
// // GET /api/prescriptions/my (Auth: patient)


// == E-commerce (Cart, Orders, Payments - Auth required) ==
// // GET /api/cart, POST /api/cart/items, PUT /api/cart/items/:cartItemId, DELETE /api/cart/items/:cartItemId
// // POST /api/orders
// // GET /api/orders/my
// // POST /api/payments/create-intent (e.g., for Stripe)
// // POST /api/payments/webhook (Public, secured by gateway signature)


// == Community Features (Forums, Groups - Auth required for interactions) ==
// // GET /api/forums/posts, GET /api/forums/posts/:postId, POST /api/forums/posts (create)
// // POST /api/forums/posts/:postId/comments (create comment)
// // POST /api/forums/posts/:postId/like (toggle like)
// // GET /api/support-groups, GET /api/support-groups/:groupId
// // POST /api/support-groups (create group)
// // POST /api/support-groups/:groupId/join (request or join public)
// // POST /api/support-groups/:groupId/posts (create group post)


// == AI Endpoints (Auth required, backend calls Genkit) ==
// app.post('/api/ai/symptom-analyzer', authenticateToken, async (req, res) => {
  // // const { symptomsDescription, imageDataUri } = req.body;
  // // try {
  // //   // Conceptual: const result = await genkit_symptom_analyzer_flow.run({ symptomsDescription, imageDataUri });
  // //   // Store interaction for audit/history if needed:
  // //   // await queryDB('INSERT INTO ai_interactions (user_id, flow_name, input_payload) VALUES ($1, $2, $3)',
  // //   //                [req.user.id, 'symptomAnalyzer', {symptomsDescription, imageProvided: !!imageDataUri}]);
  // //   // res.json(result); // This 'result' should match SymptomAnalyzerOutput schema
  // // } catch (aiError) {
  // //   console.error("AI Symptom Analyzer Error:", aiError);
  // //   res.status(500).json({ error: "Failed to get analysis from AI service." });
  // // }
// });
// // POST /api/ai/medical-faq
// // POST /api/ai/test-yourself


// --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err.name, err.message, err.stack ? err.stack.substring(0, 300) : '');

//   // Handle Zod validation errors specifically if using Zod
//   // if (err instanceof z.ZodError) {
//   //   return res.status(400).json({ error: 'Validation failed.', issues: err.errors });
//   // }
//   if (err.name === 'UnauthorizedError') { // From express-jwt or similar
//     return res.status(401).json({ error: 'Invalid token or not authenticated.' });
//   }
//   if (err.code === '23505') { // PostgreSQL unique violation error code
//     return res.status(409).json({
//       error: 'A record with this value already exists. Please use a different value.',
//       field: err.constraint // This might give a hint about which field caused it
//     });
//   }
//   // Multer file upload errors
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'File too large. Maximum size is 5MB.'});
//     }
//     return res.status(400).json({ error: `File upload error: ${err.message}`});
//   }
//   if (err.message === 'Not an image! Please upload only images.') { // From custom fileFilter
//      return res.status(400).json({ error: err.message });
//   }

//   // Default error response
//   res.status(err.status || 500).json({
//     error: err.message || 'An unexpected error occurred on the server.',
//     // Conditionally send stack in development for debugging, not in production
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack?.substring(0, 200) + "..." }),
//   });
// });

// --- Server Start ---
// server.listen(PORT, () => {
//   console.log(`MediServe Hub Conceptual Backend Server is conceptually listening on http://localhost:${PORT}`);
//   console.log(`MediServe Hub Conceptual WebSocket Server is conceptually available on ws://localhost:${PORT}`);
//   console.log("REMINDER: This is a conceptual server outline. No actual services are running from this file.");
// });

/*
This enhanced conceptual server.js provides a far more detailed blueprint for
the backend architecture. It includes:
- More specific technology considerations (Node.js, Express, PostgreSQL, JWT, WebSockets, etc.).
- Detailed authentication flow (registration with verification, login with JWT, password reset).
- Robust WebSocket handling for real-time chat and WebRTC signaling, including room management,
  message persistence, and signaling message relay for peer-to-peer connections.
- Comprehensive API endpoint structures for all major features, with considerations for request/response data,
  database interactions (referencing schema.sql), and business logic.
- File upload handling concepts (Multer).
- More specific error handling considerations, including DB errors and validation.
- Conceptual integration points for payment gateways and AI flows.

This serves as a strong foundation for actual backend development.
The frontend should be built to interact with APIs structured like these.
*/


// MediServe Hub - Conceptual Backend Server (Express.js & WebSocket Example)
// Version: 2.1 - Enhanced for Robust Conceptualization
// This file outlines a detailed conceptual structure for the backend.
// It does NOT represent a fully functional server but serves as an in-depth guide
// for building a full-stack application using the defined schema.sql.

console.log("MediServe Hub - Conceptual Backend Server Guide v2.1");

/*
--- Core Technologies (Conceptual Stack) ---
- Node.js: JavaScript runtime environment.
- Express.js: Web framework for Node.js (for REST APIs).
- PostgreSQL: Relational database (schema defined in `schema.sql`).
- `pg` (node-postgres): PostgreSQL client for Node.js (or an ORM like Prisma/Sequelize).
- `bcryptjs`: For hashing passwords securely.
- `jsonwebtoken` (JWT): For authentication tokens.
- `ws`: WebSocket library for Node.js (for real-time chat and WebRTC signaling).
- `cors`, `helmet`, `morgan`: Essential Express middleware.
- `dotenv`: For managing environment variables.
- Validation library (e.g., Zod, Joi): For validating request payloads and parameters.
- `nanoid` or `uuid`: For generating unique IDs if not solely relying on DB sequences/UUIDs.
- Potentially a message queue (e.g., RabbitMQ, Kafka) for handling asynchronous tasks (like sending notifications at scale).
- Potentially Redis for caching frequently accessed data or managing WebSocket session states in a scaled environment.

--- Server Initialization (Conceptual) ---
require('dotenv').config(); // Load environment variables

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg'); // Or your chosen DB client/ORM setup
// const { nanoid } = require('nanoid');

const app = express();
const server = http.createServer(app); // Express app will handle HTTP requests
const wss = new WebSocket.Server({ server }); // WebSocket server shares the same HTTP server

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-and-unique-jwt-secret-key-in-env';
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mediserve_user:mediserve_pass@localhost:5432/mediserve_db';

// --- Database Connection (Conceptual) ---
// const pool = new Pool({ connectionString: DATABASE_URL });
// pool.connect()
//   .then(() => console.log('Conceptual: Database connected successfully via connection pool.'))
//   .catch(err => console.error('Conceptual: Database connection error:', err.stack));
//
// // Example DB Query Function (to be used in endpoint logic)
// async function queryDB(sql, params) {
//   const client = await pool.connect();
//   try {
//     const result = await client.query(sql, params);
//     return result;
//   } finally {
//     client.release();
//   }
// }

// --- Middleware ---
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:9002', credentials: true }));
app.use(helmet()); // Set various security HTTP headers
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increased limit for potential image data URIs
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logging

// --- Authentication Middleware (Conceptual) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer TOKEN"
  if (token == null) return res.status(401).json({ error: 'Authentication token required.' });

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ error: 'Invalid or expired token.' }); // Forbidden
    }
    // userPayload should contain { id: userId, role: userRole, email: userEmail }
    req.user = userPayload;
    next();
  });
};

// --- Authorization Middleware (Conceptual) ---
const authorizeRole = (allowedRolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied. User role not determined.' });
    }
    if (!allowedRolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' });
    }
    next();
  };
};

// --- WebSocket Server Logic (Conceptual & More Robust) ---
// Map to store connected clients: Map<userId, WebSocketConnection>
const connectedClients = new Map();
// Map to store chat rooms and their participants: Map<roomId, Set<WebSocketConnection>>
// roomId can be consultation_id, support_group_id, etc.
const chatRooms = new Map();
// Map to store WebRTC call sessions: Map<callSessionId, { participants: Map<userId, WebSocketConnection>, sdpOffers: Map, etc. }>
const callSessions = new Map();

wss.on('connection', (ws, req) => {
  let userId, userRole, userEmail; // To be populated after WS authentication

  // Conceptual: Authenticate WebSocket connection (e.g., token in query param or via initial message)
  // Example using query parameter:
  // const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   userId = decoded.id;
  //   userRole = decoded.role;
  //   userEmail = decoded.email;
  //   ws.userId = userId; // Attach userId to WebSocket connection object
  //   ws.userRole = userRole;
  //   connectedClients.set(userId, ws); // Store client
  //   console.log(`Conceptual WS: Client ${userId} (${userEmail}, Role: ${userRole}) connected.`);
  //   ws.send(JSON.stringify({ type: 'WS_CONNECTION_SUCCESS', payload: { message: 'WebSocket connected and authenticated.' } }));
  // } catch (err) {
  //   console.error("Conceptual WS: Auth failed for WebSocket connection.", err.message);
  //   ws.close(1008, "Authentication failed. Invalid token.");
  //   return;
  // }

  // If using initial message for auth:
  // ws.on('message', (initialMessage) => {
  //    handle initial auth message, then proceed to main message handler
  //    if (authenticated) { ws.off('message', this_handler); ws.on('message', mainMessageHandler); }
  // });

  const mainMessageHandler = async (message) => {
    // if (!userId) { // Ensure user is authenticated for subsequent messages
    //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'WebSocket not authenticated.' }));
    //   ws.close(1008, "Not authenticated.");
    //   return;
    // }
    // try {
    //   const parsedMessage = JSON.parse(message.toString());
    //   console.log(`Conceptual WS: Received from ${userId}:`, parsedMessage);

    //   switch (parsedMessage.type) {
    //     // --- Chat Functionality ---
    //     case 'JOIN_CHAT_ROOM': {
    //       const { roomId, roomType } = parsedMessage.payload; // roomType could be 'consultation', 'support_group'
    //       // DB: Verify user has permission to join this room (e.g., is part of consultation or group_memberships)
    //       // const canJoin = await dbCheckUserCanJoinRoom(userId, roomId, roomType);
    //       // if (!canJoin) {
    //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: `Not authorized to join room ${roomId}.` }));
    //       //   break;
    //       // }
    //       if (!chatRooms.has(roomId)) chatRooms.set(roomId, new Set());
    //       chatRooms.get(roomId).add(ws);
    //       ws.currentRoomId = roomId; // Store current room on ws object
    //       // Send confirmation and perhaps recent message history
    //       // const messageHistory = await dbFetchMessageHistory(roomId, 20);
    //       // ws.send(JSON.stringify({ type: 'CHAT_ROOM_JOINED', payload: { roomId, history: messageHistory } }));
    //       // console.log(`Conceptual WS: User ${userId} joined chat room ${roomId}`);
    //       // Broadcast to other room members:
    //       // chatRooms.get(roomId).forEach(client => {
    //       //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //       //     client.send(JSON.stringify({ type: 'USER_JOINED_CHAT', payload: { roomId, userId, userName: 'fetched_user_name' } }));
    //       //   }
    //       // });
    //       break;
    //     }
    //     case 'LEAVE_CHAT_ROOM': {
    //       const { roomId } = parsedMessage.payload;
    //       if (ws.currentRoomId === roomId && chatRooms.has(roomId) && chatRooms.get(roomId).has(ws)) {
    //         chatRooms.get(roomId).delete(ws);
    //         if (chatRooms.get(roomId).size === 0) chatRooms.delete(roomId); // Clean up empty room
    //         delete ws.currentRoomId;
    //         // ws.send(JSON.stringify({ type: 'CHAT_ROOM_LEFT', payload: { roomId } }));
    //         // console.log(`Conceptual WS: User ${userId} left chat room ${roomId}`);
    //         // Broadcast to other room members:
    //         // chatRooms.get(roomId)?.forEach(client => {
    //         //   if (client.readyState === WebSocket.OPEN) {
    //         //     client.send(JSON.stringify({ type: 'USER_LEFT_CHAT', payload: { roomId, userId } }));
    //         //   }
    //         // });
    //       }
    //       break;
    //     }
    //     case 'SEND_CHAT_MESSAGE': {
    //       const { roomId, content, contentType = 'text' } = parsedMessage.payload;
    //       if (ws.currentRoomId !== roomId || !chatRooms.has(roomId) || !chatRooms.get(roomId).has(ws)) {
    //         // ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not in a valid room to send message or room mismatch.' }));
    //         break;
    //       }
    //       // const userProfile = await queryDB('SELECT full_name FROM user_profiles WHERE user_id = $1', [userId]);
    //       // const senderName = userProfile.rows[0]?.full_name || 'User';
    //       // const messageData = {
    //       //   message_id: nanoid(), // Or DB generated
    //       //   room_id: roomId,
    //       //   sender_id: userId,
    //       //   sender_name: senderName,
    //       //   content_type: contentType,
    //       //   message_text: content, // Sanitize this content
    //       //   sent_at: new Date().toISOString()
    //       // };
    //       // // DB: INSERT INTO chat_messages (id, room_id, sender_id, content_type, message_text, sent_at) VALUES ($1, $2, $3, $4, $5, $6)
    //       // // await queryDB('INSERT INTO chat_messages (...) ...', [messageData.message_id, ...]);
    //       // chatRooms.get(roomId).forEach(client => {
    //       //   if (client.readyState === WebSocket.OPEN) {
    //       //     client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', payload: messageData }));
    //       //   }
    //       // });
    //       break;
    //     }

    //     // --- WebRTC Signaling for Video/Audio Calls ---
    //     // callSessionId would typically be unique per call, e.g., derived from appointment_id
    //     case 'WEBRTC_JOIN_CALL': {
    //       const { callSessionId, appointmentId, sdpOffer } = parsedMessage.payload; // sdpOffer from initiator
    //       // DB: Verify appointment and user's participation.
    //       // const appointmentDetails = await queryDB('SELECT doctor_id, patient_id, status FROM appointments WHERE id = $1', [appointmentId]);
    //       // if (!appointmentDetails.rows[0] || (appointmentDetails.rows[0].doctor_id !== userId && appointmentDetails.rows[0].patient_id !== userId)) {
    //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not authorized for this call session.'}));
    //       //   break;
    //       // }
    //       // if (appointmentDetails.rows[0].status !== 'Confirmed') { /* handle other statuses */ }

    //       ws.currentCallSessionId = callSessionId;
    //       if (!callSessions.has(callSessionId)) {
    //         callSessions.set(callSessionId, { participants: new Map(), sdpOffers: new Map() });
    //       }
    //       const session = callSessions.get(callSessionId);
    //       session.participants.set(userId, ws);

    //       if (session.participants.size === 1) { // First participant (caller)
    //         // Store offer if provided by initiator, or expect it next
    //         // session.sdpOffers.set(userId, sdpOffer); // If offer is sent with JOIN
    //         // console.log(`Conceptual WS: User ${userId} initiated call in session ${callSessionId}`);
    //         // ws.send(JSON.stringify({ type: 'WEBRTC_CALL_WAITING_PEER', payload: { callSessionId } }));
    //       } else if (session.participants.size === 2) { // Second participant (callee) joins
    //         const [firstUserId, firstWs] = Array.from(session.participants.entries()).find(([id, _]) => id !== userId);
    //         if (firstWs && firstWs.readyState === WebSocket.OPEN) {
    //           // Notify first user that second has joined, first user should now send offer
    //           // firstWs.send(JSON.stringify({ type: 'WEBRTC_PEER_JOINED', payload: { callSessionId, peerId: userId } }));
    //           // ws.send(JSON.stringify({ type: 'WEBRTC_PEER_AVAILABLE', payload: { callSessionId, peerId: firstUserId } })); // Inform current user who the peer is
    //           // console.log(`Conceptual WS: User ${userId} joined call with ${firstUserId} in session ${callSessionId}`);
    //         }
    //       } else { /* Handle group calls if supported, or reject >2 participants */ }
    //       break;
    //     }
    //     case 'WEBRTC_OFFER': { // SDP Offer from one peer to another
    //       const { callSessionId, targetUserId, sdp } = parsedMessage.payload;
    //       const session = callSessions.get(callSessionId);
    //       if (session && session.participants.has(targetUserId)) {
    //         const targetWs = session.participants.get(targetUserId);
    //         if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    //           // targetWs.send(JSON.stringify({ type: 'WEBRTC_OFFER', payload: { callSessionId, senderId: userId, sdp } }));
    //           // console.log(`Conceptual WS: Relayed SDP Offer from ${userId} to ${targetUserId} in ${callSessionId}`);
    //         }
    //       }
    //       break;
    //     }
    //     case 'WEBRTC_ANSWER': { // SDP Answer from one peer back to the offerer
    //       const { callSessionId, targetUserId, sdp } = parsedMessage.payload;
    //       const session = callSessions.get(callSessionId);
    //       if (session && session.participants.has(targetUserId)) {
    //         const targetWs = session.participants.get(targetUserId);
    //         if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    //           // targetWs.send(JSON.stringify({ type: 'WEBRTC_ANSWER', payload: { callSessionId, senderId: userId, sdp } }));
    //           // console.log(`Conceptual WS: Relayed SDP Answer from ${userId} to ${targetUserId} in ${callSessionId}`);
    //         }
    //       }
    //       break;
    //     }
    //     case 'WEBRTC_ICE_CANDIDATE': { // ICE candidate for establishing connection
    //       const { callSessionId, targetUserId, candidate } = parsedMessage.payload;
    //       const session = callSessions.get(callSessionId);
    //       if (session && session.participants.has(targetUserId)) {
    //         const targetWs = session.participants.get(targetUserId);
    //         if (targetWs && targetWs.readyState === WebSocket.OPEN) {
    //           // targetWs.send(JSON.stringify({ type: 'WEBRTC_ICE_CANDIDATE', payload: { callSessionId, senderId: userId, candidate } }));
    //         }
    //       }
    //       break;
    //     }
    //     case 'WEBRTC_LEAVE_CALL': {
    //       const { callSessionId } = parsedMessage.payload;
    //       if (ws.currentCallSessionId === callSessionId && callSessions.has(callSessionId)) {
    //         const session = callSessions.get(callSessionId);
    //         session.participants.delete(userId);
    //         delete ws.currentCallSessionId;
    //         // Notify other participant(s)
    //         session.participants.forEach((peerWs, peerId) => {
    //           if (peerWs.readyState === WebSocket.OPEN) {
    //             // peerWs.send(JSON.stringify({ type: 'WEBRTC_PEER_LEFT', payload: { callSessionId, peerId: userId }}));
    //           }
    //         });
    //         if (session.participants.size === 0) {
    //           callSessions.delete(callSessionId); // Clean up empty call session
    //         }
    //         // ws.send(JSON.stringify({ type: 'WEBRTC_CALL_LEFT_CONFIRMED', payload: { callSessionId } }));
    //         // console.log(`Conceptual WS: User ${userId} left call session ${callSessionId}`);
    //         // DB: Update consultation_sessions.status to 'ended' or 'interrupted'
    //       }
    //       break;
    //     }

    //     default:
    //       // ws.send(JSON.stringify({ type: 'ERROR', payload: 'Unknown message type received.' }));
    //       break;
    //   }
    // } catch (e) {
    //   console.error('Conceptual WS: Failed to process message or invalid JSON', e, message.toString());
    //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid message format or server error.' }));
    // }
  };
  // ws.on('message', mainMessageHandler); // Attach main handler after auth or directly if auth is via query


  ws.on('close', (code, reason) => {
    // console.log(`Conceptual WS: Client ${userId || 'Unknown'} disconnected. Code: ${code}, Reason: ${reason.toString()}`);
    // if (userId) connectedClients.delete(userId);

    // // Clean up from chat rooms
    // if (ws.currentRoomId && chatRooms.has(ws.currentRoomId)) {
    //   const room = chatRooms.get(ws.currentRoomId);
    //   room.delete(ws);
    //   if (room.size === 0) chatRooms.delete(ws.currentRoomId);
    //   // Notify other room members user left
    // }
    // // Clean up from call sessions
    // if (ws.currentCallSessionId && callSessions.has(ws.currentCallSessionId)) {
    //   const session = callSessions.get(ws.currentCallSessionId);
    //   session.participants.delete(userId);
    //   // Notify other call participants
    //   if (session.participants.size === 0) callSessions.delete(ws.currentCallSessionId);
    // }
  });

  ws.on('error', (error) => {
    // console.error(`Conceptual WS: Error for client ${userId || 'Unknown'}:`, error);
  });
});

// --- API Endpoints (Conceptual & More Robust) ---

// == User Authentication & Management ==
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  // const { fullName, email, password, phone, roleName } = req.body;
  // // INPUT VALIDATION (e.g., using Zod)
  // // if (!Validation.isValid(req.body, registerSchema)) return res.status(400).json({ errors: Validation.errors });

  // if (roleName === 'admin' || roleName === 'doctor') {
  //   return res.status(403).json({ error: `Registration for ${roleName} role is managed by administrators.` });
  // }

  // try {
  //   // DB: Check if role exists
  //   // const roleResult = await queryDB('SELECT id FROM roles WHERE name = $1', [roleName]);
  //   // if (roleResult.rows.length === 0) return res.status(400).json({ error: 'Invalid role specified.' });
  //   // const roleId = roleResult.rows[0].id;

  //   // DB: Check if email already exists
  //   // const existingUser = await queryDB('SELECT id FROM users WHERE email = $1', [email]);
  //   // if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });

  //   const salt = await bcrypt.genSalt(12); // Increased salt rounds
  //   const hashedPassword = await bcrypt.hash(password, salt);

  //   // DB TRANSACTION:
  //   // const client = await pool.connect();
  //   // try {
  //   //   await client.query('BEGIN');
  //   //   const userInsertResult = await client.query(
  //   //     'INSERT INTO users (email, password_hash, role_id, is_verified) VALUES ($1, $2, $3, FALSE) RETURNING id', // Start as not verified
  //   //     [email, hashedPassword, roleId]
  //   //   );
  //   //   const userId = userInsertResult.rows[0].id;
  //   //   await client.query(
  //   //     'INSERT INTO user_profiles (user_id, full_name, phone_number) VALUES ($1, $2, $3)',
  //   //     [userId, fullName, phone || null]
  //   //   );
  //   //   await client.query('COMMIT');
  //   //
  //   //   // LOGIC: Send verification email (conceptual)
  //   //   // sendVerificationEmail(email, verificationToken);
  //   //
  //   //   res.status(201).json({
  //   //     message: 'User registered successfully. Please check your email for verification.',
  //   //     // No token returned on register, user must verify then login
  //   //   });
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
app.post('/api/auth/login', async (req, res) => {
  // const { email, password, role } = req.body; // role from client can help for specific portal login
  // // INPUT VALIDATION
  // try {
  //   // DB: Fetch user by email
  //   // const userResult = await queryDB(
  //   //   `SELECT u.id, u.email, u.password_hash, u.is_verified, u.is_active, r.name as role_name,
  //   //           p.full_name, p.profile_image_url, p.preferred_language, p.theme_preference
  //   //    FROM users u
  //   //    JOIN roles r ON u.role_id = r.id
  //   //    JOIN user_profiles p ON u.id = p.user_id
  //   //    WHERE u.email = $1`,
  //   //   [email]
  //   // );
  //   // if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials.' });
  //   // const user = userResult.rows[0];

  //   // if (!user.is_active) return res.status(403).json({ error: 'Account is deactivated.' });
  //   // if (!user.is_verified) return res.status(403).json({ error: 'Account not verified. Please check your email.' });

  //   // // If role is provided and doesn't match (e.g. doctor trying to login via patient portal form)
  //   // if (role && role !== user.role_name) {
  //   //    return res.status(401).json({ error: `This login form is not for ${user.role_name} accounts.` });
  //   // }

  //   // const isMatch = await bcrypt.compare(password, user.password_hash);
  //   // if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

  //   // const tokenPayload = { id: user.id, role: user.role_name, email: user.email };
  //   // const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '24h' });

  //   // // DB: Update last_login timestamp
  //   // await queryDB('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

  //   // res.json({
  //   //   message: 'Login successful.',
  //   //   token,
  //   //   user: { id: user.id, fullName: user.full_name, email: user.email, roleName: user.role_name,
  //   //           profileImageUrl: user.profile_image_url, preferredLanguage: user.preferred_language, themePreference: user.theme_preference },
  //   // });
  // } catch (err) { /* ... */ }
  res.status(501).json({ message: 'Conceptual: Login endpoint hit. Not implemented yet.' });
});

// POST /api/auth/admin/login
app.post('/api/auth/admin/login', async (req, res) => {
  // Similar to user login, but ensure role_name is 'admin'.
  res.status(501).json({ message: 'Conceptual: Admin Login endpoint hit. Not implemented yet.' });
});

// GET /api/users/me (Requires Auth)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // // DB: Fetch comprehensive user profile (users, user_profiles, doctor_profiles if applicable)
  // // const userProfile = await queryDB(detailedUserQuery, [userId]);
  // // if (!userProfile.rows[0]) return res.status(404).json({ error: 'User profile not found.' });
  // // res.json({ user: userProfile.rows[0] });
  res.status(501).json({ message: 'Conceptual: GET /api/users/me hit. Not implemented yet.' });
});

// PUT /api/users/me (Requires Auth)
app.put('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // const { fullName, phone, dob, gender, address, city, country, bio, profileImageUrl,
  //         preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone,
  //         enableMarketingEmails, enableAppNotifications } = req.body;
  // // INPUT VALIDATION for all fields.
  // // DB TRANSACTION:
  // //   UPDATE user_profiles SET ... WHERE user_id = $1
  // //   Return updated profile.
  res.status(501).json({ message: 'Conceptual: PUT /api/users/me hit. Not implemented yet.' });
});

// PUT /api/users/me/password (Requires Auth)
app.put('/api/users/me/password', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // const { currentPassword, newPassword, confirmNewPassword } = req.body;
  // // INPUT VALIDATION (newPassword === confirmNewPassword, complexity rules)
  // // DB: Fetch current password_hash for user.
  // // const user = await queryDB('SELECT password_hash FROM users WHERE id = $1', [userId]);
  // // if (!user.rows[0]) return res.status(404).json({ error: 'User not found.'});
  // // const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
  // // if (!isMatch) return res.status(401).json({ error: 'Incorrect current password.' });
  // // const salt = await bcrypt.genSalt(12);
  // // const newHashedPassword = await bcrypt.hash(newPassword, salt);
  // // DB: UPDATE users SET password_hash = $1 WHERE id = $2
  // // res.json({ message: 'Password updated successfully.' });
  res.status(501).json({ message: 'Conceptual: Password change endpoint hit. Not implemented yet.'});
});

// == Admin User Management (Admin only) ==
// GET /api/admin/users?page=1&limit=10&search=term&role=patient&status=active
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // const { page = 1, limit = 10, search = '', role_name = '', is_active = null } = req.query;
  // const offset = (page - 1) * limit;
  // let baseQuery = `SELECT u.id, p.full_name, u.email, r.name as role_name, u.is_active, u.created_at
  //                  FROM users u
  //                  JOIN user_profiles p ON u.id = p.user_id
  //                  JOIN roles r ON u.role_id = r.id
  //                  WHERE 1=1 `;
  // const params = [];
  // if (search) { baseQuery += ` AND (p.full_name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`; params.push(`%${search}%`); }
  // if (role_name) { baseQuery += ` AND r.name = $${params.length + 1}`; params.push(role_name); }
  // if (is_active !== null) { baseQuery += ` AND u.is_active = $${params.length + 1}`; params.push(is_active === 'true'); }
  // const countQuery = `SELECT COUNT(*) FROM (${baseQuery}) as subquery_for_count`;
  // baseQuery += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  // params.push(limit, offset);
  // // const usersResult = await queryDB(baseQuery, params);
  // // const totalCountResult = await queryDB(countQuery, params.slice(0, -2)); // Exclude limit and offset for count
  // // const totalCount = parseInt(totalCountResult.rows[0].count, 10);
  // // res.json({ users: usersResult.rows, totalCount, totalPages: Math.ceil(totalCount / limit), currentPage: parseInt(page, 10) });
  res.status(501).json({ message: 'Conceptual: GET /api/admin/users hit. Not implemented yet.' });
});
// Other Admin user endpoints: GET /:userId, PUT /:userId, DELETE /:userId

// == Medicines, Inventory, Services ==
// GET /api/medicines?search=term&category=cat_id&page=1&limit=10 (Public)
// GET /api/medicines/:medicineId (Public)
// (Admin CRUD for medicines: POST, PUT /:id, DELETE /:id require authorizeRole(['admin']))
// POST /api/admin/medicines
// PUT /api/admin/medicines/:medicineId
// DELETE /api/admin/medicines/:medicineId

// GET /api/admin/inventory?medicineId=...&lowStock=true (Admin only)
// POST /api/admin/inventory (Admin only)
// PUT /api/admin/inventory/:inventoryId (Admin only)

// GET /api/medical-services (Public)
// (Admin CRUD for services: POST, PUT /:id, DELETE /:id require authorizeRole(['admin']))

// == Appointments ==
// POST /api/appointments (Auth: patient, seeker)
//   Req: { doctor_id, service_id?, appointment_date, appointment_time, reason, appointment_type }
//   Logic: Check doctor availability (doctor_schedules table). Check for conflicts.
//   DB: INSERT INTO appointments.
//   Notification: Conceptually send to doctor and patient.
// GET /api/appointments/my (Auth: patient, seeker, doctor)
//   Logic: Fetch based on user role (patient_id or doctor_id).
// PUT /api/appointments/:appointmentId/status (Auth: patient, doctor, admin)
//   Req: { status: 'Confirmed' | 'Cancelled_By_Patient' | 'Cancelled_By_Doctor' | 'Completed' | 'Rescheduled_Pending' }
//   Logic: Permissions check (e.g., patient can cancel X hours before).
//   DB: UPDATE appointments SET status = $1, status_reason = $2 WHERE id = $3.
//   If rescheduled, may need to create a new appointment or update details.

// == Prescriptions ==
// POST /api/prescriptions (Auth: doctor)
//   Req: { patient_id, appointment_id?, medicines: [{ medicine_id, dosage, frequency, duration, instructions }], notes }
//   DB TRANSACTION: INSERT INTO prescriptions, then loop and INSERT INTO prescription_items.
// GET /api/prescriptions/my (Auth: patient) - Fetch for logged-in patient.
// GET /api/prescriptions/doctor (Auth: doctor) - Fetch prescriptions issued by logged-in doctor.

// == Online Consultation & Chat History API ==
// POST /api/consultations/:appointmentId/initiate (Auth: doctor or patient based on who initiates)
//   Req: { appointmentId }
//   Logic:
//     DB: Check if appointment exists and is 'Confirmed'.
//     DB: INSERT INTO consultation_sessions (appointment_id, status='initiated', started_at=NOW()) RETURNING id.
//     DB: Create chat_room if it doesn't exist (room_id could be consultation_session_id, type='consultation')
//     Res: { consultationSessionId, chatRoomId, otherParticipantId (if known) }
// GET /api/chat/rooms/:roomId/messages?limit=20&before_message_id=xyz (Auth: participants of the room)
//   DB: Fetch messages for roomId, paginated.

// == Community (Forums, Groups) ==
// GET /api/forums/posts?category=cat_slug&search=term&page=1&limit=10 (Public or Auth for private forums)
// GET /api/forums/posts/:postId (Public or Auth)
// POST /api/forums/posts (Auth required)
//   Req: { category_id, title, content, tags? }
//   DB: INSERT into forum_posts.
// POST /api/forums/posts/:postId/comments (Auth required)
//   Req: { text }
// POST /api/forums/posts/:postId/like (Auth required) - Toggle like

// GET /api/support-groups?search=term&category=cat_name (Public or Auth)
// GET /api/support-groups/:groupId (Public or Auth for details, posts require membership for private groups)
// POST /api/support-groups (Auth required, potentially admin approval for creation)
// POST /api/support-groups/:groupId/join (Auth required)
//   Logic: If public, add to group_memberships. If private, status='pending_approval'.
// POST /api/support-groups/:groupId/posts (Auth: group members)
//   Req: { text_content, image_url? }

// == E-commerce (Cart, Orders, Payments) ==
// GET /api/cart (Auth: patient, seeker)
//   DB: Fetch cart_items for user_id.
// POST /api/cart/items (Auth: patient, seeker)
//   Req: { medicine_id, quantity }
//   Logic: Check stock (medicines.stock_level). Add/update cart_items.
// PUT /api/cart/items/:cartItemId (Auth: patient, seeker)
//   Req: { quantity }
// DELETE /api/cart/items/:cartItemId (Auth: patient, seeker)
// POST /api/orders (Auth: patient, seeker)
//   Req: { shipping_address_id?, billing_address_id?, payment_method_token?, notes? } (items come from cart)
//   DB TRANSACTION:
//     Create order in `orders` table.
//     Move items from `cart_items` to `order_items`.
//     Update medicine stock levels.
//     Clear user's cart.
//   Logic: Initiate payment processing.
// GET /api/orders/my (Auth: patient, seeker)
// GET /api/orders/:orderId (Auth: patient who owns it, or admin)

// POST /api/payments/initiate (Auth: patient, seeker)
//   Req: { order_id, amount, payment_method_details, currency='RWF' }
//   Logic: Interact with payment gateway SDK (e.g., Stripe, MoMo API). Return client secret or redirect URL.
// POST /api/payments/webhook (Public, but secured by webhook signature verification)
//   Logic: Handle payment success/failure notifications from payment gateway. Update order status.

// == AI Endpoints (Backend calls Genkit flows, requires Auth) ==
// POST /api/ai/symptom-analyzer
//   Req: { symptomsDescription, imageDataUri? }
//   Logic: Authenticate request. Call Genkit flow: `const result = await genkitFlows.analyzeSymptoms(req.body);`.
//   Maybe log AI interaction. res.json(result);
// POST /api/ai/medical-faq
// POST /api/ai/test-yourself

// == Admin Dashboard & Settings ==
// GET /api/admin/dashboard-stats (Admin only)
//   DB: Aggregate data (total users, orders today, revenue, low stock items etc.)
// GET /api/admin/settings (Admin only)
// PUT /api/admin/settings (Admin only)
//   Req: { settingKey: value, ... }


// --- Global Error Handler (More Specific) ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err.message, err.stack);
//   if (err.name === 'UnauthorizedError') { // Example for JWT errors
//     return res.status(401).json({ error: 'Invalid token.' });
//   }
//   if (err.name === 'ValidationError') { // Example for custom validation errors
//     return res.status(400).json({ error: 'Validation failed.', details: err.errors });
//   }
//   // Default to 500 server error
//   res.status(err.status || 500).json({
//     error: {
//       message: err.message || 'An unexpected error occurred on the server.',
//       ...(process.env.NODE_ENV === 'development' && { stack: err.stack.substring(0, 200) + "..." }), // Truncate stack in dev
//     },
//   });
// });

// --- Server Start ---
// server.listen(PORT, () => {
//   console.log(`MediServe Hub Conceptual Backend Server listening on http://localhost:${PORT}`);
//   console.log(`MediServe Hub Conceptual WebSocket Server available on ws://localhost:${PORT}`);
// });
*/

// This conceptual server.js now provides a more detailed and robust blueprint
// for backend development, covering authentication, data processing for various features,
// and more detailed real-time communication paradigms.
// This file is for guidance and planning, not for direct execution.
```
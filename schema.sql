-- MediServe Hub - Comprehensive Database Schema
-- Version: 2.0
-- Last Updated: (Date of generation)
-- Notes: This schema is designed for a PostgreSQL database.
-- It includes tables for users, roles, profiles, medical data, e-commerce, community features, and real-time communication.

-- Extensions (Optional but recommended for UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === Core User & Authentication Tables ===

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'patient', 'doctor', 'admin', 'seeker'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- For email/phone verification
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(50), -- e.g., 'Male', 'Female', 'Other', 'Prefer not to say'
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    preferred_language VARCHAR(10) DEFAULT 'kn', -- 'en', 'kn', 'fr'
    theme_preference VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    enable_marketing_emails BOOLEAN DEFAULT FALSE,
    enable_app_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_profiles_phone_number ON user_profiles(phone_number);

CREATE TABLE doctor_specialties (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty_id INT REFERENCES doctor_specialties(id),
    medical_license_number VARCHAR(100) UNIQUE,
    years_of_experience INT,
    qualifications TEXT, -- JSONB array or comma-separated
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00, -- For direct consultation if applicable outside of services
    is_available_for_consultation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doctor_profiles_specialty_id ON doctor_profiles(specialty_id);

CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    notes TEXT, -- e.g., 'Lunch break', 'Online only'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_id, day_of_week, start_time, end_time) -- Prevent overlapping default slots
);
CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);

-- === Medical Data Tables ===

CREATE TABLE medical_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    type VARCHAR(50) NOT NULL, -- 'Medical Test', 'Consultation', 'Procedure'
    price NUMERIC(10, 2) NOT NULL,
    duration VARCHAR(100), -- e.g., '30 minutes', 'Results in 24h'
    preparation_instructions_en TEXT,
    preparation_instructions_kn TEXT,
    image_url TEXT,
    ai_hint VARCHAR(100),
    category_en VARCHAR(100),
    category_kn VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medical_services_type ON medical_services(type);
CREATE INDEX idx_medical_services_category_kn ON medical_services(category_kn);


CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    service_id UUID REFERENCES medical_services(id), -- Optional, if booking a specific service
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Rescheduled'
    type VARCHAR(50) NOT NULL, -- 'Online', 'In-Person'
    reason TEXT,
    notes_patient TEXT, -- Notes from patient during booking
    notes_doctor TEXT,  -- Notes from doctor after consultation
    consultation_session_id UUID, -- Link to consultation_sessions if it's an online call
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date_time ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_appointments_status ON appointments(status);

CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_en VARCHAR(100),
    category_kn VARCHAR(100),
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(100), -- e.g., 'Tablet', 'Capsule', 'Syrup'
    strength VARCHAR(100), -- e.g., '500mg', '10mg/5ml'
    requires_prescription BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    ai_hint VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medicines_category_kn ON medicines(category_kn);
CREATE INDEX idx_medicines_name_kn ON medicines(name_kn);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    stock_level INT NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    supplier_info TEXT,
    location_info VARCHAR(255), -- e.g., Shelf A1, Fridge 2
    last_stocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_inventory_medicine_id ON inventory(medicine_id);
CREATE INDEX idx_inventory_expiry_date ON inventory(expiry_date);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id), -- Optional
    date_prescribed DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Completed', 'Expired', 'Cancelled'
    notes TEXT, -- General notes from the doctor for the whole prescription
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    dosage VARCHAR(255) NOT NULL, -- e.g., '1 tablet', '10ml'
    frequency VARCHAR(255) NOT NULL, -- e.g., 'Twice a day', 'Every 6 hours'
    duration VARCHAR(255) NOT NULL, -- e.g., '7 days', 'Until finished'
    instructions TEXT, -- Specific instructions for this medicine
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine_id ON prescription_items(medicine_id);

-- === E-commerce Tables ===

CREATE TABLE cart (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id) -- Assuming one active cart per user
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    inventory_id UUID REFERENCES inventory(id), -- To ensure stock is from a specific batch/price if needed
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_addition NUMERIC(10,2) NOT NULL, -- Price when added to cart, in case it changes in inventory
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, medicine_id, inventory_id) -- Prevent duplicate medicine from same batch in cart
);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_medicine_id ON cart_items(medicine_id);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Payment Failed'
    total_amount NUMERIC(10, 2) NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed'
    transaction_id VARCHAR(255), -- From payment gateway
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    inventory_id UUID REFERENCES inventory(id), -- To track which stock was used
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL, -- Price at the time of order
    sub_total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_medicine_id ON order_items(medicine_id);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id), -- Can be null if payment is for other services
    user_id UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'RWF',
    payment_method VARCHAR(100) NOT NULL, -- 'creditCard', 'mobileMoney', 'bankTransfer'
    provider_transaction_id VARCHAR(255) UNIQUE, -- From Stripe, MoMo, etc.
    status VARCHAR(50) NOT NULL, -- 'Pending', 'Succeeded', 'Failed', 'Refunded'
    payment_details JSONB, -- Store specific details like masked card number, mobile number
    reason TEXT, -- What the payment is for, if not tied to an order
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_provider_transaction_id ON payments(provider_transaction_id);

-- === Community & Support Tables ===

CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    slug VARCHAR(110) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    category_id INT REFERENCES forum_categories(id),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(265) UNIQUE NOT NULL, -- For SEO friendly URLs
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[], -- Array of tags
    image_url TEXT,
    ai_hint VARCHAR(100),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- If comments are disabled
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_slug ON forum_posts(slug);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN(tags);

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES forum_comments(id), -- For threaded comments
    content TEXT NOT NULL,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);
CREATE INDEX idx_forum_comments_parent_comment_id ON forum_comments(parent_comment_id);

CREATE TABLE forum_post_likes (
    user_id UUID NOT NULL REFERENCES users(id),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE forum_comment_likes (
    user_id UUID NOT NULL REFERENCES users(id),
    comment_id UUID NOT NULL REFERENCES forum_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE support_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    long_description_en TEXT,
    long_description_kn TEXT,
    image_url TEXT,
    ai_hint VARCHAR(100),
    category_en VARCHAR(100),
    category_kn VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    admin_id UUID NOT NULL REFERENCES users(id), -- User who created the group
    member_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_support_groups_category_kn ON support_groups(category_kn);
CREATE INDEX idx_support_groups_admin_id ON support_groups(admin_id);

CREATE TYPE group_membership_status AS ENUM ('member', 'pending_approval', 'admin', 'moderator', 'banned');

CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    status group_membership_status DEFAULT 'pending_approval',
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id)
);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX idx_group_memberships_status ON group_memberships(status);

CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    image_url TEXT,
    ai_hint_image VARCHAR(100),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0, -- If implementing comments on group posts
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);
CREATE INDEX idx_group_posts_user_id ON group_posts(user_id);

CREATE TABLE group_post_likes (
    user_id UUID NOT NULL REFERENCES users(id),
    group_post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_post_id)
);

-- === Real-time Communication Tables ===

CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE REFERENCES appointments(id), -- An appointment can have one consultation session
    doctor_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    session_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'initiated', 'active', 'ended', 'cancelled'
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    signaling_server_data JSONB, -- Store WebRTC signaling data if needed (e.g., room ID on media server)
    recording_url TEXT, -- If calls are recorded
    notes TEXT, -- Post-call notes by participants or system
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_consultation_sessions_doctor_id ON consultation_sessions(doctor_id);
CREATE INDEX idx_consultation_sessions_patient_id ON consultation_sessions(patient_id);
CREATE INDEX idx_consultation_sessions_status ON consultation_sessions(session_status);

-- chat_rooms can be consultation_sessions or support_group IDs, or dedicated chat room IDs
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255), -- Optional, e.g., Support Group Chat
    type VARCHAR(50) NOT NULL, -- 'direct_consultation', 'group_chat'
    associated_entity_id UUID, -- e.g., consultation_session_id or support_group_id
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX idx_chat_rooms_associated_entity_id ON chat_rooms(associated_entity_id);

CREATE TABLE chat_room_participants (
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_seen_message_id UUID, -- For read receipts
    PRIMARY KEY (room_id, user_id)
);
CREATE INDEX idx_chat_room_participants_room_id ON chat_room_participants(room_id);
CREATE INDEX idx_chat_room_participants_user_id ON chat_room_participants(user_id);


CREATE TYPE message_content_type AS ENUM ('text', 'image_url', 'file_url', 'system_notification');

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content_type message_content_type DEFAULT 'text',
    message_text TEXT, -- Text content or URL for image/file
    metadata JSONB, -- e.g., for file name, size, or image dimensions
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ -- For individual read receipts, more complex
);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_sent_at ON chat_messages(sent_at);


-- === Notifications Table ===
CREATE TYPE notification_type AS ENUM (
    'new_appointment', 'appointment_reminder', 'appointment_cancelled', 'appointment_confirmed',
    'new_prescription', 'prescription_update',
    'new_forum_post_in_category', 'new_comment_on_post', 'post_liked',
    'new_group_post', 'group_join_request', 'group_join_approved',
    'message_received',
    'medicine_order_placed', 'medicine_order_shipped', 'medicine_order_delivered',
    'payment_successful', 'payment_failed',
    'system_alert', 'account_update'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id), -- The recipient of the notification
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(100), -- e.g., 'appointment', 'prescription', 'forum_post'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);


-- === Audit Log & System Settings (Admin) ===
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id), -- Can be null for system actions
    action VARCHAR(255) NOT NULL, -- e.g., 'USER_LOGIN', 'ADMIN_UPDATED_MEDICINE'
    details JSONB, -- Specifics of the action
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
-- Example settings: INSERT INTO system_settings (key, value, description) VALUES ('maintenance_mode', 'false', 'Enable/disable platform maintenance mode');

-- === Initial Data (Example Roles & Admin User) ===
INSERT INTO roles (name, description) VALUES
('patient', 'Regular patient user with access to booking, orders, community.'),
('doctor', 'Healthcare professional providing consultations and prescriptions.'),
('admin', 'System administrator with full access to manage the platform.'),
('seeker', 'User seeking health information and community support, may not order medicines or book appointments without upgrading to patient.');

INSERT INTO doctor_specialties (name_en, name_kn, description_en, description_kn) VALUES
('General Physician', 'Umuganga Rusange', 'Provides general medical care and diagnosis.', 'Atanga ubuvuzi rusange n\'isuzuma.'),
('Pediatrician', 'Umuganga w\'Abana', 'Specializes in medical care for children.', 'Inzobere mu buvuzi bw\'abana.'),
('Cardiologist', 'Umuganga w\'Umutima', 'Specializes in heart diseases and conditions.', 'Inzobere mu ndwara z\'umutima.'),
('Endocrinologist', 'Umuganga w\'Imisemburo', 'Specializes in hormonal imbalances and glands.', 'Inzobere mu kutaringanira kw\'imisemburo n\'imyanya iyikora.'),
('Neurologist', 'Umuganga w\'Ubwonko n\'Uruhaha', 'Specializes in disorders of the nervous system.', 'Inzobere mu ndwara z\'ubwonko n\'imyakura.');


-- Function to update 'updated_at' columns automatically
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables that need it
-- Example:
-- CREATE TRIGGER set_timestamp_users
-- BEFORE UPDATE ON users
-- FOR EACH ROW
-- EXECUTE FUNCTION trigger_set_timestamp();

-- (Apply to other tables as needed: user_profiles, appointments, medicines, etc.)
-- For simplicity, this is often handled by ORMs or application logic,
-- but it's good practice for direct DB updates.

-- Consider adding more indexes based on query patterns for performance.
-- Example:
-- CREATE INDEX idx_forum_posts_created_at_desc ON forum_posts(created_at DESC);
-- CREATE INDEX idx_appointments_patient_doctor_date ON appointments(patient_id, doctor_id, appointment_date);

-- Further considerations:
-- - Full-text search capabilities (e.g., using tsvector)
-- - More granular permissions model if needed beyond simple roles
-- - Archiving old data
-- - Data validation constraints (CHECK constraints)

-- Note: This schema aims for comprehensiveness for a prototype.
-- Production schemas often involve further normalization, denormalization for performance,
-- and specific choices based on the RDBMS features and application workload.
```</content>
  </change>
  <change>
    <file>/src/server.js</file>
    <content><![CDATA[// MediServe Hub - Conceptual Backend Server (Express.js & WebSocket Example)
// Version: 2.0
// This file outlines a conceptual structure for the backend.
// It does NOT represent a fully functional server but serves as a detailed guide.
// A real backend would use a framework like Express.js, connect to a database (e.g., PostgreSQL using schema.sql),
// implement robust authentication, error handling, real-time communication (WebSockets, WebRTC signaling), and all necessary API endpoints.

console.log("MediServe Hub - Conceptual Backend Server Guide v2.0");

/*
--- Core Technologies (Conceptual Stack) ---
- Node.js: JavaScript runtime environment.
- Express.js: Web framework for Node.js (for REST APIs).
- PostgreSQL: Relational database (schema defined in `schema.sql`).
- `pg` (node-postgres): PostgreSQL client for Node.js.
- `bcryptjs`: For hashing passwords.
- `jsonwebtoken` (JWT): For authentication tokens.
- `ws`: WebSocket library for Node.js (for real-time chat and signaling).
- `cors`, `helmet`, `morgan`: Essential Express middleware.
- Possibly an ORM like Prisma or TypeORM for database interaction.
- Possibly a validation library like Joi or Zod for request payloads.
- Possibly a signaling server for WebRTC if not building from scratch with `ws`.

--- Server Initialization (Conceptual) ---
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg'); // Or your chosen DB client/ORM
// const { nanoid } = require('nanoid'); // For generating unique IDs if not using DB's UUID

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Attach WebSocket server to HTTP server

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-very-strong-and-unique-jwt-secret-key'; // Store in .env
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mediserve_db'; // Store in .env

// --- Database Connection (Conceptual) ---
// const pool = new Pool({ connectionString: DATABASE_URL });
// pool.connect()
//   .then(() => console.log('Conceptual: Database connected successfully.'))
//   .catch(err => console.error('Conceptual: Database connection error:', err.stack));

// --- Middleware ---
app.use(cors({ origin: 'http://localhost:9002' })); // Frontend URL, adjust for production
app.use(helmet()); // Security headers
app.use(express.json({ limit: '10mb' })); // For parsing JSON request bodies, increased for potential image data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // HTTP request logger

// --- Authentication Middleware (Conceptual) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  if (token == null) return res.sendStatus(401); // No token, unauthorized

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.sendStatus(403); // Token invalid or expired, forbidden
    }
    req.user = userPayload; // userPayload contains { id: userId, role: userRole }
    next();
  });
};

// --- Authorization Middleware (Conceptual) ---
const authorizeRole = (allowedRolesArray) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access denied. User role not found.' });
    }
    if (!allowedRolesArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions for this role.' });
    }
    next();
  };
};

// --- WebSocket Server Logic (Conceptual) ---
// This is a simplified model. Production systems might use Redis for scaling client/room management.
const connectedClients = new Map(); // Map<userId, WebSocketConnection>
const chatRooms = new Map(); // Map<roomId, Set<WebSocketConnection>> - roomId could be consultation_id, group_id

wss.on('connection', (ws, req) => {
  // Conceptual: Authenticate WebSocket connection (e.g., token in query param during handshake)
  // const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
  // let userId, userRole;
  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   userId = decoded.id;
  //   userRole = decoded.role;
  //   ws.userId = userId; // Attach userId to WebSocket connection object
  //   ws.userRole = userRole;
  //   connectedClients.set(userId, ws);
  //   console.log(`Conceptual WS: Client ${userId} (Role: ${userRole}) connected.`);
  //   ws.send(JSON.stringify({ type: 'WS_CONNECTION_SUCCESS', payload: { message: 'WebSocket connected successfully.' } }));
  // } catch (err) {
  //   console.error("Conceptual WS: Auth failed for WebSocket connection.", err.message);
  //   ws.close(1008, "Authentication failed");
  //   return;
  // }

  ws.on('message', async (message) => {
    // try {
    //   const parsedMessage = JSON.parse(message.toString());
    //   console.log(`Conceptual WS: Received from ${userId}:`, parsedMessage);

    //   switch (parsedMessage.type) {
    //     // --- Chat Functionality ---
    //     case 'JOIN_CHAT_ROOM': {
    //       // const { roomId } = parsedMessage.payload;
    //       // // DB: Verify user has permission to join this room (e.g., is part of consultation or group)
    //       // const canJoin = await dbCheckUserCanJoinRoom(userId, roomId);
    //       // if (!canJoin) {
    //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not authorized to join this room.' }));
    //       //   break;
    //       // }
    //       // if (!chatRooms.has(roomId)) chatRooms.set(roomId, new Set());
    //       // chatRooms.get(roomId).add(ws);
    //       // ws.roomId = roomId; // Store current room on ws object
    //       // ws.send(JSON.stringify({ type: 'CHAT_ROOM_JOINED', payload: { roomId, message: `Joined room ${roomId}` } }));
    //       // console.log(`Conceptual WS: User ${userId} joined chat room ${roomId}`);
    //       break;
    //     }
    //     case 'LEAVE_CHAT_ROOM': {
    //       // const { roomId } = parsedMessage.payload;
    //       // if (chatRooms.has(roomId) && chatRooms.get(roomId).has(ws)) {
    //       //   chatRooms.get(roomId).delete(ws);
    //       //   if (chatRooms.get(roomId).size === 0) chatRooms.delete(roomId);
    //       //   ws.send(JSON.stringify({ type: 'CHAT_ROOM_LEFT', payload: { roomId } }));
    //       //   console.log(`Conceptual WS: User ${userId} left chat room ${roomId}`);
    //       // }
    //       break;
    //     }
    //     case 'SEND_CHAT_MESSAGE': {
    //       // const { roomId, content, contentType = 'text' } = parsedMessage.payload;
    //       // if (!roomId || !chatRooms.has(roomId) || !chatRooms.get(roomId).has(ws)) {
    //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Not in a valid room to send message.' }));
    //       //   break;
    //       // }
    //       // const messageData = {
    //       //   id: nanoid(), // Or DB generated
    //       //   room_id: roomId,
    //       //   sender_id: userId,
    //       //   sender_name: (await pool.query('SELECT full_name FROM user_profiles WHERE user_id = $1', [userId])).rows[0]?.full_name || 'User',
    //       //   content_type: contentType,
    //       //   message_text: content,
    //       //   sent_at: new Date().toISOString()
    //       // };
    //       // // DB: INSERT INTO chat_messages (...) VALUES (...)
    //       // await pool.query('INSERT INTO chat_messages (room_id, sender_id, content_type, message_text) VALUES ($1, $2, $3, $4)',
    //       //   [roomId, userId, contentType, content]);
    //       // chatRooms.get(roomId).forEach(client => {
    //       //   if (client.readyState === WebSocket.OPEN) {
    //       //     client.send(JSON.stringify({ type: 'NEW_CHAT_MESSAGE', payload: messageData }));
    //       //   }
    //       // });
    //       break;
    //     }

    //     // --- WebRTC Signaling for Video/Audio Calls ---
    //     // A 'call_room_id' would typically be a consultation_session_id or a unique ID for the call.
    //     case 'WEBRTC_JOIN_CALL_ROOM': { // User initiates or joins a call
    //       // const { callRoomId, appointmentId } = parsedMessage.payload;
    //       // ws.callRoomId = callRoomId;
    //       // // Logic: if this is the first user (e.g., doctor initiating), create/mark session in DB.
    //       // // If second user (patient joining), notify the first user.
    //       // // Manage participants in this callRoomId (similar to chatRooms but could be simpler for 1-to-1)
    //       // console.log(`Conceptual WS: User ${userId} wants to join call room ${callRoomId} for appointment ${appointmentId}`);
    //       // const otherParticipantId = await getOtherParticipantInCall(callRoomId, userId); // DB lookup
    //       // const otherWs = connectedClients.get(otherParticipantId);
    //       // if (otherWs && otherWs.readyState === WebSocket.OPEN) {
    //       //    otherWs.send(JSON.stringify({ type: 'WEBRTC_USER_JOINED', payload: { userId, callRoomId } }));
    //       //    ws.send(JSON.stringify({ type: 'WEBRTC_READY_FOR_SIGNALING', payload: { callRoomId, otherUserId: otherParticipantId } }));
    //       // } else {
    //       //    ws.send(JSON.stringify({ type: 'WEBRTC_WAITING_FOR_OTHER_USER', payload: { callRoomId } }));
    //       // }
    //       break;
    //     }
    //     case 'WEBRTC_OFFER':
    //     case 'WEBRTC_ANSWER':
    //     case 'WEBRTC_ICE_CANDIDATE': {
    //       // const { targetUserId, callRoomId, signalData } = parsedMessage.payload;
    //       // const targetClient = connectedClients.get(targetUserId);
    //       // if (targetClient && targetClient.readyState === WebSocket.OPEN && targetClient.callRoomId === callRoomId) {
    //       //   targetClient.send(JSON.stringify({
    //       //     type: parsedMessage.type, // Relay the original type
    //       //     payload: { senderId: userId, signalData }
    //       //   }));
    //       //   console.log(`Conceptual WS: Relayed ${parsedMessage.type} from ${userId} to ${targetUserId} in room ${callRoomId}`);
    //       // } else {
    //       //   console.log(`Conceptual WS: Target ${targetUserId} not found/ready for WebRTC signal in room ${callRoomId}.`);
    //       //   ws.send(JSON.stringify({ type: 'ERROR', payload: `User ${targetUserId} not available for signaling.` }));
    //       // }
    //       break;
    //     }
    //     case 'WEBRTC_END_CALL': {
    //       // const { callRoomId, targetUserId } = parsedMessage.payload;
    //       // // DB: Update consultation_sessions status to 'ended'.
    //       // const targetClient = connectedClients.get(targetUserId);
    //       // if (targetClient && targetClient.readyState === WebSocket.OPEN) {
    //       //    targetClient.send(JSON.stringify({ type: 'WEBRTC_CALL_ENDED', payload: { callRoomId, endedBy: userId } }));
    //       // }
    //       // ws.send(JSON.stringify({ type: 'WEBRTC_CALL_ENDED_CONFIRMED', payload: {callRoomId }}));
    //       // delete ws.callRoomId;
    //       // // Clean up call room if necessary
    //       // console.log(`Conceptual WS: User ${userId} ended call in room ${callRoomId}`);
    //       break;
    //     }
    //     default:
    //       // ws.send(JSON.stringify({ type: 'ERROR', payload: 'Unknown message type' }));
    //       break;
    //   }
    // } catch (e) {
    //   console.error('Conceptual WS: Failed to process message or invalid JSON', e, message.toString());
    //   ws.send(JSON.stringify({ type: 'ERROR', payload: 'Invalid message format' }));
    // }
  });

  ws.on('close', () => {
    // console.log(`Conceptual WS: Client ${userId} (Role: ${userRole}) disconnected.`);
    // connectedClients.delete(userId);
    // // Clean up from chat rooms and call rooms
    // if (ws.roomId && chatRooms.has(ws.roomId)) {
    //   chatRooms.get(ws.roomId).delete(ws);
    //   if (chatRooms.get(ws.roomId).size === 0) chatRooms.delete(ws.roomId);
    // }
    // if (ws.callRoomId) {
    //   // Notify other participant in call room if any
    //   // Clean up call room data
    // }
  });

  ws.on('error', (error) => {
    // console.error(`Conceptual WS: Error for client ${userId}:`, error);
  });
});

// --- API Endpoints (Conceptual) ---

// == User Authentication & Management ==
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  // const { fullName, email, password, phone, roleName } = req.body;
  // // Input validation (e.g., using Zod or Joi)
  // if (!fullName || !email || !password || !roleName ) return res.status(400).json({ error: 'Missing required fields for registration.' });
  // if (roleName === 'admin') return res.status(403).json({ error: 'Admin registration is not allowed through this endpoint.' });

  // try {
  //   const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [roleName]);
  //   if (roleResult.rows.length === 0) return res.status(400).json({ error: 'Invalid role specified.' });
  //   const roleId = roleResult.rows[0].id;

  //   const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  //   if (existingUser.rows.length > 0) return res.status(409).json({ error: 'Email already registered.' });

  //   const salt = await bcrypt.genSalt(10);
  //   const hashedPassword = await bcrypt.hash(password, salt);

  //   const client = await pool.connect();
  //   try {
  //     await client.query('BEGIN');
  //     const userInsertResult = await client.query(
  //       'INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id',
  //       [email, hashedPassword, roleId]
  //     );
  //     const userId = userInsertResult.rows[0].id;
  //     await client.query(
  //       'INSERT INTO user_profiles (user_id, full_name, phone_number) VALUES ($1, $2, $3)',
  //       [userId, fullName, phone || null]
  //     );
  //     // For doctors, create an entry in doctor_profiles
  //     // if (roleName === 'doctor') {
  //     //   await client.query('INSERT INTO doctor_profiles (user_id) VALUES ($1)', [userId]); // Add more fields later
  //     // }
  //     await client.query('COMMIT');

  //     const token = jwt.sign({ id: userId, role: roleName, email: email }, JWT_SECRET, { expiresIn: '24h' });
  //     res.status(201).json({
  //       message: 'User registered successfully. Please check your email for verification (conceptual).',
  //       token,
  //       user: { id: userId, fullName, email, roleName }
  //     });
  //   } catch (dbError) {
  //     await client.query('ROLLBACK');
  //     console.error('DB Error during registration:', dbError);
  //     res.status(500).json({ error: 'Database error during registration.' });
  //   } finally {
  //     client.release();
  //   }
  // } catch (err) {
  //   console.error('Registration error:', err);
  //   res.status(500).json({ error: 'Server error during registration.' });
  // }
  res.status(501).json({ message: 'Conceptual: Register endpoint hit. Not implemented yet.' });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  // const { email, password, role } = req.body; // role from client can help narrow down if needed, but email should be unique
  // if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  // try {
  //   const userResult = await pool.query(
  //     'SELECT u.id, u.email, u.password_hash, r.name as role_name, p.full_name, p.profile_image_url, p.preferred_language, p.theme_preference FROM users u JOIN roles r ON u.role_id = r.id JOIN user_profiles p ON u.id = p.user_id WHERE u.email = $1 AND u.is_active = TRUE',
  //     [email]
  //   );

  //   if (userResult.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials or user not active.' });
  //   const user = userResult.rows[0];

  //   // If role was passed and doesn't match, it's an issue (e.g. trying to log into patient portal as doctor)
  //   // if (role && role !== user.role_name) {
  //   //   return res.status(401).json({ error: `Not authorized for ${role} portal with these credentials.` });
  //   // }

  //   const isMatch = await bcrypt.compare(password, user.password_hash);
  //   if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });

  //   const token = jwt.sign({ id: user.id, role: user.role_name, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  //   await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
  //   res.json({
  //     message: 'Login successful.',
  //     token,
  //     user: { id: user.id, fullName: user.full_name, email: user.email, roleName: user.role_name, profileImageUrl: user.profile_image_url, preferredLanguage: user.preferred_language, themePreference: user.theme_preference },
  //   });
  // } catch (err) {
  //   console.error('Login error:', err);
  //   res.status(500).json({ error: 'Server error during login.' });
  // }
  res.status(501).json({ message: 'Conceptual: Login endpoint hit. Not implemented yet.' });
});

// POST /api/auth/admin/login
app.post('/api/auth/admin/login', async (req, res) => {
  // Similar to user login, but specifically for the admin role.
  // const { email, password } = req.body;
  // if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  // try {
  //   const userResult = await pool.query( /* ... query ... */ );
  //   if (userResult.rows.length === 0 || userResult.rows[0].role_name !== 'admin') {
  //     return res.status(401).json({ error: 'Invalid admin credentials or user not an admin.' });
  //   }
  //   // ... rest of login logic ...
  // } catch (err) { /* ... */ }
  res.status(501).json({ message: 'Conceptual: Admin Login endpoint hit. Not implemented yet.' });
});

// GET /api/users/me (Requires Auth)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // try {
  //   // Fetch detailed user profile from users, user_profiles, and doctor_profiles if applicable
  //   const query = `
  //     SELECT
  //       u.id, u.email, u.is_verified, u.created_at as user_created_at,
  //       r.name as role_name,
  //       p.full_name, p.phone_number, p.date_of_birth, p.gender, p.address, p.city, p.country,
  //       p.profile_image_url, p.bio, p.preferred_language, p.theme_preference,
  //       p.emergency_contact_name, p.emergency_contact_phone, p.enable_marketing_emails, p.enable_app_notifications,
  //       dp.specialty_id, ds.name_en as specialty_name_en, ds.name_kn as specialty_name_kn,
  //       dp.medical_license_number, dp.years_of_experience, dp.qualifications, dp.consultation_fee
  //     FROM users u
  //     JOIN roles r ON u.role_id = r.id
  //     JOIN user_profiles p ON u.id = p.user_id
  //     LEFT JOIN doctor_profiles dp ON u.id = dp.user_id AND r.name = 'doctor'
  //     LEFT JOIN doctor_specialties ds ON dp.specialty_id = ds.id
  //     WHERE u.id = $1;
  //   `;
  //   const profileResult = await pool.query(query, [userId]);
  //   if (profileResult.rows.length === 0) return res.status(404).json({ error: 'User profile not found.' });
  //   res.json({ user: profileResult.rows[0] });
  // } catch (err) {
  //   console.error('Get my profile error:', err);
  //   res.status(500).json({ error: 'Server error fetching profile.' });
  // }
  res.status(501).json({ message: 'Conceptual: GET /api/users/me hit. Not implemented yet.' });
});

// PUT /api/users/me (Requires Auth)
app.put('/api/users/me', authenticateToken, async (req, res) => {
  // const userId = req.user.id;
  // const {
  //   fullName, phone, dob, gender, address, city, country, bio, profileImageUrl,
  //   preferredLanguage, themePreference, emergencyContactName, emergencyContactPhone,
  //   enableMarketingEmails, enableAppNotifications,
  //   currentPassword, newPassword, // For password change
  //   // Doctor specific fields if user is a doctor
  //   specialtyId, medicalLicenseNumber, yearsOfExperience, qualifications, consultationFee, isAvailableForConsultation
  // } = req.body;

  // // Update user_profiles table...
  // // If newPassword and currentPassword, verify currentPassword and update password_hash in users table...
  // // If user is doctor, update doctor_profiles table...
  // // Return updated profile
  res.status(501).json({ message: 'Conceptual: PUT /api/users/me hit. Not implemented yet.' });
});


// == Admin User Management (Admin only) ==
// GET /api/admin/users
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
  // // Build dynamic SQL query with pagination, search, and filters for users, user_profiles, roles
  // // Return { users: [...], totalCount,totalPages, currentPage }
  res.status(501).json({ message: 'Conceptual: GET /api/admin/users hit. Not implemented yet.' });
});

// GET /api/admin/users/:userId
app.get('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // const { userId } = req.params;
  // // Fetch specific user details for admin view
  res.status(501).json({ message: 'Conceptual: GET /api/admin/users/:userId hit. Not implemented yet.' });
});

// PUT /api/admin/users/:userId (Admin can update user's role, active status, profile, etc.)
app.put('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // const { userId } = req.params;
  // const { roleId, isActive, /* other fields from user_profiles or doctor_profiles */ } = req.body;
  // // Update users table (role_id, is_active)
  // // Update user_profiles table
  // // Update doctor_profiles table if applicable
  res.status(501).json({ message: 'Conceptual: PUT /api/admin/users/:userId hit. Not implemented yet.' });
});

// DELETE /api/admin/users/:userId (Soft delete or hard delete based on policy)
app.delete('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  // const { userId } = req.params;
  // // Option 1: Soft delete (e.g., UPDATE users SET is_active = FALSE WHERE id = $1)
  // // Option 2: Hard delete (DELETE FROM users WHERE id = $1) - careful with cascades
  res.status(501).json({ message: 'Conceptual: DELETE /api/admin/users/:userId hit. Not implemented yet.' });
});


// == Medicines, Inventory, Services (Admin CRUD) ==
// GET /api/medicines (Public, with search/filter)
// POST /api/admin/medicines (Admin only)
// PUT /api/admin/medicines/:medicineId (Admin only)
// DELETE /api/admin/medicines/:medicineId (Admin only)

// GET /api/admin/inventory (Admin only)
// POST /api/admin/inventory (Admin only)
// PUT /api/admin/inventory/:inventoryId (Admin only)
// DELETE /api/admin/inventory/:inventoryId (Admin only)

// GET /api/medical-services (Public, with search/filter)
// POST /api/admin/medical-services (Admin only)
// PUT /api/admin/medical-services/:serviceId (Admin only)
// DELETE /api/admin/medical-services/:serviceId (Admin only)


// == Appointments ==
// POST /api/appointments (Auth: patient, seeker)
//   Req: { doctorId, serviceId, date, time, reason, type }
//   Logic: Check doctor availability, check for conflicts, create appointment.
//   DB: INSERT INTO appointments.
//   Notification: Send to doctor and patient.
// GET /api/appointments/my (Auth: patient, seeker, doctor)
//   Logic: Fetch based on user role.
// PUT /api/appointments/:appointmentId/status (Auth: patient, doctor, admin)
//   Req: { status: 'Confirmed' | 'Cancelled' | 'Completed' | 'Rescheduled' }
//   Logic: Permissions check (e.g., patient can cancel pending, doctor can confirm).


// == Prescriptions ==
// POST /api/prescriptions (Auth: doctor)
//   Req: { patientId, appointmentId?, medicines: [{ medicineId, dosage, frequency, duration, instructions }], notes }
//   DB: INSERT INTO prescriptions and prescription_items.
// GET /api/prescriptions/my (Auth: patient)
// GET /api/prescriptions/doctor/:doctorId (Auth: doctor for their own, or admin)


// == Online Consultation & Chat History API ==
// POST /api/consultations/:appointmentId/initiate (Auth: doctor)
//   Logic: Create a consultation_sessions record for the appointment, mark as 'initiated'.
//   Create a chat_rooms record for this session if not exists.
//   Res: { consultationSessionId, chatRoomId }
// GET /api/chat/rooms/:roomId/messages (Auth: participants of the room)
//   Params: roomId (could be consultation_session_id or group_id)
//   Query: limit, before (timestamp for pagination)
//   DB: SELECT m.*, p.full_name as sender_name FROM chat_messages m JOIN user_profiles p ON m.sender_id = p.user_id WHERE m.room_id = $1 ORDER BY m.sent_at DESC ...
//   Res: { messages: [...] }

// == Community (Forums, Groups) ==
// (Conceptual CRUD for forum_posts, forum_comments, support_groups, group_posts, memberships etc.)
// Example: POST /api/forums/posts (Auth required)
//   Req: { categoryId, title, content, tags? }
//   DB: INSERT INTO forum_posts. Update category post count.
//   Notification: To followers of the category if implemented.
// Example: POST /api/support-groups/:groupId/join (Auth required)
//   Logic: If public, add to group_memberships directly. If private, set status to 'pending_approval'.
//   Notification: To group admin if private.


// == E-commerce (Cart, Orders, Payments) ==
// POST /api/cart/items (Auth: patient, seeker) Req: { medicineId, quantity }
// GET /api/cart (Auth: patient, seeker)
// POST /api/orders (Auth: patient, seeker) - From cart
// POST /api/payments/initiate (Auth: patient, seeker) Req: { orderId?, amount, paymentMethod, reason, ... }


// == AI Endpoints (Backend calls Genkit flows) ==
// POST /api/ai/symptom-analyzer (Auth: any authenticated user)
//   Req: { symptomsDescription, imageDataUri? }
//   Logic: const result = await genkitFlows.analyzeSymptoms(req.body); res.json(result);
// POST /api/ai/medical-faq (Auth: any authenticated user)
// POST /api/ai/test-yourself (Auth: any authenticated user)


// == Admin Dashboard & Settings ==
// GET /api/admin/dashboard-stats (Admin only)
// GET /api/admin/settings (Admin only)
// PUT /api/admin/settings (Admin only)


// --- Global Error Handler ---
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err.stack);
//   res.status(err.status || 500).json({
//     error: {
//       message: err.message || 'An unexpected error occurred.',
//       ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//     },
//   });
// });

// --- Server Start ---
// server.listen(PORT, () => {
//   console.log(`MediServe Hub Conceptual Backend Server listening on http://localhost:${PORT}`);
//   console.log(`MediServe Hub Conceptual WebSocket Server available on ws://localhost:${PORT}`);
// });
*/

// This conceptual server.js now provides a more detailed blueprint for backend development,
// including data processing for various features, authentication, and real-time communication paradigms.
// Remember, this is NOT runnable code but a guide.
```</content>
  </change>
  <change>
    <file>/src/app/layout.tsx</file>
    <content><![CDATA[
"use client"; 

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React, { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); 

    // Set default language to Kinyarwanda on initial load
    document.documentElement.lang = 'kn';

    // Apply theme based on OS preference if no theme is already set
    const hasThemeClass = document.documentElement.classList.contains('light') || document.documentElement.classList.contains('dark');
    
    if (!hasThemeClass) { // Only apply OS theme if no theme class is present
      if (typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        // Default to light theme if OS preference is not dark or not detectable, and no theme is set
        document.documentElement.classList.add('light'); 
      }
    }
  }, []);

  return (
    <html lang="kn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <title>MediServe Hub</title>
        <meta name="description" content="Umufasha wawe w'Ubuzima Byose Hamwe" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background flex flex-col">
        {children}
        {isClient && <Toaster />}
      </body>
    </html>
  );
}

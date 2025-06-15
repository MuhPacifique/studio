-- MediServe Hub - Comprehensive SQL Schema
-- This schema is designed to support all features of the MediServe Hub application,
-- including user management, medical services, e-commerce, community features,
-- and real-time communication.

-- Drop existing tables (optional, for a clean slate during development)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medicine_categories CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS medical_services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_post_likes CASCADE;
DROP TABLE IF EXISTS support_groups CASCADE;
DROP TABLE IF EXISTS support_group_categories CASCADE;
DROP TABLE IF EXISTS support_group_members CASCADE;
DROP TABLE IF EXISTS support_group_posts CASCADE;
DROP TABLE IF EXISTS support_group_post_likes CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS consultation_sessions CASCADE; -- For video/audio call signaling

-- --- User Management ---

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'patient', 'doctor', 'admin', 'seeker'
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE, -- Email/phone verification status
    verification_token VARCHAR(100),
    verification_token_expires_at TIMESTAMPTZ,
    password_reset_token VARCHAR(100),
    password_reset_token_expires_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    preferred_language VARCHAR(5) DEFAULT 'kn', -- 'kn', 'en', 'fr'
    theme_preference VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    enable_marketing_emails BOOLEAN DEFAULT FALSE,
    enable_app_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('patient', 'Regular patient user'),
('doctor', 'Healthcare provider'),
('admin', 'System administrator'),
('seeker', 'User seeking health information without full patient services');

-- --- Medical Information & E-commerce ---

CREATE TABLE medicine_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_id INTEGER REFERENCES medicine_categories(id),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    image_url TEXT, -- URL to medicine image
    requires_prescription BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
    medicine_id UUID PRIMARY KEY REFERENCES medicines(id) ON DELETE CASCADE,
    stock_level INTEGER NOT NULL CHECK (stock_level >= 0),
    expiry_date DATE,
    supplier_info TEXT,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medical_services ( -- For lab tests, consultation types, procedures
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_id INTEGER REFERENCES service_categories(id),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration_estimate VARCHAR(100), -- e.g., '30 minutes', 'Results in 24h'
    preparation_instructions_en TEXT,
    preparation_instructions_kn TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --- Appointments & Prescriptions ---

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID REFERENCES users(id), -- Doctor is also a user
    service_id UUID REFERENCES medical_services(id), -- Optional, if booking a specific service
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled', 'Completed'
    type VARCHAR(20) NOT NULL, -- 'Online', 'In-Person'
    consultation_notes TEXT, -- Doctor's notes after appointment
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_doctor_role CHECK (doctor_id IS NULL OR (SELECT role_id FROM users WHERE id = doctor_id) = (SELECT id FROM roles WHERE name = 'doctor')),
    CONSTRAINT chk_patient_role CHECK ((SELECT role_id FROM users WHERE id = patient_id) = (SELECT id FROM roles WHERE name = 'patient') OR (SELECT role_id FROM users WHERE id = patient_id) = (SELECT id FROM roles WHERE name = 'seeker'))
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id),
    doctor_id UUID NOT NULL REFERENCES users(id),
    appointment_id UUID REFERENCES appointments(id), -- Optional link to appointment
    date_prescribed DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT, -- Doctor's general notes for the prescription
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Completed', 'Expired', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_pres_doctor_role CHECK ((SELECT role_id FROM users WHERE id = doctor_id) = (SELECT id FROM roles WHERE name = 'doctor')),
    CONSTRAINT chk_pres_patient_role CHECK ((SELECT role_id FROM users WHERE id = patient_id) = (SELECT id FROM roles WHERE name = 'patient'))
);

CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    dosage VARCHAR(255) NOT NULL, -- e.g., '1 tablet', '10ml'
    frequency VARCHAR(255) NOT NULL, -- e.g., 'Twice a day', 'Every 6 hours'
    duration VARCHAR(255) NOT NULL, -- e.g., '7 days', 'Until finished'
    instructions TEXT, -- Specific instructions for this medicine
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --- Community Support ---

CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES forum_categories(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(50)[], -- Array of tags
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0
);

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES forum_comments(id), -- For threaded comments
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_post_likes (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE support_group_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_kn VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_kn TEXT
);

CREATE TABLE support_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    category_id INTEGER REFERENCES support_group_categories(id),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    long_description_en TEXT,
    long_description_kn TEXT,
    image_url TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_group_members (
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member', -- 'member', 'moderator'
    join_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'pending_approval', 'banned'
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE support_group_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    text_content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_group_post_likes (
    post_id UUID NOT NULL REFERENCES support_group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- --- Orders & Payments ---

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    shipping_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_at_order DECIMAL(10, 2) NOT NULL, -- Price at the time of order
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id), -- Can be null if payment is for other services
    user_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'Credit Card', 'Mobile Money', 'Bank Transfer'
    payment_provider_reference VARCHAR(255), -- e.g., Stripe Charge ID, MoMo Transaction ID
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed'
    reason_for_payment TEXT, -- e.g., "Order #123", "Consultation Fee for Dr. X"
    transaction_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --- Notifications ---

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50), -- 'appointment_reminder', 'prescription_ready', 'new_forum_reply', 'system_alert'
    title TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    link_url TEXT, -- URL to navigate to when notification is clicked
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- --- Real-time Communication (Chat & Video/Audio Call Signaling) ---

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255), -- Optional, for group chats or named rooms
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    -- Could add type: 'direct_message', 'group_consultation'
);

CREATE TABLE chat_room_participants (
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image_url', 'file_url'
    message_text TEXT,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ -- For read receipts
);

-- Table for managing signaling for WebRTC (conceptual)
-- Actual WebRTC signaling is complex and usually involves a dedicated signaling server.
-- This table is a highly simplified representation for storing session info.
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id), -- Link to the scheduled appointment
    doctor_id UUID NOT NULL REFERENCES users(id),
    patient_id UUID NOT NULL REFERENCES users(id),
    session_status VARCHAR(20) DEFAULT 'initiated', -- 'initiated', 'active', 'ended', 'failed'
    -- Signaling data (simplified - in reality, this would be more complex and handled by a signaling server)
    doctor_offer_sdp TEXT,
    patient_answer_sdp TEXT,
    doctor_ice_candidates JSONB, -- Store as JSON array
    patient_ice_candidates JSONB, -- Store as JSON array
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cs_doctor_role CHECK ((SELECT role_id FROM users WHERE id = doctor_id) = (SELECT id FROM roles WHERE name = 'doctor')),
    CONSTRAINT chk_cs_patient_role CHECK ((SELECT role_id FROM users WHERE id = patient_id) = (SELECT id FROM roles WHERE name = 'patient'))
);


-- --- Indexes for Performance ---
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_medicines_name_en ON medicines(name_en);
CREATE INDEX idx_medicines_name_kn ON medicines(name_kn);
CREATE INDEX idx_medicines_category_id ON medicines(category_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_support_groups_admin_id ON support_groups(admin_id);
CREATE INDEX idx_support_group_members_group_id ON support_group_members(group_id);
CREATE INDEX idx_support_group_members_user_id ON support_group_members(user_id);
CREATE INDEX idx_support_group_posts_group_id ON support_group_posts(group_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_consultation_sessions_appointment_id ON consultation_sessions(appointment_id);

-- Triggers to update 'updated_at' timestamps (Example for one table, apply to others)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add similar triggers for other tables: medicines, medical_services, appointments, prescriptions, etc.
-- ... (for brevity, not listing all trigger creations here)

-- Example: Mock Data Insertion (Conceptual - use for testing if needed)
/*
-- Roles already inserted

-- Example Users
INSERT INTO users (id, email, password_hash, role_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'patient@example.com', '$2b$10$abcdefghijklmnopqrstuv', (SELECT id FROM roles WHERE name = 'patient')),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'doctor@example.com', '$2b$10$abcdefghijklmnopqrstuv', (SELECT id FROM roles WHERE name = 'doctor')),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'admin@example.com', '$2b$10$abcdefghijklmnopqrstuv', (SELECT id FROM roles WHERE name = 'admin')),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'seeker@example.com', '$2b$10$abcdefghijklmnopqrstuv', (SELECT id FROM roles WHERE name = 'seeker'));

-- Example User Profiles
INSERT INTO user_profiles (user_id, full_name, phone_number, preferred_language) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Patty Patient', '0781111111', 'kn'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Dr. Alex Smith', '0782222222', 'en'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Admin User', '0783333333', 'kn'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Sam Seeker', '0784444444', 'en');

-- Example Medicine Categories
INSERT INTO medicine_categories (name_en, name_kn) VALUES
('Pain Relief', 'Igabanya Ububabare'),
('Antibiotics', 'Antibiyotike'),
('Allergy Relief', 'Igabanya Aleriji'),
('Vitamins', 'Vitamini');

-- Example Medicines
INSERT INTO medicines (name_en, name_kn, category_id, unit_price, requires_prescription) VALUES
('Paracetamol 500mg', 'Parasetamoli 500mg', (SELECT id FROM medicine_categories WHERE name_en = 'Pain Relief'), 50, FALSE),
('Amoxicillin 250mg', 'Amogisiline 250mg', (SELECT id FROM medicine_categories WHERE name_en = 'Antibiotics'), 150, TRUE);

-- Example Inventory
INSERT INTO inventory (medicine_id, stock_level, expiry_date) VALUES
((SELECT id FROM medicines WHERE name_en = 'Paracetamol 500mg'), 150, '2025-12-31'),
((SELECT id FROM medicines WHERE name_en = 'Amoxicillin 250mg'), 80, '2024-10-30');
*/

-- End of Schema
-- Note: For a production environment, consider more detailed constraints, data validation rules,
-- and security measures (e.g., row-level security for multi-tenant data if applicable).
-- Also, password_hash should be generated using a strong hashing algorithm like bcrypt or Argon2.
-- UUIDs are used for primary keys for better scalability and to avoid guessing sequential IDs.
```
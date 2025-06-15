-- MediServe Hub Database Schema
-- Version 3.0: Comprehensive and Robust Design for Full-Stack Features

-- Drop existing tables in reverse order of dependency to avoid conflicts if schema is re-run
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payment_webhook_logs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS group_post_likes CASCADE;
DROP TABLE IF EXISTS group_posts CASCADE;
DROP TABLE IF EXISTS group_memberships CASCADE;
DROP TABLE IF EXISTS support_groups CASCADE;
DROP TABLE IF EXISTS forum_post_tags CASCADE;
DROP TABLE IF EXISTS forum_tags CASCADE;
DROP TABLE IF EXISTS forum_post_likes CASCADE;
DROP TABLE IF EXISTS forum_comments CASCADE;
DROP TABLE IF EXISTS forum_posts CASCADE;
DROP TABLE IF EXISTS forum_categories CASCADE;
DROP TABLE IF EXISTS consultation_sessions CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS doctor_schedules CASCADE;
DROP TABLE IF EXISTS doctor_specialties CASCADE;
DROP TABLE IF EXISTS specialties CASCADE;
DROP TABLE IF EXISTS doctor_profiles CASCADE;
DROP TABLE IF EXISTS medicine_inventory_logs CASCADE;
DROP TABLE IF EXISTS medicine_inventory CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medical_services CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Extension for UUID generation if not using SERIAL PRIMARY KEY
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Table: Defines user roles (Patient, Doctor, Admin, Seeker)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'patient', 'doctor', 'admin', 'seeker'
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users Table: Core user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255) UNIQUE,
    verification_token_expires_at TIMESTAMPTZ,
    password_reset_token VARCHAR(255) UNIQUE,
    password_reset_token_expires_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until TIMESTAMPTZ,
    refresh_token_hash VARCHAR(255), -- Store hashed refresh tokens
    refresh_token_expires_at TIMESTAMPTZ,
    two_factor_secret VARCHAR(255),
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- User Profiles Table: Extended user information
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50), -- e.g., 'Male', 'Female', 'Other', 'Prefer not to say'
    phone_number VARCHAR(20) UNIQUE,
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    profile_image_url TEXT, -- URL to cloud storage
    bio TEXT,
    preferred_language VARCHAR(10) DEFAULT 'kn', -- 'en', 'kn', 'fr'
    theme_preference VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Specialties Table: Medical specialties
CREATE TABLE specialties (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Profiles Table: Specific information for doctors
CREATE TABLE doctor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, -- User must have 'doctor' role
    medical_license_number VARCHAR(100) UNIQUE NOT NULL,
    years_of_experience INTEGER,
    qualifications TEXT, -- Store as JSON array or comma-separated string
    clinic_address TEXT,
    consultation_fee NUMERIC(10, 2), -- RWF
    is_verified_doctor BOOLEAN DEFAULT FALSE, -- Admin verified
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Specialties Table: Many-to-many relationship between doctors and specialties
CREATE TABLE doctor_specialties (
    doctor_user_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    specialty_id INTEGER NOT NULL REFERENCES specialties(id) ON DELETE CASCADE,
    PRIMARY KEY (doctor_user_id, specialty_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Schedules Table: Doctor's availability
CREATE TABLE doctor_schedules (
    id SERIAL PRIMARY KEY,
    doctor_user_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    break_start_time TIME,
    break_end_time TIME,
    notes TEXT, -- e.g., specific dates unavailable within this general schedule
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_user_id, day_of_week, start_time) -- Prevent overlapping general schedules
);
CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_user_id);

-- Medical Services Table: Tests, Consultations, Procedures offered
CREATE TABLE medical_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    service_type VARCHAR(50) NOT NULL, -- 'Medical Test', 'Consultation', 'Procedure'
    price NUMERIC(10, 2) NOT NULL, -- RWF
    duration_minutes INTEGER, -- For consultations/procedures
    turnaround_time_desc_en VARCHAR(100), -- e.g., 'Results in 24h', 'Approx 30 mins'
    turnaround_time_desc_kn VARCHAR(100),
    preparation_instructions_en TEXT,
    preparation_instructions_kn TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    category_en VARCHAR(100), -- e.g., 'Hematology', 'Cardiology', 'General Consultation'
    category_kn VARCHAR(100),
    created_by_user_id UUID REFERENCES users(id), -- Admin who added it
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Medicines Table: Information about medicines
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_en VARCHAR(100), -- e.g., 'Pain Relief', 'Antibiotics', 'Vitamins'
    category_kn VARCHAR(100),
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(50), -- e.g., 'Tablet', 'Capsule', 'Syrup', 'Injection'
    requires_prescription BOOLEAN DEFAULT TRUE,
    image_url TEXT, -- URL to cloud storage
    is_active BOOLEAN DEFAULT TRUE,
    created_by_user_id UUID REFERENCES users(id), -- Admin who added it
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medicines_name_kn ON medicines(name_kn);
CREATE INDEX idx_medicines_category_kn ON medicines(category_kn);

-- Medicine Inventory Table: Stock levels, expiry, supplier for each medicine
CREATE TABLE medicine_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE, -- Stock Keeping Unit
    stock_level INTEGER NOT NULL DEFAULT 0,
    unit_price NUMERIC(10, 2) NOT NULL, -- Selling price per unit (e.g., per tablet, per bottle)
    cost_price NUMERIC(10, 2), -- Purchase price
    expiry_date DATE NOT NULL,
    batch_number VARCHAR(100),
    supplier VARCHAR(255),
    location_in_pharmacy VARCHAR(100), -- e.g., 'Shelf A1', 'Fridge 2'
    low_stock_threshold INTEGER DEFAULT 10,
    last_updated_by_user_id UUID REFERENCES users(id), -- Admin who updated stock
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (medicine_id, batch_number) -- A medicine can have multiple batches
);
CREATE INDEX idx_medicine_inventory_medicine_id ON medicine_inventory(medicine_id);
CREATE INDEX idx_medicine_inventory_expiry_date ON medicine_inventory(expiry_date);

-- Medicine Inventory Logs Table: Track changes to inventory
CREATE TABLE medicine_inventory_logs (
    id SERIAL PRIMARY KEY,
    inventory_id UUID NOT NULL REFERENCES medicine_inventory(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- User who made the change (admin, or system for order fulfillment)
    change_type VARCHAR(50) NOT NULL, -- e.g., 'stock_added', 'stock_removed_order', 'expired', 'manual_adjustment'
    quantity_changed INTEGER NOT NULL,
    previous_stock_level INTEGER,
    new_stock_level INTEGER,
    reason TEXT,
    log_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_user_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    service_id UUID REFERENCES medical_services(id), -- Optional, could be general consultation
    appointment_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30, -- Default duration if not specified by service
    appointment_type VARCHAR(50) NOT NULL, -- 'Online', 'In-Person'
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Cancelled_By_Patient', 'Cancelled_By_Doctor', 'Completed', 'No_Show'
    reason_for_visit TEXT,
    notes_from_patient TEXT,
    notes_from_doctor TEXT, -- Post-consultation notes
    cancellation_reason TEXT,
    rescheduled_from_appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_user_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_user_id UUID NOT NULL REFERENCES doctor_profiles(user_id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL, -- Optional link
    date_prescribed DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'Active', -- 'Active', 'Completed' (all meds taken), 'Expired' (validity period passed)
    notes_for_patient TEXT,
    notes_for_pharmacist TEXT,
    valid_until_date DATE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items Table: Individual medicines in a prescription
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    dosage VARCHAR(255) NOT NULL, -- e.g., '1 tablet', '10ml'
    frequency VARCHAR(255) NOT NULL, -- e.g., '3 times a day', 'Every 8 hours'
    duration VARCHAR(255) NOT NULL, -- e.g., '7 days', 'Until finished'
    instructions TEXT, -- e.g., 'Take with food', 'Avoid sunlight'
    is_refillable BOOLEAN DEFAULT FALSE,
    refills_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Chat Rooms Table: For 1-on-1 consultation chats or group chats
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type VARCHAR(50) NOT NULL, -- 'consultation', 'support_group', 'direct_message'
    related_entity_id UUID, -- e.g., appointment_id for consultation, support_group_id for group
    name VARCHAR(255), -- Optional, e.g., support group name
    created_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_rooms_related_entity ON chat_rooms(related_entity_id, room_type);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image_url', 'file_url'
    message_text TEXT,
    media_url TEXT, -- if content_type is image/file
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMPTZ -- For read receipts, can be more complex with read_receipts table for groups
);
CREATE INDEX idx_chat_messages_room_id_sent_at ON chat_messages(room_id, sent_at DESC);

-- Consultation Sessions Table (for video/audio call metadata)
CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    chat_room_id UUID UNIQUE REFERENCES chat_rooms(id) ON DELETE SET NULL, -- Link to the chat room for this consultation
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Initiated', 'Ongoing', 'Completed', 'Failed'
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    recording_url TEXT, -- If calls are recorded (consider privacy and consent)
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Forum Categories
CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    slug VARCHAR(120) UNIQUE NOT NULL, -- for SEO-friendly URLs
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts
CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES forum_categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0, -- Denormalized, or calculated
    comments_count INTEGER DEFAULT 0, -- Denormalized
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- No new comments
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_slug ON forum_posts(slug);

-- Forum Comments
CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);

-- Forum Post Likes (Many-to-many)
CREATE TABLE forum_post_likes (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Forum Tags
CREATE TABLE forum_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(60) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Forum Post Tags (Many-to-many)
CREATE TABLE forum_post_tags (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES forum_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- Support Groups
CREATE TABLE support_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    long_description_en TEXT,
    long_description_kn TEXT,
    category_en VARCHAR(100),
    category_kn VARCHAR(100),
    image_url TEXT, -- Banner image URL
    chat_room_id UUID UNIQUE REFERENCES chat_rooms(id) ON DELETE SET NULL, -- Dedicated chat room for the group
    created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_private BOOLEAN DEFAULT FALSE,
    rules TEXT,
    member_count INTEGER DEFAULT 0, -- Denormalized
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Support Group Memberships
CREATE TABLE group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'member', 'admin', 'moderator'
    status VARCHAR(50) DEFAULT 'approved', -- 'pending_approval', 'approved', 'banned', 'left'
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, user_id)
);
CREATE INDEX idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);

-- Support Group Posts
CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text_content TEXT NOT NULL,
    image_url TEXT, -- Optional image for the post
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);

-- Support Group Post Likes
CREATE TABLE group_post_likes (
    post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);


-- Cart Items Table (for e-commerce functionality)
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES medicine_inventory(id), -- Specific batch/SKU if needed
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, medicine_id, inventory_id) -- User can have one entry per specific inventory item
);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., ORD-YYYYMMDD-XXXXX
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending_Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'
    payment_method VARCHAR(50), -- e.g., 'CreditCard', 'MobileMoney', 'BankTransfer'
    payment_status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Failed', 'Refunded'
    shipping_address TEXT, -- Can be denormalized or linked to a user_addresses table
    billing_address TEXT,
    notes_from_customer TEXT,
    ordered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id), -- What was ordered
    inventory_id UUID REFERENCES medicine_inventory(id), -- Which stock batch it came from (optional, but good for tracking)
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL, -- Price at the time of order
    subtotal NUMERIC(12, 2) NOT NULL, -- quantity * unit_price
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE, -- An order can have one primary payment
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RWF',
    payment_method_used VARCHAR(50), -- 'credit_card', 'mobile_money', 'bank_transfer'
    payment_gateway_provider VARCHAR(50), -- e.g., 'Stripe', 'MoMo', 'Bank ABC'
    transaction_id VARCHAR(255) UNIQUE, -- From payment gateway
    gateway_response_payload JSONB, -- Store raw response from gateway for auditing
    status VARCHAR(50) NOT NULL, -- 'Pending', 'Succeeded', 'Failed', 'Refunded'
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Payment Webhook Logs
CREATE TABLE payment_webhook_logs (
    id SERIAL PRIMARY KEY,
    gateway VARCHAR(50) NOT NULL,
    event_type VARCHAR(255),
    payload JSONB,
    received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processed', 'error'
    error_message TEXT
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL, -- e.g., 'appointment_reminder', 'new_message', 'prescription_ready', 'order_shipped'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50), -- 'appointment', 'order', 'prescription', 'message'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_id_is_read ON notifications(user_id, is_read);

-- Notification Preferences Table
CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications_enabled BOOLEAN DEFAULT TRUE,
    sms_notifications_enabled BOOLEAN DEFAULT FALSE, -- Requires SMS integration
    in_app_notifications_enabled BOOLEAN DEFAULT TRUE,
    -- Granular preferences:
    enable_appointment_reminders BOOLEAN DEFAULT TRUE,
    enable_new_message_alerts BOOLEAN DEFAULT TRUE,
    enable_prescription_updates BOOLEAN DEFAULT TRUE,
    enable_order_status_updates BOOLEAN DEFAULT TRUE,
    enable_community_updates BOOLEAN DEFAULT FALSE, -- e.g., new forum posts in subscribed categories
    enable_marketing_communications BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial data for roles
INSERT INTO roles (name, description) VALUES
('patient', 'A registered patient using the platform for healthcare services.'),
('doctor', 'A verified healthcare professional providing consultations and medical advice.'),
('admin', 'A platform administrator with full system access.'),
('seeker', 'A user seeking health information and community support, may not be a patient yet.');

-- Insert initial data for common specialties
INSERT INTO specialties (name_en, name_kn, description) VALUES
('General Physician', 'Umuganga Rusange', 'Provides primary care, treats common illnesses, and offers preventive care.'),
('Pediatrician', 'Umuganga w\'Abana', 'Specializes in the medical care of infants, children, and adolescents.'),
('Cardiologist', 'Umuganga w\'Umutima', 'Specializes in diagnosing and treating diseases of the heart and blood vessels.'),
('Dermatologist', 'Umuganga w\'Uruhu', 'Specializes in conditions affecting the skin, hair, and nails.'),
('Gynecologist', 'Umuganga w\'Abagore', 'Specializes in the female reproductive system.'),
('Neurologist', 'Umuganga w\'Ubwonko n\'Imitsi', 'Specializes in disorders of the nervous system.'),
('Psychiatrist', 'Umuganga w\'Indwara zo mu Mutwe', 'Specializes in mental health, including substance use disorders.');

-- Insert initial data for forum categories
INSERT INTO forum_categories (name_en, name_kn, slug, description_en) VALUES
('Pain Management', 'Gucunga Ububabare', 'pain-management', 'Discussions on managing acute and chronic pain.'),
('Mental Wellness', 'Ubuzima Bwo Mu Mutwe', 'mental-wellness', 'Support and advice for mental health and well-being.'),
('Nutrition & Diet', 'Imirire', 'nutrition-diet', 'Share healthy eating tips, recipes, and dietary advice.'),
('Fitness & Exercise', 'Imyitozo Ngororamubiri', 'fitness-exercise', 'Motivation and guidance for physical activity.'),
('Chronic Conditions', 'Indwara Zidakira', 'chronic-conditions', 'Support for living with long-term health conditions like diabetes, hypertension, etc.'),
('General Health Q&A', 'Ubuzima Rusange Ibibazo', 'general-health-qa', 'Ask and answer general health-related questions.');

-- Functions to automatically update `updated_at` columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with an `updated_at` column
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public')
    LOOP
        EXECUTE format('CREATE TRIGGER set_timestamp
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE PROCEDURE trigger_set_timestamp();', t_name);
    END LOOP;
END;
$$;

-- Example of how to add a dummy admin user (password: AdminPassword123!)
-- This should ideally be done via a secure admin creation script or interface, not directly in schema.sql for production.
-- For prototype purposes only:
-- WITH admin_role AS (SELECT id FROM roles WHERE name = 'admin'),
--      inserted_user AS (
--          INSERT INTO users (email, password_hash, role_id, is_verified, is_active)
--          SELECT 'admin@mediserve.com', '$2a$12$abcdefghijklmnopqrstuv', admin_role.id, TRUE, TRUE
--          FROM admin_role
--          RETURNING id
--      )
-- INSERT INTO user_profiles (user_id, full_name, phone_number)
-- SELECT inserted_user.id, 'MediServe Admin', '0780000000'
-- FROM inserted_user;
-- Note: Replace '$2a$12$abcdefghijklmnopqrstuv' with an actual bcrypt hash of 'AdminPassword123!'
-- For example: '$2a$12$kegxY1xK1AYC2fAPnDtS0.axJtNBH2kVIzD7gXjFz2p2wM7g6kYJ.' for 'AdminPassword123!'

```
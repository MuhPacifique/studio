
-- MediServe Hub - Comprehensive Database Schema
-- Version: 3.0
-- Designed for PostgreSQL

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==== User Management ====

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'patient', 'doctor', 'admin', 'seeker'
    description TEXT
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(64),
    verification_token_expires_at TIMESTAMPTZ,
    password_reset_token VARCHAR(64),
    password_reset_token_expires_at TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT, -- Encrypted
    last_login_at TIMESTAMPTZ,
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
    gender VARCHAR(20), -- e.g., 'Male', 'Female', 'Other', 'Prefer not to say'
    address_line1 TEXT,
    address_line2 TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    profile_image_url TEXT,
    bio TEXT,
    preferred_language VARCHAR(10) DEFAULT 'kn', -- 'en', 'kn', 'fr'
    theme_preference VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
    notification_preferences JSONB, -- {'email_marketing': true, 'app_updates': false}
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name);

CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    contact_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, contact_phone) -- A user shouldn't list the same emergency contact phone twice
);
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);


-- ==== Doctor & Specialties ====

CREATE TABLE medical_specialties (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT
);

CREATE TABLE doctors (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty_id INTEGER REFERENCES medical_specialties(id),
    license_number VARCHAR(100) UNIQUE,
    years_of_experience INTEGER,
    consultation_fee_rwf NUMERIC(10, 2),
    biography_en TEXT,
    biography_kn TEXT,
    average_rating NUMERIC(3, 2) DEFAULT 0.00,
    is_available_for_consultation BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doctors_specialty_id ON doctors(specialty_id);

CREATE TABLE doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0 (Sunday) to 6 (Saturday)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (doctor_id, day_of_week, start_time)
);
CREATE INDEX idx_doctor_schedules_doctor_id ON doctor_schedules(doctor_id);

CREATE TABLE doctor_unavailability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_doctor_unavailability_doctor_id_start_end ON doctor_unavailability(doctor_id, start_datetime, end_datetime);


-- ==== Medical Services & Appointments ====

CREATE TYPE service_type_enum AS ENUM ('Test', 'Consultation', 'Procedure', 'Other');
CREATE TYPE appointment_status_enum AS ENUM ('Pending', 'Confirmed', 'Cancelled_By_Patient', 'Cancelled_By_Doctor', 'Completed', 'Missed', 'Rescheduled', 'Ongoing_Consultation');
CREATE TYPE appointment_type_enum AS ENUM ('Online', 'In-Person');

CREATE TABLE medical_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_en VARCHAR(100), -- e.g., Radiology, Pathology, Cardiology Consultation
    category_kn VARCHAR(100),
    service_type service_type_enum NOT NULL,
    price_rwf NUMERIC(10, 2) NOT NULL,
    duration_minutes INTEGER, -- Typical duration for consultations/procedures
    preparation_instructions_en TEXT,
    preparation_instructions_kn TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medical_services_name_kn ON medical_services(name_kn);
CREATE INDEX idx_medical_services_category_kn ON medical_services(category_kn);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    service_id UUID REFERENCES medical_services(id), -- Can be null if it's a general follow-up not tied to a specific billable service
    appointment_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 30, -- Default or derived from service
    reason TEXT,
    notes_for_doctor TEXT, -- Patient's notes when booking
    doctor_notes TEXT, -- Doctor's private notes after consultation
    status appointment_status_enum DEFAULT 'Pending',
    appointment_type appointment_type_enum NOT NULL,
    cancellation_reason TEXT,
    rescheduled_to_appointment_id UUID REFERENCES appointments(id), -- Link if this appointment was rescheduled from another
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_datetime ON appointments(appointment_datetime);
CREATE INDEX idx_appointments_status ON appointments(status);


-- ==== Pharmacy, Medicines & Inventory ====

CREATE TABLE medicine_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT
);

CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    category_id INTEGER REFERENCES medicine_categories(id),
    manufacturer VARCHAR(255),
    dosage_form VARCHAR(100), -- e.g., Tablet, Capsule, Syrup, Injection
    strength VARCHAR(100), -- e.g., 500mg, 10mg/5ml
    requires_prescription BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    contraindications_en TEXT,
    contraindications_kn TEXT,
    side_effects_en TEXT,
    side_effects_kn TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medicines_name_kn ON medicines(name_kn);
CREATE INDEX idx_medicines_category_id ON medicines(category_id);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medicine_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    stock_level INTEGER NOT NULL DEFAULT 0,
    unit_price_rwf NUMERIC(10, 2) NOT NULL,
    expiry_date DATE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    location_in_pharmacy VARCHAR(100), -- e.g., Shelf A, Row 3
    last_stocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_medicine_inventory_medicine_id ON medicine_inventory(medicine_id);
CREATE INDEX idx_medicine_inventory_expiry_date ON medicine_inventory(expiry_date);


-- ==== Prescriptions ====

CREATE TYPE prescription_status_enum AS ENUM ('Active', 'Completed', 'Expired', 'Cancelled');

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(user_id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id), -- Optional: link to the consultation
    date_prescribed DATE NOT NULL DEFAULT CURRENT_DATE,
    status prescription_status_enum DEFAULT 'Active',
    notes_for_patient_en TEXT,
    notes_for_patient_kn TEXT,
    notes_for_pharmacist TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    dosage VARCHAR(255) NOT NULL, -- e.g., "1 tablet", "10ml"
    frequency VARCHAR(255) NOT NULL, -- e.g., "Twice a day", "Every 8 hours"
    duration VARCHAR(255) NOT NULL, -- e.g., "7 days", "Until finished"
    route_of_administration VARCHAR(100), -- e.g., Oral, Topical
    instructions_en TEXT, -- e.g., "Take with food"
    instructions_kn TEXT,
    quantity_prescribed INTEGER,
    is_prn BOOLEAN DEFAULT FALSE, -- Pro re nata (as needed)
    prn_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medicine_id ON prescription_items(medicine_id);


-- ==== E-commerce: Cart, Orders, Payments ====

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- One active cart per user
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_addition NUMERIC(10,2) NOT NULL, -- Price when added, to handle price changes
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (cart_id, medicine_id)
);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL, -- 'shipping', 'billing'
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

CREATE TYPE order_status_enum AS ENUM ('Pending_Payment', 'Payment_Failed', 'Processing', 'Awaiting_Shipment', 'Shipped', 'Out_For_Delivery', 'Delivered', 'Cancelled_By_User', 'Cancelled_By_Admin', 'Refunded');

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_reference VARCHAR(50) UNIQUE NOT NULL, -- Human-readable reference like ORD-TIMESTAMP-USERID
    order_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    total_amount_rwf NUMERIC(12, 2) NOT NULL,
    shipping_fee_rwf NUMERIC(10,2) DEFAULT 0.00,
    discount_amount_rwf NUMERIC(10,2) DEFAULT 0.00,
    final_amount_rwf NUMERIC(12,2) NOT NULL,
    status order_status_enum DEFAULT 'Pending_Payment',
    shipping_address_id UUID REFERENCES user_addresses(id),
    billing_address_id UUID REFERENCES user_addresses(id),
    shipping_method VARCHAR(100),
    tracking_number VARCHAR(100),
    notes_for_delivery TEXT,
    prescription_id UUID REFERENCES prescriptions(id), -- If order is based on a prescription
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_reference ON orders(order_reference);
CREATE INDEX idx_orders_status ON orders(status);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL REFERENCES medicines(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_rwf NUMERIC(10, 2) NOT NULL, -- Price at the time of order
    subtotal_rwf NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE TYPE payment_status_enum AS ENUM ('Pending', 'Successful', 'Failed', 'Refunded', 'Partially_Refunded');
CREATE TYPE payment_method_enum AS ENUM ('Credit_Card', 'Mobile_Money', 'Bank_Transfer', 'Cash_On_Delivery', 'Insurance');

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE, -- Can be null for other types of payments (e.g., consultation fee not tied to an order)
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_rwf NUMERIC(12, 2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_gateway_transaction_id VARCHAR(255) UNIQUE, -- ID from Stripe, MoMo, etc.
    status payment_status_enum DEFAULT 'Pending',
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    gateway_response JSONB, -- Store raw response from payment gateway for debugging
    currency VARCHAR(3) DEFAULT 'RWF',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);


-- ==== Community Features: Forums & Support Groups ====

CREATE TABLE forum_categories (
    id SERIAL PRIMARY KEY,
    name_en VARCHAR(100) UNIQUE NOT NULL,
    name_kn VARCHAR(100) UNIQUE NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    slug VARCHAR(110) UNIQUE NOT NULL, -- e.g., pain-management
    icon_name VARCHAR(50), -- For UI, e.g., lucide icon name
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forum_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Keep post even if user is deleted (or use ON DELETE CASCADE)
    category_id INTEGER NOT NULL REFERENCES forum_categories(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags, e.g., ['chronic pain', 'wellness']
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE, -- No new comments
    view_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX idx_forum_posts_tags ON forum_posts USING GIN (tags); -- For searching tags

CREATE TABLE forum_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    parent_comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE, -- For moderation
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_forum_comments_post_id ON forum_comments(post_id);
CREATE INDEX idx_forum_comments_user_id ON forum_comments(user_id);

CREATE TABLE forum_post_likes (
    post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE support_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_kn TEXT,
    long_description_en TEXT,
    long_description_kn TEXT,
    banner_image_url TEXT,
    category_kn VARCHAR(100), -- For easier filtering in Kinyarwanda
    is_private BOOLEAN DEFAULT FALSE,
    rules TEXT,
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_support_groups_category_kn ON support_groups(category_kn);

CREATE TYPE group_member_role_enum AS ENUM ('admin', 'moderator', 'member');
CREATE TYPE group_membership_status_enum AS ENUM ('approved', 'pending_approval', 'rejected', 'banned');

CREATE TABLE group_memberships (
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role group_member_role_enum DEFAULT 'member',
    status group_membership_status_enum DEFAULT 'pending_approval', -- Or 'approved' for public groups
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- e.g., reason for rejection/ban
    PRIMARY KEY (group_id, user_id)
);
CREATE INDEX idx_group_memberships_user_id ON group_memberships(user_id);

CREATE TABLE group_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_group_posts_group_id ON group_posts(group_id);

CREATE TABLE group_post_likes (
    group_post_id UUID NOT NULL REFERENCES group_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_post_id, user_id)
);

-- ==== Real-time Communication Support ====

CREATE TYPE chat_room_type_enum AS ENUM ('consultation', 'support_group_main', 'direct_message', 'admin_support');

CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_type chat_room_type_enum NOT NULL,
    related_entity_id UUID, -- appointment_id for consultation, support_group_id for group, etc.
    name VARCHAR(255), -- Optional, e.g., for support group chats
    description TEXT,
    created_by_user_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chat_rooms_related_entity_id ON chat_rooms(related_entity_id);

CREATE TYPE chat_message_content_type_enum AS ENUM ('text', 'image_url', 'file_url', 'system_notification');

CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY, -- Use BIGSERIAL for high-volume message tables
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL, -- System messages might have NULL sender
    content_type chat_message_content_type_enum NOT NULL,
    message_text TEXT, -- For text, or URL for image/file
    metadata JSONB, -- For image dimensions, file type, system message details
    sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ, -- For edited messages
    deleted_at TIMESTAMPTZ -- For soft deletes
);
CREATE INDEX idx_chat_messages_room_id_sent_at ON chat_messages(room_id, sent_at DESC);

CREATE TABLE chat_room_participants (
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_read_message_id BIGINT REFERENCES chat_messages(id),
    is_muted BOOLEAN DEFAULT FALSE, -- User mutes notifications for this room
    is_admin BOOLEAN DEFAULT FALSE, -- If user has admin rights in this specific room
    PRIMARY KEY (room_id, user_id)
);

CREATE TYPE consultation_session_status_enum AS ENUM ('scheduled', 'initiated', 'ongoing', 'completed', 'ended_by_doctor', 'ended_by_patient', 'missed_by_patient', 'missed_by_doctor', 'technical_issue');

CREATE TABLE consultation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    chat_room_id UUID UNIQUE REFERENCES chat_rooms(id),
    status consultation_session_status_enum DEFAULT 'scheduled',
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    recording_url TEXT, -- If calls are recorded
    signaling_server_log TEXT, -- For WebRTC debugging
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comments TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- ==== Notifications ====

CREATE TYPE notification_type_enum AS ENUM (
    'appointment_booked', 'appointment_confirmed', 'appointment_cancelled', 'appointment_reminder',
    'prescription_ready', 'prescription_updated',
    'new_chat_message', 'new_group_post', 'new_forum_reply',
    'order_placed', 'order_shipped', 'order_delivered', 'payment_successful', 'payment_failed',
    'account_verified', 'password_changed', 'security_alert',
    'system_announcement', 'new_article_published'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type notification_type_enum NOT NULL,
    title_en VARCHAR(255),
    title_kn VARCHAR(255),
    content_en TEXT NOT NULL,
    content_kn TEXT NOT NULL,
    link_path TEXT, -- e.g., /appointments/my-appointments/appt-id
    related_entity_type VARCHAR(50), -- e.g., 'appointment', 'order', 'post'
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user_id_is_read_created_at ON notifications(user_id, is_read, created_at DESC);


-- ==== AI Interactions Logging (Optional) ====

CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    flow_name VARCHAR(100) NOT NULL, -- e.g., 'symptomAnalyzer', 'medicalFaq'
    input_payload JSONB,
    output_payload JSONB,
    error_details TEXT,
    duration_ms INTEGER,
    interacted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_flow_name ON ai_interactions(flow_name);


-- ==== Functions for `updated_at` ====
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables that have an `updated_at` column
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public')
    LOOP
        EXECUTE format('CREATE TRIGGER set_timestamp
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE FUNCTION trigger_set_timestamp();', t_name);
    END LOOP;
END;
$$;


-- ==== Initial Data (Seed Roles) ====
INSERT INTO roles (name, description) VALUES
('patient', 'A registered patient of MediServe Hub.'),
('doctor', 'A registered and verified healthcare professional.'),
('admin', 'A platform administrator with full system access.'),
('seeker', 'A user seeking health information and community support, may not be a full patient yet.');

INSERT INTO medicine_categories (name_en, name_kn, description_en, description_kn) VALUES
('Pain Relief', 'Igabanya Ububabare', 'Medicines for alleviating various types of pain.', 'Imiti yo kugabanya ubwoko butandukanye bw''ububabare.'),
('Antibiotics', 'Antibiyotike', 'Medicines for treating bacterial infections.', 'Imiti yo kuvura indwara ziterwa na bagiteri.'),
('Allergy Relief', 'Igabanya Aleriji', 'Medicines for managing allergy symptoms.', 'Imiti yo gucunga ibimenyetso bya aleriji.'),
('Vitamins & Supplements', 'Vitamini n''Inyongera', 'Products to supplement dietary needs.', 'Ibicuruzwa byo kunganira indyo.'),
('Chronic Conditions', 'Indwara Idakira', 'Medications for long-term health conditions.', 'Imiti y''indwara z''igihe kirekire.'),
('Digestive Health', 'Ubuzima bw''Igogora', 'Medicines for gastrointestinal issues.', 'Imiti y''ibibazo byo mu gifu n''amara.'),
('Skin Care', 'Kwita ku Ruhu', 'Topical and oral medications for skin conditions.', 'Imiti yo kwisiga no kunywa y''ibibazo by''uruhu.');

INSERT INTO medical_specialties (name_en, name_kn, description_en, description_kn) VALUES
('General Physician', 'Umuganga Rusange', 'Provides primary care and treats common illnesses.', 'Atanga ubuvuzi bw''ibanze kandi avura indwara zikunze kugaragara.'),
('Pediatrician', 'Umuganga w''Abana', 'Specializes in the medical care of infants, children, and adolescents.', 'Inzobere mu buvuzi bw''impinja, abana, n''ingimbi.'),
('Cardiologist', 'Umuganga w''Umutima', 'Specializes in diagnosing and treating diseases of the heart and blood vessels.', 'Inzobere mu gusuzuma no kuvura indwara z''umutima n''imitsi.'),
('Dermatologist', 'Umuganga w''Uruhu', 'Specializes in conditions involving the skin, hair, and nails.', 'Inzobere mu bibazo byerekeye uruhu, umusatsi, n''inzara.'),
('Endocrinologist', 'Umuganga w''Imisemburo', 'Specializes in disorders of the endocrine glands (e.g., diabetes, thyroid issues).', 'Inzobere mu ndwara z''imyanya y''imisemburo (urugero: diyabete, ibibazo bya tiroyide).'),
('Neurologist', 'Umuganga w''Ubwonko n''Uruvunge rw''Imyakura', 'Specializes in disorders of the nervous system.', 'Inzobere mu ndwara z''uruhererekane rw''imyakura.');

INSERT INTO forum_categories (name_en, name_kn, slug, description_en, description_kn) VALUES
('General Health Discussion', 'Ibiganiro Rusange ku Buzima', 'general-health', 'Discuss general health topics, news, and concerns.', 'Ganira ku ngingo rusange z''ubuzima, amakuru, n''ibihangayikishije.'),
('Chronic Conditions Support', 'Ubufasha ku Ndwara Idakira', 'chronic-conditions', 'Support and advice for managing chronic illnesses like diabetes, hypertension, etc.', 'Ubufasha n''inama zo gucunga indwara zidakira nka diyabete, umuvuduko w''amaraso, n''ibindi.'),
('Mental Wellness', 'Ubuzima Bwiza bwo mu Mutwe', 'mental-wellness', 'A safe space to discuss mental health, stress, anxiety, and well-being.', 'Ahantu hizewe ho kuganirira ku buzima bwo mu mutwe, stress, guhangayika, n''imibereho myiza.'),
('Nutrition & Diet', 'Imirire n''Indyo', 'nutrition-diet', 'Share healthy eating tips, recipes, and dietary advice.', 'Sangira inama z''imirire myiza, amafunguro, n''inama z''indyo.'),
('Fitness & Exercise', 'Imyitozo Ngororamubiri', 'fitness-exercise', 'Motivation, workout routines, and fitness discussions.', 'Gushishikariza, gahunda z''imyitozo, n''ibiganiro ku myitozo ngororamubiri.');

-- Add some default medicines with category_id linking to new table
-- Ensure category_ids match what you inserted above (e.g., 'Pain Relief' might be ID 1)
-- This is illustrative; actual IDs would depend on insertion order.
-- Example: INSERT INTO medicines (name_en, name_kn, category_id, ...) VALUES ('Paracetamol 500mg', 'Parasetamoli 500mg', (SELECT id FROM medicine_categories WHERE name_en = 'Pain Relief'), ...);


-- Placeholder: Seed initial Admin User (password should be set securely during deployment)
-- INSERT INTO users (email, password_hash, role_id, is_active, is_verified)
-- VALUES ('admin@mediserve.com', '$2a$12$someSecureHashForAdmin123', (SELECT id FROM roles WHERE name = 'admin'), TRUE, TRUE);
-- INSERT INTO user_profiles (user_id, full_name, phone_number)
-- VALUES ((SELECT id FROM users WHERE email = 'admin@mediserve.com'), 'MediServe Admin', '0700000000');

-- Placeholder: Seed initial Doctor User
-- INSERT INTO users (email, password_hash, role_id, is_active, is_verified)
-- VALUES ('doctor@mediserve.com', '$2a$12$someSecureHashForDoctor123', (SELECT id FROM roles WHERE name = 'doctor'), TRUE, TRUE);
-- INSERT INTO user_profiles (user_id, full_name, phone_number)
-- VALUES ((SELECT id FROM users WHERE email = 'doctor@mediserve.com'), 'Dr. MediServe', '0711111111');
-- INSERT INTO doctors (user_id, specialty_id, license_number, consultation_fee_rwf)
-- VALUES ((SELECT id FROM users WHERE email = 'doctor@mediserve.com'), (SELECT id FROM medical_specialties WHERE name_en = 'General Physician'), 'MD001', 5000);

-- Placeholder: Seed initial Patient User
-- INSERT INTO users (email, password_hash, role_id, is_active, is_verified)
-- VALUES ('patient@mediserve.com', '$2a$12$someSecureHashForPatient123', (SELECT id FROM roles WHERE name = 'patient'), TRUE, TRUE);
-- INSERT INTO user_profiles (user_id, full_name, phone_number)
-- VALUES ((SELECT id FROM users WHERE email = 'patient@mediserve.com'), 'Patient Umurwayi', '0722222222');

COMMIT;
ANALYZE; -- Update statistics for the query planner

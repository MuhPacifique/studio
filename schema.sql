-- Database schema for MediServe Hub

-- Users Table: Stores information about all users (patients, doctors, admins, seekers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, never plain text
    role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin', 'seeker')), -- User role
    phone_number VARCHAR(20) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Table: Stores additional profile information for users
CREATE TABLE user_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Rwanda',
    bio TEXT,
    profile_image_url VARCHAR(2048),
    preferred_language VARCHAR(5) DEFAULT 'kn', -- 'en', 'kn', 'fr'
    theme VARCHAR(10) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Settings Table: Stores user-specific settings like notification preferences
CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    enable_marketing_emails BOOLEAN DEFAULT FALSE,
    enable_app_notifications BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts Table: Stores emergency contact information for users
CREATE TABLE emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_name VARCHAR(255),
    relationship VARCHAR(100), -- e.g., Spouse, Parent, Sibling
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, phone_number) -- A user might have multiple emergency contacts, but not with the same phone
);

-- Doctor Specific Information Table
CREATE TABLE doctor_details (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(255),
    license_number VARCHAR(100) UNIQUE,
    years_of_experience INTEGER,
    consultation_fee_rwf DECIMAL(10, 2),
    availability_schedule JSONB, -- To store complex availability like { "monday": ["09:00-12:00", "14:00-17:00"], ... }
    is_available_for_consultation BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medicines Table: Catalog of all medicines
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    unit_price_rwf DECIMAL(10, 2) NOT NULL,
    stock_level INTEGER NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    expiry_date DATE,
    image_url VARCHAR(2048),
    ai_hint VARCHAR(255), -- For placeholder image generation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table: Medical tests, consultation types, procedures offered
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255), -- Kinyarwanda name
    type VARCHAR(100) NOT NULL CHECK (type IN ('Medical Test', 'Consultation', 'Procedure')),
    description TEXT,
    price_rwf DECIMAL(10, 2) NOT NULL,
    duration_estimate VARCHAR(100), -- e.g., '30 minutes', 'Results in 24h'
    preparation_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Can be null if general booking
    service_id INTEGER REFERENCES services(id) ON DELETE SET NULL, -- If appointment is for a specific service like 'General Consultation'
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    reason_for_visit TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    consultation_type VARCHAR(50) DEFAULT 'Online' CHECK (consultation_type IN ('Online', 'In-Person')),
    notes_for_doctor TEXT, -- Patient's notes
    doctor_notes TEXT, -- Doctor's notes post-consultation
    video_call_link VARCHAR(2048),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_user_id, appointment_date, appointment_time) -- A doctor cannot have two appointments at the exact same time
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- A prescription must have a doctor
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL, -- Link to appointment if applicable
    date_prescribed DATE NOT NULL DEFAULT CURRENT_DATE,
    notes_for_patient TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items Table: Links medicines to a prescription
CREATE TABLE prescription_items (
    id SERIAL PRIMARY KEY,
    prescription_id INTEGER NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    dosage VARCHAR(255) NOT NULL, -- e.g., '1 tablet', '10ml'
    frequency VARCHAR(255) NOT NULL, -- e.g., 'Twice a day', 'Every 6 hours'
    duration VARCHAR(255) NOT NULL, -- e.g., '7 days', 'Until finished'
    instructions TEXT, -- Additional instructions for this specific medicine
    UNIQUE(prescription_id, medicine_id) -- Avoid duplicate medicine entries in the same prescription
);

-- Forum Posts Table
CREATE TABLE forum_posts (
    id SERIAL PRIMARY KEY,
    author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forum Post Likes Table
CREATE TABLE forum_post_likes (
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- Forum Comments Table
CREATE TABLE forum_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES forum_comments(id) ON DELETE CASCADE, -- For threaded comments
    text_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Groups Table
CREATE TABLE support_groups (
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Group must have an admin
    name VARCHAR(255) NOT NULL UNIQUE,
    name_kn VARCHAR(255) UNIQUE,
    description TEXT,
    description_kn TEXT,
    long_description TEXT,
    long_description_kn TEXT,
    image_url VARCHAR(2048),
    ai_hint VARCHAR(255),
    category VARCHAR(100),
    category_kn VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Group Members Table: Junction table for users and support groups
CREATE TABLE support_group_members (
    group_id INTEGER NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'moderator')),
    join_status VARCHAR(50) DEFAULT 'approved' CHECK (join_status IN ('pending_approval', 'approved', 'rejected', 'banned')), -- For private groups
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- Support Group Posts Table
CREATE TABLE support_group_posts (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES support_groups(id) ON DELETE CASCADE,
    author_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text_content TEXT NOT NULL,
    image_url VARCHAR(2048),
    image_ai_hint VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Group Post Likes Table
CREATE TABLE support_group_post_likes (
    post_id INTEGER NOT NULL REFERENCES support_group_posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

-- User Cart Items Table: For storing items in a user's shopping cart
CREATE TABLE user_cart_items (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, medicine_id)
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount_rwf DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Awaiting Payment', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    shipping_address_line1 TEXT,
    shipping_address_line2 TEXT,
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    payment_method VARCHAR(100),
    payment_transaction_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(50) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table: Links medicines to an order
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_order_rwf DECIMAL(10, 2) NOT NULL, -- Price of the medicine at the time of order
    subtotal_rwf DECIMAL(12, 2) NOT NULL -- quantity * price_at_order_rwf
);

-- Admin Notifications or System Logs (Example)
CREATE TABLE system_logs (
    id SERIAL PRIMARY KEY,
    log_level VARCHAR(20) DEFAULT 'INFO' CHECK (log_level IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    message TEXT NOT NULL,
    context JSONB, -- Additional context for the log
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_user_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_user_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_user_id);
CREATE INDEX idx_support_groups_name ON support_groups(name);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Trigger function to update 'updated_at' columns
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with 'updated_at'
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- (Apply similar triggers for all other tables with an updated_at column)
-- e.g., medicines, services, appointments, prescriptions, forum_posts, support_groups, orders etc.
-- Example for medicines:
CREATE TRIGGER set_timestamp_medicines
BEFORE UPDATE ON medicines
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_services
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_appointments
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_prescriptions
BEFORE UPDATE ON prescriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_forum_posts
BEFORE UPDATE ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_forum_comments
BEFORE UPDATE ON forum_comments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_support_groups
BEFORE UPDATE ON support_groups
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_support_group_posts
BEFORE UPDATE ON support_group_posts
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- You might want to add more specific triggers, e.g., to update medicine stock after an order is placed,
-- or to manage group member counts automatically. These are more advanced and depend on specific business logic.


-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin', 'seeker')), -- e.g., patient, doctor, admin, seeker
    profile_image_url TEXT,
    phone VARCHAR(20),
    dob DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    bio TEXT,
    preferred_language VARCHAR(5) DEFAULT 'kn', -- 'en', 'kn', 'fr'
    marketing_emails_enabled BOOLEAN DEFAULT FALSE,
    app_notifications_enabled BOOLEAN DEFAULT TRUE,
    theme_preference VARCHAR(10) DEFAULT 'system', -- 'light', 'dark', 'system'
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Emergency Contacts (linked to Users)
CREATE TABLE EmergencyContacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100), -- Optional: e.g., Spouse, Parent, Friend
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Medicines Table (for inventory and catalog)
CREATE TABLE Medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    stock_level INTEGER DEFAULT 0,
    unit_price DECIMAL(10, 2) NOT NULL, -- Assuming RWF, adjust precision as needed
    expiry_date DATE,
    supplier VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services Table (Medical Tests, Consultations, etc.)
CREATE TABLE Services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255),
    type VARCHAR(100) NOT NULL, -- e.g., 'Medical Test', 'Consultation', 'Procedure'
    price DECIMAL(10, 2) NOT NULL,
    duration_en VARCHAR(100), -- e.g., 'Results in 24h', '30 minutes'
    duration_kn VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    description_en TEXT,
    description_kn TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Appointments Table
CREATE TABLE Appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE, -- Patient User ID
    doctor_id UUID REFERENCES Users(id) ON DELETE SET NULL, -- Doctor User ID (can be null if system assigned)
    doctor_name VARCHAR(255), -- Denormalized for easier display
    specialty VARCHAR(100), -- Denormalized doctor specialty
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL, -- Consider storing as TIME or part of appointment_date
    reason TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('Online', 'In-Person')),
    notes_patient TEXT, -- Notes from patient during booking
    notes_doctor TEXT, -- Notes from doctor after consultation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE Prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES Users(id) ON DELETE SET NULL, -- Issuing doctor
    doctor_name VARCHAR(255), -- Denormalized for display
    date_prescribed DATE NOT NULL,
    notes TEXT, -- General notes for the whole prescription
    status VARCHAR(50) NOT NULL CHECK (status IN ('Active', 'Completed', 'Expired', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prescription Items Table (Many-to-Many between Prescriptions and Medicines, with details)
CREATE TABLE PrescriptionItems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES Prescriptions(id) ON DELETE CASCADE,
    -- Instead of medicine_id referencing Medicines directly, store medicine name for historical accuracy
    -- as medicine details in Medicines table might change.
    medicine_name VARCHAR(255) NOT NULL, 
    dosage VARCHAR(255) NOT NULL, -- e.g., '1 tablet', '10mg'
    frequency VARCHAR(255) NOT NULL, -- e.g., 'Twice a day', 'Every 6 hours'
    duration VARCHAR(255) NOT NULL, -- e.g., '7 days', 'Until finished'
    instructions TEXT, -- Specific instructions for this medicine item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts Table
CREATE TABLE ForumPosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forum Post Likes Table
CREATE TABLE ForumPostLikes (
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES ForumPosts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- Forum Comments Table
CREATE TABLE ForumComments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES ForumPosts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES ForumComments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Groups Table
CREATE TABLE SupportGroups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_kn VARCHAR(255),
    description_en TEXT,
    description_kn TEXT,
    long_description_en TEXT,
    long_description_kn TEXT,
    image_url TEXT,
    category_en VARCHAR(100),
    category_kn VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    admin_user_id UUID NOT NULL REFERENCES Users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Group Members Table (Many-to-Many)
CREATE TABLE SupportGroupMembers (
    group_id UUID NOT NULL REFERENCES SupportGroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')), -- Group-specific role
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'banned')),
    PRIMARY KEY (group_id, user_id)
);

-- Support Group Posts Table
CREATE TABLE SupportGroupPosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES SupportGroups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Group Post Likes Table
CREATE TABLE SupportGroupPostLikes (
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES SupportGroupPosts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

-- Orders Table (for medicine purchases)
CREATE TABLE Orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_amount_rwf DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded')),
    shipping_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE OrderItems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES Orders(id) ON DELETE CASCADE,
    medicine_id UUID NOT NULL, -- Could reference Medicines(id) if stock is managed elsewhere or keep denormalized
    medicine_name VARCHAR(255) NOT NULL, -- Denormalized for historical accuracy
    quantity INTEGER NOT NULL,
    unit_price_at_purchase DECIMAL(10, 2) NOT NULL,
    sub_total_amount_rwf DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE Payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES Orders(id) ON DELETE SET NULL, -- Can be null if payment is for other services
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    amount_rwf DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'Credit Card', 'Mobile Money', 'Bank Transfer'
    transaction_id VARCHAR(255) UNIQUE, -- From payment gateway
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Pending', 'Successful', 'Failed', 'Refunded')),
    reason TEXT, -- General reason if not linked to an order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Interaction Logs (Optional, for Genkit flows)
CREATE TABLE AiInteractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE SET NULL,
    flow_name VARCHAR(255) NOT NULL, -- e.g., 'symptomAnalyzerFlow', 'answerMedicalQuestionFlow'
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Success', 'Error', 'Pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs (Optional, for tracking important actions)
CREATE TABLE AuditLogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES Users(id) ON DELETE SET NULL, -- User performing the action
    action VARCHAR(255) NOT NULL, -- e.g., 'USER_LOGIN', 'MEDICINE_STOCK_UPDATE', 'ADMIN_SETTINGS_CHANGE'
    target_type VARCHAR(100), -- e.g., 'User', 'Medicine', 'SystemSetting'
    target_id TEXT, -- ID of the entity affected
    details JSONB, -- Additional details about the action
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for frequently queried columns for performance
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_appointments_user_id ON Appointments(user_id);
CREATE INDEX idx_appointments_doctor_id ON Appointments(doctor_id);
CREATE INDEX idx_appointments_date ON Appointments(appointment_date);
CREATE INDEX idx_prescriptions_patient_id ON Prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON Prescriptions(doctor_id);
CREATE INDEX idx_forumposts_user_id ON ForumPosts(user_id);
CREATE INDEX idx_forumcomments_post_id ON ForumComments(post_id);
CREATE INDEX idx_supportgroups_admin_user_id ON SupportGroups(admin_user_id);
CREATE INDEX idx_supportgroupmembers_group_id ON SupportGroupMembers(group_id);
CREATE INDEX idx_supportgroupmembers_user_id ON SupportGroupMembers(user_id);
CREATE INDEX idx_supportgroupposts_group_id ON SupportGroupPosts(group_id);
CREATE INDEX idx_orders_user_id ON Orders(user_id);
CREATE INDEX idx_payments_user_id ON Payments(user_id);
CREATE INDEX idx_payments_order_id ON Payments(order_id);

-- You might want to add more specific indexes based on your query patterns.
-- Consider Full-Text Search capabilities for fields like descriptions, content, etc.
-- For Kinyarwanda names/text, ensure your database collation supports it correctly.
    
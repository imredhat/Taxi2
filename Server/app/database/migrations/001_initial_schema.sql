-- =============================================================
-- Pooyesh Taxi (پویش تاکسی) — PostgreSQL Schema
-- Version: 2.0
-- Date: 2026-06-29
-- =============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- ENUM TYPES
-- =============================================================

-- User roles
CREATE TYPE user_role AS ENUM (
    'passenger', 'driver', 'admin', 'support', 'super_admin'
);

-- OTP channels
CREATE TYPE otp_channel AS ENUM ('sms', 'call', 'email');

-- OTP status
CREATE TYPE otp_status AS ENUM ('pending', 'verified', 'expired', 'failed');

-- Gender
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');

-- Driver status
CREATE TYPE driver_status AS ENUM ('offline', 'online', 'busy', 'break');

-- Ride status
CREATE TYPE ride_status AS ENUM (
    'pending',       -- سفر درخواست شده
    'searching',     -- در جستجوی راننده
    'accepted',      -- راننده پذیرفت
    'arriving',      -- راننده در حال حرکت به سمت مسافر
    'arrived',       -- راننده رسید
    'in_progress',   -- سفر در حال انجام
    'completed',     -- سفر تمام شد
    'cancelled',     -- لغو شده
    'expired'        -- منقضی شده
);

-- Payment method
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'wallet', 'gateway');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Transaction type
CREATE TYPE transaction_type AS ENUM (
    'ride_payment',        -- پرداخت کرایه
    'ride_earning',        -- درآمد راننده
    'wallet_topup',        -- شارژ کیف پول
    'wallet_withdraw',     -- برداشت از کیف پول
    'commission',          -- کمیسیون سامانه
    'bonus',               -- پاداش
    'refund',              -- بازگشت وجه
    'revenue_share',       -- سهم درآمد
    'adjustment',          -- تصحیح
    'transfer'             -- انتقال بین کیف پول‌ها
);

-- Vehicle type (7 car classes)
CREATE TYPE vehicle_class AS ENUM (
    'eco',           -- اقتصادی
    'economy',       -- اکونومی
    'comfort',       -- کامفورت
    'premium',       -- پریمیوم
    'van',           -- ون
    'motorcycle',    -- موتور
    'tuk_tuk'        -- توک‌توک
);

-- Ride type
CREATE TYPE ride_type AS ENUM ('normal', 'intercity', 'shared', 'scheduled', 'airport');

-- Notification type
CREATE TYPE notification_type AS ENUM (
    'ride', 'payment', 'promotion', 'system', 'feedback', 'chat'
);

-- Content type (CMS)
CREATE TYPE content_type AS ENUM ('page', 'banner', 'faq', 'blog', 'terms', 'about', 'promo');

-- Car status
CREATE TYPE car_status AS ENUM ('active', 'inactive', 'maintenance', 'expired_insurance', 'expired_plate');

-- Company status
CREATE TYPE company_status AS ENUM ('active', 'inactive', 'suspended', 'pending_approval');

-- Withdrawal status
CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- Support ticket status
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'waiting_user', 'resolved', 'closed');

-- Support ticket priority
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Rating target
CREATE TYPE rating_target AS ENUM ('driver', 'passenger', 'ride');

-- Promotion type
CREATE TYPE promo_type AS ENUM ('percentage', 'fixed', 'free_ride', 'credit');

-- App platform
CREATE TYPE app_platform AS ENUM ('android', 'ios', 'web');

-- =============================================================
-- 1. AUTH & SSO MODULE (کد ملی + موبایل + OTP)
-- =============================================================

-- Users (passengers, drivers, admins — unified)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL DEFAULT 'passenger',
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    national_code VARCHAR(10) UNIQUE,           -- کد ملی (10 digits)
    national_code_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    gender gender_type,
    birth_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_national_code ON users(national_code);
CREATE INDEX idx_users_role ON users(role);

-- OTP Tokens
CREATE TABLE otp_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    channel otp_channel NOT NULL DEFAULT 'sms',
    code VARCHAR(10) NOT NULL,                -- OTP code
    status otp_status NOT NULL DEFAULT 'pending',
    attempts INT DEFAULT 0,
    max_attempts INT DEFAULT 3,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_otp_user ON otp_tokens(user_id);
CREATE INDEX idx_otp_status ON otp_tokens(status);

-- Auth Sessions / Refresh Tokens
CREATE TABLE auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    refresh_token VARCHAR(500) NOT NULL,
    platform app_platform NOT NULL DEFAULT 'web',
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_auth_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_refresh ON auth_sessions(refresh_token);

-- Auth Permissions (role-based access)
CREATE TABLE auth_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    resource VARCHAR(100) NOT NULL,            -- e.g. 'rides', 'users', 'settings'
    action VARCHAR(50) NOT NULL,               -- e.g. 'read', 'write', 'delete', 'manage'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, resource, action)
);

-- =============================================================
-- 2. DRIVER MODULE
-- =============================================================

-- Driver profiles (extends users)
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    status driver_status NOT NULL DEFAULT 'offline',
    rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
    total_rides INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,           -- in Rial
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    license_number VARCHAR(50),                -- شماره گواهینامه
    license_expiry DATE,
    insurance_number VARCHAR(50),
    insurance_expiry DATE,
    id_card_number VARCHAR(20),                -- شماره کارت ملی
    background_check_passed BOOLEAN DEFAULT FALSE,
    background_check_date DATE,
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(20),           -- شماره شبا یا حساب
    bank_card_number VARCHAR(20),              -- شماره کارت
    bank_account_holder VARCHAR(100),
    accepted_terms_at TIMESTAMP WITH TIME ZONE,
    training_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX idx_driver_profiles_rating ON driver_profiles(rating);

-- Driver Documents (uploads)
CREATE TABLE driver_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,        -- 'license', 'insurance', 'id_card', 'vehicle_registration'
    file_url TEXT NOT NULL,
    file_name VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_driver_documents_driver ON driver_documents(driver_id);

-- Driver Availability Schedules
CREATE TABLE driver_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE,
    CHECK (start_time < end_time)
);

CREATE INDEX idx_driver_schedules_driver ON driver_schedules(driver_id);

-- =============================================================
-- 3. VEHICLE MODULE (7 Car Classes)
-- =============================================================

-- Car Brands (brand)
CREATE TABLE car_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,               -- e.g. 'Iran Khodro', 'SAIPA', 'Toyota'
    name_fa VARCHAR(100),                     -- Persian name
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Car Models (brand_type)
CREATE TABLE car_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,               -- e.g. 'Peugeot 206', 'Samand'
    name_fa VARCHAR(100),
    vehicle_class vehicle_class NOT NULL,      -- which class this model belongs to
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES car_brands(id) ON DELETE CASCADE
);

CREATE INDEX idx_car_models_brand ON car_models(brand_id);
CREATE INDEX idx_car_models_class ON car_models(vehicle_class);

-- Vehicles (cars)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL,
    model_id UUID NOT NULL,
    color VARCHAR(30) NOT NULL,
    color_fa VARCHAR(30),
    license_plate VARCHAR(20) UNIQUE NOT NULL,   -- پلاک خودرو
    year INTEGER NOT NULL CHECK (year >= 1350 AND year <= 1500), -- Iranian calendar year
    vin VARCHAR(50),
    car_class vehicle_class NOT NULL DEFAULT 'economy',
    car_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    insurance_expiry DATE,
    inspection_expiry DATE,                      -- معاینه فنی
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES car_models(id) ON DELETE RESTRICT
);

CREATE INDEX idx_vehicles_driver ON vehicles(driver_id);
CREATE INDEX idx_vehicles_class ON vehicles(car_class);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

-- =============================================================
-- 4. FLEET / COMPANY MODULE
-- =============================================================

-- Companies (شرکت‌های تاکسیرانی)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    name_fa VARCHAR(200),
    registration_number VARCHAR(50) UNIQUE,    -- شماره ثبت
    national_id VARCHAR(10) UNIQUE,            -- کد اقتصادی
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    status company_status NOT NULL DEFAULT 'pending_approval',
    commission_rate DECIMAL(5, 2) DEFAULT 15.00, -- default platform commission %
    max_drivers INTEGER DEFAULT 50,
    contact_person VARCHAR(200),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_status ON companies(status);

-- Company-Drivers relationship
CREATE TABLE company_drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE,
    UNIQUE(company_id, driver_id)
);

CREATE INDEX idx_company_drivers_company ON company_drivers(company_id);
CREATE INDEX idx_company_drivers_driver ON company_drivers(driver_id);

-- =============================================================
-- 5. LOCATION TRACKING
-- =============================================================

-- Driver Locations (real-time)
CREATE TABLE driver_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID UNIQUE NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    heading DECIMAL(5, 2),                     -- direction in degrees
    speed DECIMAL(6, 2),                       -- km/h
    accuracy DECIMAL(8, 2),                    -- meters
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_driver_locations_geo ON driver_locations USING GIST (location);
CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);

-- Passenger Locations (real-time)
CREATE TABLE passenger_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID UNIQUE NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_passenger_locations_geo ON passenger_locations USING GIST (location);

-- =============================================================
-- 6. RIDE MODULE (سفر)
-- =============================================================

-- Ride Requests (درخواست سفر)
CREATE TABLE ride_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL,
    ride_type ride_type NOT NULL DEFAULT 'normal',
    car_class vehicle_class NOT NULL DEFAULT 'economy',
    pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
    pickup_address TEXT,
    pickup_poi VARCHAR(255),                   -- point of interest name
    dropoff_location GEOGRAPHY(POINT, 4326),
    dropoff_address TEXT,
    dropoff_poi VARCHAR(255),
    route_polyline TEXT,                        -- encoded polyline
    distance_km DECIMAL(10, 2),
    duration_minutes INTEGER,
    estimated_fare BIGINT,                     -- in Rial
    surge_multiplier DECIMAL(3, 2) DEFAULT 1.00,
    status ride_status NOT NULL DEFAULT 'pending',
    passenger_count INTEGER DEFAULT 1,
    notes TEXT,                                 -- یادداشت مسافر
    scheduled_at TIMESTAMP WITH TIME ZONE,     -- for scheduled rides
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_requests_status ON ride_requests(status);
CREATE INDEX idx_ride_requests_passenger ON ride_requests(passenger_id);
CREATE INDEX idx_ride_requests_pickup ON ride_requests USING GIST (pickup_location);
CREATE INDEX idx_ride_requests_car_class ON ride_requests(car_class);
CREATE INDEX idx_ride_requests_created ON ride_requests(created_at);

-- Active Rides (سفر فعال)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID,
    passenger_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    vehicle_id UUID NOT NULL,
    ride_type ride_type NOT NULL DEFAULT 'normal',
    car_class vehicle_class NOT NULL,
    status ride_status NOT NULL DEFAULT 'accepted',
    pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
    pickup_address TEXT,
    dropoff_location GEOGRAPHY(POINT, 4326),
    dropoff_address TEXT,
    route_polyline TEXT,
    distance_km DECIMAL(10, 2),
    duration_minutes INTEGER,
    fare BIGINT,                               -- final fare in Rial
    fare_breakdown JSONB,                       -- { base, distance, time, surge, toll, discount }
    payment_method payment_method DEFAULT 'cash',
    payment_status payment_status DEFAULT 'pending',
    passenger_rated BOOLEAN DEFAULT FALSE,
    driver_rated BOOLEAN DEFAULT FALSE,
    cancelled_by UUID,                          -- who cancelled
    cancellation_reason TEXT,
    cancellation_fee BIGINT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    arrived_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES ride_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (passenger_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_passenger ON rides(passenger_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_created ON rides(created_at);
CREATE INDEX idx_rides_payment_status ON rides(payment_status);

-- Ride Location Tracking (نقشه مسیر سفر)
CREATE TABLE ride_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    heading DECIMAL(5, 2),
    speed DECIMAL(6, 2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_locations_ride ON ride_locations(ride_id);
CREATE INDEX idx_ride_locations_time ON ride_locations(recorded_at);

-- Ride Stops (توقفات سفر — e.g. multi-stop)
CREATE TABLE ride_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL,
    stop_order INTEGER NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    arrival_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_stops_ride ON ride_stops(ride_id);

-- =============================================================
-- 7. RATINGS & FEEDBACK
-- =============================================================

-- Ratings (امتیازدهی)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL,
    rater_id UUID NOT NULL,
    ratee_id UUID NOT NULL,
    target rating_target NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT,
    tags JSONB,                                 -- ["clean_car", "polite", "good_driving"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ratee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(ride_id, rater_id, target)
);

CREATE INDEX idx_ratings_ride ON ratings(ride_id);
CREATE INDEX idx_ratings_ratee ON ratings(ratee_id);

-- Feedback Questions (سوالات نظرسنجی)
CREATE TABLE feedback_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    question_fa TEXT,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feedback Responses (پاسخ‌های نظرسنجی)
CREATE TABLE feedback_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    question_id UUID NOT NULL,
    ride_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES feedback_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);

CREATE INDEX idx_feedback_responses_user ON feedback_responses(user_id);
CREATE INDEX idx_feedback_responses_question ON feedback_responses(question_id);

-- Support Tickets (تیکت پشتیبانی)
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    ride_id UUID,
    subject VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    status ticket_status NOT NULL DEFAULT 'open',
    priority ticket_priority NOT NULL DEFAULT 'medium',
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Support Ticket Messages
CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB,                           -- ["url1", "url2"]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_support_ticket_messages_ticket ON support_ticket_messages(ticket_id);

-- =============================================================
-- 8. FINANCIAL MODULE (کیف پول و تراکنش‌ها)
-- =============================================================

-- Wallets (کیف پول)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    balance BIGINT NOT NULL DEFAULT 0,          -- in Rial
    frozen_balance BIGINT DEFAULT 0,            -- temporarily locked
    currency VARCHAR(3) DEFAULT 'IRR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (balance >= 0),
    CHECK (frozen_balance >= 0)
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- Transactions (تراکنش‌ها)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL,
    type transaction_type NOT NULL,
    amount BIGINT NOT NULL,                     -- positive=in, negative=out
    balance_before BIGINT,
    balance_after BIGINT,
    ride_id UUID,
    reference_id UUID,                          -- related entity
    reference_type VARCHAR(50),                 -- 'ride', 'withdrawal', 'topup'
    description TEXT,
    description_fa TEXT,
    metadata JSONB,                             -- extra data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);

CREATE INDEX idx_transactions_wallet ON transactions(wallet_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);
CREATE INDEX idx_transactions_ride ON transactions(ride_id);

-- Withdrawal Requests (درخواست برداشت)
CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    card_number VARCHAR(20),
    shaba_number VARCHAR(24),                   -- شماره شبا
    status withdrawal_status NOT NULL DEFAULT 'pending',
    processed_by UUID,
    processed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    transaction_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_withdrawals_driver ON withdrawals(driver_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- Revenue Sharing (سهم‌بندی درآمد)
CREATE TABLE revenue_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    company_id UUID,
    total_fare BIGINT NOT NULL,
    platform_commission BIGINT NOT NULL,        -- کمیسیون سامانه
    driver_share BIGINT NOT NULL,               -- سهم راننده
    company_share BIGINT DEFAULT 0,             -- سهم شرکت
    commission_rate DECIMAL(5, 2) NOT NULL,     -- %
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

CREATE INDEX idx_revenue_shares_ride ON revenue_shares(ride_id);
CREATE INDEX idx_revenue_shares_driver ON revenue_shares(driver_id);

-- Banks (بانک‌ها)
CREATE TABLE banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_fa VARCHAR(100),
    code VARCHAR(10) UNIQUE NOT NULL,           -- bank code
    logo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    supports_shaba BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Gateway Transactions
CREATE TABLE payment_gateway_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    ride_id UUID,
    wallet_id UUID,
    gateway VARCHAR(50) NOT NULL,               -- 'zarinpal', 'sep', 'pay.ir'
    authority VARCHAR(255),                     -- gateway authority code
    reference_id VARCHAR(255),                  -- gateway reference
    amount BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    payment_method payment_method DEFAULT 'gateway',
    card_number_masked VARCHAR(20),             -- masked card number
    rrn VARCHAR(20),                            -- RRN from bank
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL,
    FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE SET NULL
);

CREATE INDEX idx_pgtx_user ON payment_gateway_transactions(user_id);
CREATE INDEX idx_pgtx_authority ON payment_gateway_transactions(authority);
CREATE INDEX idx_pgtx_status ON payment_gateway_transactions(status);

-- =============================================================
-- 9. DYNAMIC PRICING ENGINE (نرخ‌گذاری پویا)
-- =============================================================

-- Base Fares (نرخ پایه)
CREATE TABLE base_fares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    car_class vehicle_class NOT NULL,
    ride_type ride_type NOT NULL DEFAULT 'normal',
    base_fare BIGINT NOT NULL,                  -- هزینه پایه (Rial)
    per_km_rate BIGINT NOT NULL,               -- هزینه هر کیلومتر
    per_minute_rate BIGINT NOT NULL,           -- هزینه هر دقیقه
    min_fare BIGINT NOT NULL,                  -- حداقل کرایه
    max_fare BIGINT,                           -- حداکثر کرایه (null=no limit)
    waiting_per_minute BIGINT DEFAULT 0,       -- هزینه انتظار هر دقیقه
    is_active BOOLEAN DEFAULT TRUE,
    city VARCHAR(100) DEFAULT 'default',       -- city-specific pricing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_base_fares_class ON base_fares(car_class);
CREATE INDEX idx_base_fares_city ON base_fares(city);

-- Surge Pricing Rules (قیمت‌گذاری بر اساس عرضه و تقاضا)
CREATE TABLE surge_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    car_class vehicle_class,
    min_drivers INTEGER,                       -- if drivers < this → surge
    max_wait_seconds INTEGER DEFAULT 300,
    multiplier DECIMAL(3, 2) NOT NULL,         -- e.g. 1.5 = 50% more
    max_multiplier DECIMAL(3, 2) DEFAULT 3.00,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Time-based Pricing (افزایش قیمت بر اساس زمان)
CREATE TABLE time_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    car_class vehicle_class,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_time < end_time)
);

-- Weather-based Pricing (افزایش قیمت بر اساس آب‌وهوا)
CREATE TABLE weather_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    weather_condition VARCHAR(50) NOT NULL,     -- 'rain', 'snow', 'fog', 'extreme_heat'
    multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    car_class vehicle_class,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Road Condition Pricing (افزایش قیمت بر اساس وضعیت جاده)
CREATE TABLE road_condition_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    condition_type VARCHAR(50) NOT NULL,       -- 'traffic_heavy', 'construction', 'flooding'
    multiplier DECIMAL(3, 2) NOT NULL DEFAULT 1.00,
    region GEOGRAPHY(POLYGON, 4326),           -- affected area
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_road_condition_region ON road_condition_pricing USING GIST (region);

-- Intercity Pricing (قیمت‌گذاری بین‌شهری)
CREATE TABLE intercity_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    car_class vehicle_class NOT NULL,
    base_fare BIGINT NOT NULL,
    per_km_rate BIGINT NOT NULL,
    min_fare BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(origin_city, destination_city, car_class)
);

-- Discounts & Promo Codes (تخفیف‌ها و کدهای تخفیف)
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    description_fa TEXT,
    type promo_type NOT NULL,
    value BIGINT NOT NULL,                      -- percentage (1-100) or fixed amount (Rial)
    max_uses INTEGER,                           -- null=unlimited
    used_count INTEGER DEFAULT 0,
    min_fare BIGINT,                            -- minimum fare to apply
    max_discount BIGINT,                        -- cap for percentage discounts
    applicable_classes vehicle_class[],          -- array of applicable car classes
    applicable_ride_types ride_type[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User-Promotion usage tracking
CREATE TABLE user_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    promotion_id UUID NOT NULL,
    ride_id UUID,
    discount_amount BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE CASCADE,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE SET NULL
);

CREATE INDEX idx_user_promotions_user ON user_promotions(user_id);
CREATE INDEX idx_user_promotions_promotion ON user_promotions(promotion_id);

-- =============================================================
-- 10. NOTIFICATIONS (اعلانات)
-- =============================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_fa VARCHAR(255),
    body TEXT NOT NULL,
    body_fa TEXT,
    data JSONB,                                 -- extra payload (ride_id, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Device Tokens (for push notifications)
CREATE TABLE device_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    platform app_platform NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);

-- =============================================================
-- 11. CMS MODULE (سیستم مدیریت محتوا)
-- =============================================================

-- CMS Pages
CREATE TABLE cms_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_fa VARCHAR(255),
    content TEXT,
    content_fa TEXT,
    type content_type NOT NULL DEFAULT 'page',
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cms_pages_slug ON cms_pages(slug);
CREATE INDEX idx_cms_pages_type ON cms_pages(type);

-- CMS Banners
CREATE TABLE cms_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position VARCHAR(50) NOT NULL DEFAULT 'home', -- 'home', 'ride', 'wallet'
    target_platform app_platform[],
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CMS Translations (for multi-lang support)
CREATE TABLE cms_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,          -- 'page', 'banner', 'faq'
    entity_id UUID NOT NULL,
    locale VARCHAR(10) NOT NULL,               -- 'fa', 'en', 'ar'
    field VARCHAR(50) NOT NULL,                -- 'title', 'content'
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(entity_type, entity_id, locale, field)
);

-- =============================================================
-- 12. FAVORITE LOCATIONS (مکان‌های مورد علاقه)
-- =============================================================

CREATE TABLE favorite_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(50) NOT NULL,                  -- 'home', 'work', etc.
    name_fa VARCHAR(50),
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_favorite_locations_user ON favorite_locations(user_id);
CREATE INDEX idx_favorite_locations_geo ON favorite_locations USING GIST (location);

-- =============================================================
-- 13. PACKAGES (پکیج‌ها و اشتراک‌ها)
-- =============================================================

CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_fa VARCHAR(100),
    description TEXT,
    description_fa TEXT,
    price BIGINT NOT NULL,                      -- in Rial
    duration_days INTEGER NOT NULL,             -- validity in days
    ride_credits INTEGER,                       -- number of rides included (null=unlimited)
    credit_amount BIGINT,                       -- wallet credit included
    discount_percent DECIMAL(5, 2),             -- discount on rides
    applicable_classes vehicle_class[],
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Package Purchases
CREATE TABLE user_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    package_id UUID NOT NULL,
    rides_used INTEGER DEFAULT 0,
    rides_remaining INTEGER,
    credit_used BIGINT DEFAULT 0,
    credit_remaining BIGINT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE RESTRICT
);

CREATE INDEX idx_user_packages_user ON user_packages(user_id);
CREATE INDEX idx_user_packages_active ON user_packages(user_id, is_active) WHERE is_active = TRUE;

-- =============================================================
-- 14. SETTINGS (تنظیمات سامانه)
-- =============================================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    description_fa TEXT,
    is_public BOOLEAN DEFAULT FALSE,            -- visible to clients
    updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settings_key ON settings(key);
CREATE INDEX idx_settings_category ON settings(category);

-- =============================================================
-- 15. APP CONFIGURATION (تنظیمات اپلیکیشن)
-- =============================================================

CREATE TABLE app_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform app_platform NOT NULL,
    version VARCHAR(20) NOT NULL,               -- '1.0.0'
    min_version VARCHAR(20),                    -- minimum supported version
    force_update BOOLEAN DEFAULT FALSE,
    update_url TEXT,
    release_notes TEXT,
    release_notes_fa TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- 16. CHAT / IN-RIDE MESSAGING
-- =============================================================

CREATE TABLE ride_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',    -- 'text', 'location', 'image'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_messages_ride ON ride_messages(ride_id);

-- =============================================================
-- 17. AUDIT LOGS (لاگ‌ها)
-- =============================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,               -- 'user.login', 'ride.complete', etc.
    entity_type VARCHAR(50),
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================================
-- 18. SURCHARGE / TOLL RULES (عوارض و افزایش‌ها)
-- =============================================================

CREATE TABLE toll_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_fa VARCHAR(100),
    amount BIGINT NOT NULL,                     -- in Rial
    toll_type VARCHAR(50) NOT NULL,             -- 'highway', 'bridge', 'airport', 'city_entry'
    region GEOGRAPHY(POLYGON, 4326),            -- affected geographic area (null=global)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_toll_rules_region ON toll_rules USING GIST (region);

-- =============================================================
-- 19. SCHEDULED RIDES (سفرهای زمان‌بندی شده)
-- =============================================================

-- (Handled via scheduled_at on ride_requests, but adding recurrence support)
CREATE TABLE ride_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    request_template JSONB NOT NULL,            -- stores the ride request data
    recurrence VARCHAR(20),                     -- 'daily', 'weekly', 'weekdays', 'custom'
    recurrence_days SMALLINT[],                 -- [1,2,3,4,5] for weekdays
    next_trigger_at TIMESTAMP WITH TIME ZONE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ride_schedules_user ON ride_schedules(user_id);
CREATE INDEX idx_ride_schedules_next ON ride_schedules(next_trigger_at) WHERE is_active = TRUE;

-- =============================================================
-- HELPER FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_locations_updated_at BEFORE UPDATE ON driver_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passenger_locations_updated_at BEFORE UPDATE ON passenger_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_requests_updated_at BEFORE UPDATE ON ride_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON cms_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_base_fares_updated_at BEFORE UPDATE ON base_fares
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intercity_pricing_updated_at BEFORE UPDATE ON intercity_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- SEED DATA
-- =============================================================

-- Default banks (Iranian banks)
INSERT INTO banks (name, name_fa, code) VALUES
('Bank Melli', 'بانک ملی', '017'),
('Bank Sepah', 'بانک سپه', '015'),
('Bank Tejarat', 'بانک تجارت', '018'),
('Bank Mellat', 'بانک ملت', '012'),
('Bank Saderat', 'بانک صادرات', '019'),
('Bank Keshavarzi', 'بانک کشاورزی', '016'),
('Bank Maskan', 'بانک مسکن', '014'),
('Bank Refah', 'بانک رفاه', '013'),
('Bank Sanaat', 'بانک صنعت و معدن', '011'),
('Bank Post', 'پست بانک', '022'),
('Bank Eqtesad', 'بانک اقتصاد نوین', '055'),
('Bank Parsian', 'بانک پارسیان', '054'),
('Bank Pasargad', 'بانک پاسارگاد', '057'),
('Bank Saman', 'بانک سامان', '056'),
('Bank Sarmayeh', 'بانک سرمایه', '058'),
('Bank Dey', 'بانک دی', '066'),
('Bank Ayandeh', 'بانک آینده', '063'),
('Bank Khavarsonat', 'بانک خاورمیانه', '078'),
('Bank Resalat', 'بانک رسالت', '021');

-- Default car brands (common in Iran)
INSERT INTO car_brands (name, name_fa) VALUES
('Iran Khodro', 'ایران خودرو'),
('SAIPA', 'سایپا'),
('SAIPA Kodro', 'سایپا کدرو'),
('Pars Khodro', 'پارس خودرو'),
('Renault', 'رنو'),
('Peugeot', 'پژو'),
('Toyota', 'تویوتا'),
('Hyundai', 'هیوندای'),
('Kia', 'کیا'),
('Nissan', 'نیسان'),
('MVM', 'ام‌وی‌ام'),
('Chery', 'چری'),
('BYD', 'بی‌یو‌دی'),
('Honda', 'هوندا');

-- Default car models (popular in Iran)
INSERT INTO car_models (brand_id, name, name_fa, vehicle_class) VALUES
((SELECT id FROM car_brands WHERE name = 'Iran Khodro'), 'Samand', 'سمند', 'economy'),
((SELECT id FROM car_brands WHERE name = 'Iran Khodro'), 'Runna', 'رونا', 'economy'),
((SELECT id FROM car_brands WHERE name = 'Iran Khodro'), 'Dena', 'دنا', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'SAIPA'), 'Tiba', 'تیبا', 'eco'),
((SELECT id FROM car_brands WHERE name = 'SAIPA'), 'Quick', 'کوییک', 'economy'),
((SELECT id FROM car_brands WHERE name = 'SAIPA'), 'Saina', 'ساینا', 'economy'),
((SELECT id FROM car_brands WHERE name = 'SAIPA Kodro'), 'Rira', 'ری‌را', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Pars Khodro'), 'Arizo', 'آریزو', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Peugeot'), '206', 'پژو ۲۰۶', 'economy'),
((SELECT id FROM car_brands WHERE name = 'Peugeot'), '207', 'پژو ۲۰۷', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Peugeot'), 'Pars', 'پژو پارس', 'economy'),
((SELECT id FROM car_brands WHERE name = 'Renault'), 'L90 (Tondar)', 'رنو ال‌۹۰ (تندر)', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Renault'), 'Logan', 'رنو لوگان', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Toyota'), 'Corolla', 'تویوتا کرولا', 'premium'),
((SELECT id FROM car_brands WHERE name = 'Toyota'), 'Camry', 'تویوتا کمری', 'premium'),
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'Accent', 'هیوندای اکسنت', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Hyundai'), 'Elantra', 'هیوندای الانترا', 'premium'),
((SELECT id FROM car_brands WHERE name = 'Kia'), 'Cerato', 'کیا سراتو', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Kia'), 'Rio', 'کیا ریو', 'economy'),
((SELECT id FROM car_brands WHERE name = 'MVM'), '315', 'ام‌وی‌ام ۳۱۵', 'eco'),
((SELECT id FROM car_brands WHERE name = 'MVM'), 'X33', 'ام‌وی‌ام ایکس۳۳', 'comfort'),
((SELECT id FROM car_brands WHERE name = 'Chery'), 'Arrizo 5', 'چری آریزو ۵', 'economy'),
((SELECT id FROM car_brands WHERE name = 'BYD'), 'F3', 'بی‌یو‌دی اف۳', 'economy');

-- Default base fares (Toman → converted to Rial, 1 Toman = 10 Rial)
INSERT INTO base_fares (car_class, ride_type, base_fare, per_km_rate, per_minute_rate, min_fare) VALUES
('eco', 'normal', 150000, 35000, 5000, 200000),
('economy', 'normal', 200000, 45000, 7000, 250000),
('comfort', 'normal', 300000, 60000, 10000, 350000),
('premium', 'normal', 500000, 90000, 15000, 600000),
('van', 'normal', 400000, 70000, 12000, 450000),
('motorcycle', 'normal', 100000, 25000, 3000, 120000),
('tuk_tuk', 'normal', 120000, 30000, 4000, 150000),
-- Intercity base fares
('economy', 'intercity', 500000, 55000, 8000, 600000),
('comfort', 'intercity', 800000, 80000, 12000, 900000),
('premium', 'intercity', 1200000, 120000, 18000, 1400000);

-- Default weather pricing rules
INSERT INTO weather_pricing_rules (name, weather_condition, multiplier) VALUES
('Rain', 'rain', 1.25),
('Heavy Rain', 'heavy_rain', 1.50),
('Snow', 'snow', 1.50),
('Fog', 'fog', 1.20),
('Extreme Heat', 'extreme_heat', 1.10);

-- Default settings
INSERT INTO settings (key, value, type, category, description, description_fa, is_public) VALUES
('platform_name', 'Pooyesh Taxi', 'string', 'general', 'Platform name', 'نام سامانه', TRUE),
('platform_name_fa', 'پویش تاکسی', 'string', 'general', 'Platform name in Persian', 'نام فارسی سامانه', TRUE),
('platform_commission', '15', 'number', 'pricing', 'Default platform commission %', 'کمیسیون پیش‌فرض سامانه', FALSE),
('currency', 'IRR', 'string', 'general', 'Currency code', 'کد ارز', TRUE),
('currency_name', 'Rial', 'string', 'general', 'Currency name', 'نام ارز', TRUE),
('max_search_radius_km', '5', 'number', 'matching', 'Max radius to search for drivers', 'حداکثر شعاع جستجوی راننده', TRUE),
('driver_break_timeout_minutes', '30', 'number', 'driver', 'Max break duration', 'حداکثر مدت استراحت', FALSE),
('ride_expiry_seconds', '120', 'number', 'ride', 'Ride request expiry time', 'زمان انقضای درخواست سفر', TRUE),
('min_driver_rating', '4.0', 'number', 'driver', 'Minimum driver rating', 'حداقل امتیاز راننده', FALSE),
('max_cancellation_fee', '50000', 'number', 'ride', 'Maximum cancellation fee (Rial)', 'حداکثر جریمه لغو', TRUE),
('support_phone', '+982112345678', 'string', 'contact', 'Support phone number', 'شماره پشتیبانی', TRUE),
('support_email', 'support@pooyesh.taxi', 'string', 'contact', 'Support email', 'ایمیل پشتیبانی', TRUE),
('emergency_phone', '115', 'string', 'contact', 'Emergency phone number', 'شماره اضطراری', TRUE);

-- Default feedback questions
INSERT INTO feedback_questions (question, question_fa, category, sort_order) VALUES
('How was the driver behavior?', 'رفتار راننده چگونه بود؟', 'driver', 1),
('How clean was the vehicle?', 'خودرو چقدر تمیز بود؟', 'vehicle', 2),
('Was the ride comfortable?', 'آیا سفر راحت بود؟', 'ride', 3),
('Did the driver follow the route?', 'آیا راننده مسیر را رعایت کرد؟', 'ride', 4),
('Was the fare fair?', 'آیا کرایه مناسب بود؟', 'pricing', 5),
('Would you use this service again?', 'آیا دوباره از این سرویس استفاده می‌کنید؟', 'general', 6);

-- =============================================================
-- VIEWS
-- =============================================================

-- Driver earnings summary
CREATE VIEW v_driver_earnings AS
SELECT
    dp.id AS driver_id,
    u.first_name || ' ' || u.last_name AS driver_name,
    COUNT(r.id) AS total_rides,
    COALESCE(SUM(rs.driver_share), 0) AS total_earnings,
    COALESCE(AVG(dp.rating), 0) AS avg_rating,
    DATE_TRUNC('month', r.completed_at) AS month
FROM driver_profiles dp
JOIN users u ON u.id = dp.user_id
LEFT JOIN rides r ON r.driver_id = dp.id AND r.status = 'completed'
LEFT JOIN revenue_shares rs ON rs.ride_id = r.id
GROUP BY dp.id, u.first_name, u.last_name, DATE_TRUNC('month', r.completed_at);

-- Active rides dashboard
CREATE VIEW v_active_rides AS
SELECT
    r.id,
    r.status,
    r.ride_type,
    r.car_class,
    u_p.first_name || ' ' || u_p.last_name AS passenger_name,
    u_p.phone AS passenger_phone,
    u_d.first_name || ' ' || u_d.last_name AS driver_name,
    u_d.phone AS driver_phone,
    v.license_plate,
    r.pickup_address,
    r.dropoff_address,
    r.distance_km,
    r.started_at,
    r.created_at
FROM rides r
JOIN users u_p ON u_p.id = r.passenger_id
JOIN driver_profiles dp ON dp.id = r.driver_id
JOIN users u_d ON u_d.id = dp.user_id
JOIN vehicles v ON v.id = r.vehicle_id
WHERE r.status IN ('accepted', 'arriving', 'arrived', 'in_progress');

-- Daily ride statistics
CREATE VIEW v_daily_stats AS
SELECT
    DATE(created_at) AS ride_date,
    COUNT(*) AS total_rides,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_rides,
    COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_rides,
    AVG(distance_km) FILTER (WHERE status = 'completed') AS avg_distance,
    AVG(duration_minutes) FILTER (WHERE status = 'completed') AS avg_duration,
    SUM(fare) FILTER (WHERE status = 'completed') AS total_revenue,
    COUNT(DISTINCT driver_id) AS active_drivers,
    COUNT(DISTINCT passenger_id) AS active_passengers
FROM rides
GROUP BY DATE(created_at)
ORDER BY ride_date DESC;

-- =============================================================
-- END OF SCHEMA
-- =============================================================

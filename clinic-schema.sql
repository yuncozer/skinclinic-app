-- Clinic Management Database Schema for Supabase (PostgreSQL)

-- =============================================================================
-- PATIENTS TABLE
-- =============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    id_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PROCEDURES TABLE
-- =============================================================================
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    procedure_name TEXT NOT NULL,
    procedure_date DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PAYMENTS (ABONOS) TABLE
-- =============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    procedure_id UUID NOT NULL REFERENCES procedures(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- APP USERS TABLE
-- =============================================================================
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'user')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_procedures_patient_id ON procedures(patient_id);
CREATE INDEX idx_procedures_procedure_date ON procedures(procedure_date);
CREATE INDEX idx_payments_procedure_id ON payments(procedure_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_app_users_email ON app_users(email);

-- =============================================================================
-- EXAMPLE INSERT QUERIES
-- =============================================================================

-- Insert sample patients
INSERT INTO patients (full_name, id_number, phone, email, address)
VALUES 
    ('John Smith', '12345678', '+1234567890', 'john.smith@email.com', '123 Main St, City'),
    ('Maria Garcia', '87654321', '+0987654321', 'maria.garcia@email.com', '456 Oak Ave, Town'),
    ('David Chen', '11223344', '+1122334455', NULL, '789 Pine Rd, Village');

-- Insert sample procedures
INSERT INTO procedures (patient_id, procedure_name, procedure_date, total_amount, amount_paid)
SELECT 
    id,
    'Teeth Cleaning',
    '2026-01-15',
    150.00,
    150.00
FROM patients WHERE id_number = '12345678';

INSERT INTO procedures (patient_id, procedure_name, procedure_date, total_amount, amount_paid)
SELECT 
    id,
    'Root Canal',
    '2026-02-20',
    800.00,
    400.00
FROM patients WHERE id_number = '12345678';

INSERT INTO procedures (patient_id, procedure_name, procedure_date, total_amount, amount_paid)
SELECT 
    id,
    'Dental Crown',
    '2026-03-10',
    500.00,
    200.00
FROM patients WHERE id_number = '87654321';

-- =============================================================================
-- EXAMPLE QUERY: List patients with their procedures and remaining balance
-- =============================================================================
SELECT 
    p.id AS patient_id,
    p.full_name,
    p.id_number,
    p.phone,
    p.email,
    p.address,
    pr.id AS procedure_id,
    pr.procedure_name,
    pr.procedure_date,
    pr.total_amount,
    pr.amount_paid,
    (pr.total_amount - pr.amount_paid) AS remaining_amount
FROM patients p
LEFT JOIN procedures pr ON p.id = pr.patient_id
ORDER BY p.full_name, pr.procedure_date;

-- Alternative: Aggregate view - total balance per patient
SELECT 
    p.id AS patient_id,
    p.full_name,
    p.id_number,
    p.phone,
    SUM(pr.total_amount) AS total_billed,
    SUM(pr.amount_paid) AS total_paid,
    SUM(pr.total_amount) - SUM(pr.amount_paid) AS remaining_balance
FROM patients p
LEFT JOIN procedures pr ON p.id = pr.patient_id
GROUP BY p.id, p.full_name, p.id_number, p.phone
ORDER BY remaining_balance DESC;
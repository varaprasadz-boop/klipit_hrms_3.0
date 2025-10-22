-- Klipit by Bova - Database Seed Data
-- This file contains all test data for importing into Neon PostgreSQL
-- Generated: 2025-10-21

-- ============================================
-- 1. COMPANIES
-- ============================================
INSERT INTO companies (id, name, email, status, plan, max_employees, logo_url, address, phone, website, primary_color, secondary_color, created_at)
VALUES 
('comp-tech-solutions-001', 'Tech Solutions Inc', 'admin@techsolutions.com', 'active', 'premium', '100', NULL, NULL, NULL, NULL, '#00C853', '#000000', NOW());

-- ============================================
-- 2. USERS
-- ============================================

-- Super Admin
INSERT INTO users (id, email, password, name, role, company_id, department, position, status, created_at)
VALUES 
('user-superadmin-001', 'superadmin@klipit.com', '123456', 'Super Administrator', 'SUPER_ADMIN', NULL, NULL, 'System Administrator', 'active', NOW());

-- Company Admin
INSERT INTO users (id, email, password, name, role, company_id, department, position, status, created_at)
VALUES 
('user-admin-001', 'admin@techsolutions.com', '123456', 'John Admin', 'COMPANY_ADMIN', 'comp-tech-solutions-001', 'Management', 'HR Manager', 'active', NOW());

-- Employees
INSERT INTO users (id, email, password, name, role, company_id, department, position, status, created_at)
VALUES 
('user-employee-001', 'sarah.johnson@techsolutions.com', '123456', 'Sarah Johnson', 'EMPLOYEE', 'comp-tech-solutions-001', 'Engineering', 'Senior Engineer', 'active', NOW()),
('user-employee-002', 'michael.chen@techsolutions.com', '123456', 'Michael Chen', 'EMPLOYEE', 'comp-tech-solutions-001', 'Engineering', 'Engineer', 'active', NOW()),
('user-employee-003', 'emily.rodriguez@techsolutions.com', '123456', 'Emily Rodriguez', 'EMPLOYEE', 'comp-tech-solutions-001', 'Sales', 'Sales Manager', 'active', NOW()),
('user-employee-004', 'david.kumar@techsolutions.com', '123456', 'David Kumar', 'EMPLOYEE', 'comp-tech-solutions-001', 'Human Resources', 'HR Coordinator', 'active', NOW());

-- ============================================
-- 3. DEPARTMENTS
-- ============================================
INSERT INTO departments (id, company_id, name, description, created_at)
VALUES 
('dept-engineering-001', 'comp-tech-solutions-001', 'Engineering', 'Software Development Team', NOW()),
('dept-hr-001', 'comp-tech-solutions-001', 'Human Resources', 'HR Department', NOW()),
('dept-sales-001', 'comp-tech-solutions-001', 'Sales', 'Sales and Marketing', NOW()),
('dept-management-001', 'comp-tech-solutions-001', 'Management', 'Executive Management', NOW());

-- ============================================
-- 4. ROLES & LEVELS
-- ============================================
INSERT INTO roles_levels (id, company_id, role, level, created_at)
VALUES 
('role-jr-mgr-001', 'comp-tech-solutions-001', 'Manager', 'Junior', NOW()),
('role-sr-mgr-001', 'comp-tech-solutions-001', 'Manager', 'Senior', NOW()),
('role-top-mgmt-001', 'comp-tech-solutions-001', 'Leadership', 'Top Management', NOW());

-- ============================================
-- 5. EMPLOYEES (with CTC data)
-- ============================================
INSERT INTO employees (
  id, company_id, first_name, last_name, email, phone, 
  department_id, designation_id, role_level_id, reporting_manager_id,
  status, join_date, exit_date, attendance_type,
  education, experience, documents, ctc, assets, bank, insurance, statutory,
  created_at
)
VALUES 
(
  'emp-001', 'comp-tech-solutions-001', 'Sarah', 'Johnson', 
  'sarah.johnson@techsolutions.com', '+1-555-0101',
  'dept-engineering-001', NULL, 'role-sr-mgr-001', NULL,
  'active', '2022-01-15', NULL, 'regular',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[
    {"component": "Basic Salary", "amount": 50000, "frequency": "monthly", "type": "payable"},
    {"component": "HRA", "amount": 20000, "frequency": "monthly", "type": "payable"},
    {"component": "Transport Allowance", "amount": 5000, "frequency": "monthly", "type": "payable"},
    {"component": "Provident Fund", "amount": 6000, "frequency": "monthly", "type": "deductable"},
    {"component": "Professional Tax", "amount": 200, "frequency": "monthly", "type": "deductable"}
  ]'::jsonb,
  '[]'::jsonb, NULL, NULL, NULL, NOW()
),
(
  'emp-002', 'comp-tech-solutions-001', 'Michael', 'Chen',
  'michael.chen@techsolutions.com', '+1-555-0102',
  'dept-engineering-001', NULL, 'role-jr-mgr-001', 'emp-001',
  'active', '2021-06-01', NULL, 'regular',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[
    {"component": "Basic Salary", "amount": 40000, "frequency": "monthly", "type": "payable"},
    {"component": "HRA", "amount": 16000, "frequency": "monthly", "type": "payable"},
    {"component": "Transport Allowance", "amount": 4000, "frequency": "monthly", "type": "payable"},
    {"component": "Provident Fund", "amount": 4800, "frequency": "monthly", "type": "deductable"},
    {"component": "Professional Tax", "amount": 200, "frequency": "monthly", "type": "deductable"}
  ]'::jsonb,
  '[]'::jsonb, NULL, NULL, NULL, NOW()
),
(
  'emp-003', 'comp-tech-solutions-001', 'Emily', 'Rodriguez',
  'emily.rodriguez@techsolutions.com', '+1-555-0103',
  'dept-sales-001', NULL, 'role-top-mgmt-001', NULL,
  'active', '2020-09-15', NULL, 'regular',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[
    {"component": "Basic Salary", "amount": 45000, "frequency": "monthly", "type": "payable"},
    {"component": "HRA", "amount": 18000, "frequency": "monthly", "type": "payable"},
    {"component": "Sales Incentive", "amount": 10000, "frequency": "monthly", "type": "payable"},
    {"component": "Transport Allowance", "amount": 4500, "frequency": "monthly", "type": "payable"},
    {"component": "Provident Fund", "amount": 5400, "frequency": "monthly", "type": "deductable"},
    {"component": "Professional Tax", "amount": 200, "frequency": "monthly", "type": "deductable"}
  ]'::jsonb,
  '[]'::jsonb, NULL, NULL, NULL, NOW()
),
(
  'emp-004', 'comp-tech-solutions-001', 'David', 'Kumar',
  'david.kumar@techsolutions.com', '+1-555-0104',
  'dept-hr-001', NULL, 'role-jr-mgr-001', 'emp-001',
  'active', '2023-02-01', NULL, 'regular',
  '[]'::jsonb, '[]'::jsonb, '[]'::jsonb,
  '[
    {"component": "Basic Salary", "amount": 35000, "frequency": "monthly", "type": "payable"},
    {"component": "HRA", "amount": 14000, "frequency": "monthly", "type": "payable"},
    {"component": "Transport Allowance", "amount": 3500, "frequency": "monthly", "type": "payable"},
    {"component": "Provident Fund", "amount": 4200, "frequency": "monthly", "type": "deductable"},
    {"component": "Professional Tax", "amount": 200, "frequency": "monthly", "type": "deductable"}
  ]'::jsonb,
  '[]'::jsonb, NULL, NULL, NULL, NOW()
);

-- ============================================
-- 6. SAMPLE ATTENDANCE RECORDS (Last 30 days for Sarah Johnson)
-- ============================================
INSERT INTO attendance_records (id, company_id, employee_id, date, status, check_in, check_out, duration, shift_id, location, notes, created_at)
SELECT 
  gen_random_uuid(),
  'comp-tech-solutions-001',
  'emp-001',
  CURRENT_DATE - (n || ' days')::interval,
  'present',
  (CURRENT_DATE - (n || ' days')::interval + TIME '09:00:00')::timestamp,
  (CURRENT_DATE - (n || ' days')::interval + TIME '18:00:00')::timestamp,
  NULL,
  NULL,
  'Office',
  NULL,
  NOW()
FROM generate_series(1, 30) AS n
WHERE EXTRACT(DOW FROM CURRENT_DATE - (n || ' days')::interval) NOT IN (0, 6); -- Exclude weekends

-- ============================================
-- 7. SAMPLE PAYROLL RECORDS (Last 2 months)
-- ============================================

-- Payroll for Sarah Johnson (Published)
INSERT INTO payroll_records (
  id, company_id, employee_id, month, year, status,
  working_days, present_days, absent_days, paid_leave_days, overtime_hours,
  gross_pay, total_deductions, net_pay,
  approved_by, approved_at, rejection_reason,
  payslip_published, payslip_published_at, created_at
)
VALUES 
(
  'payroll-emp1-sep2025', 'comp-tech-solutions-001', 'emp-001',
  9, 2025, 'approved',
  22, 20, 2, 0, 0,
  75000, 6200, 68800,
  'user-admin-001', NOW() - INTERVAL '15 days', NULL,
  TRUE, NOW() - INTERVAL '14 days', NOW() - INTERVAL '20 days'
);

-- Payroll Items for Sarah Johnson
INSERT INTO payroll_items (id, payroll_id, ctc_component_id, type, name, amount, description, created_at)
VALUES 
('payitem-001', 'payroll-emp1-sep2025', NULL, 'earning', 'Basic Salary', 50000, NULL, NOW()),
('payitem-002', 'payroll-emp1-sep2025', NULL, 'earning', 'HRA', 20000, NULL, NOW()),
('payitem-003', 'payroll-emp1-sep2025', NULL, 'earning', 'Transport Allowance', 5000, NULL, NOW()),
('payitem-004', 'payroll-emp1-sep2025', NULL, 'deduction', 'Provident Fund', 6000, NULL, NOW()),
('payitem-005', 'payroll-emp1-sep2025', NULL, 'deduction', 'Professional Tax', 200, NULL, NOW());

-- Payroll for Michael Chen (Published)
INSERT INTO payroll_records (
  id, company_id, employee_id, month, year, status,
  working_days, present_days, absent_days, paid_leave_days, overtime_hours,
  gross_pay, total_deductions, net_pay,
  approved_by, approved_at, rejection_reason,
  payslip_published, payslip_published_at, created_at
)
VALUES 
(
  'payroll-emp2-sep2025', 'comp-tech-solutions-001', 'emp-002',
  9, 2025, 'approved',
  22, 21, 1, 0, 0,
  60000, 5000, 55000,
  'user-admin-001', NOW() - INTERVAL '15 days', NULL,
  TRUE, NOW() - INTERVAL '14 days', NOW() - INTERVAL '20 days'
);

-- Payroll Items for Michael Chen
INSERT INTO payroll_items (id, payroll_id, ctc_component_id, type, name, amount, description, created_at)
VALUES 
('payitem-006', 'payroll-emp2-sep2025', NULL, 'earning', 'Basic Salary', 40000, NULL, NOW()),
('payitem-007', 'payroll-emp2-sep2025', NULL, 'earning', 'HRA', 16000, NULL, NOW()),
('payitem-008', 'payroll-emp2-sep2025', NULL, 'earning', 'Transport Allowance', 4000, NULL, NOW()),
('payitem-009', 'payroll-emp2-sep2025', NULL, 'deduction', 'Provident Fund', 4800, NULL, NOW()),
('payitem-010', 'payroll-emp2-sep2025', NULL, 'deduction', 'Professional Tax', 200, NULL, NOW());

-- ============================================
-- 8. SAMPLE SHIFTS
-- ============================================
INSERT INTO shifts (id, company_id, name, start_time, end_time, weekly_offs, created_at)
VALUES 
('shift-general-001', 'comp-tech-solutions-001', 'General Shift', '09:00', '18:00', '["Saturday", "Sunday"]'::jsonb, NOW()),
('shift-morning-001', 'comp-tech-solutions-001', 'Morning Shift', '08:00', '17:00', '["Saturday", "Sunday"]'::jsonb, NOW()),
('shift-evening-001', 'comp-tech-solutions-001', 'Evening Shift', '14:00', '23:00', '["Saturday", "Sunday"]'::jsonb, NOW());

-- ============================================
-- 9. SAMPLE HOLIDAYS
-- ============================================
INSERT INTO holidays (id, company_id, date, name, description, department_ids, created_at)
VALUES 
('holiday-001', 'comp-tech-solutions-001', '2025-11-01', 'Diwali', 'Festival of Lights', NULL, NOW()),
('holiday-002', 'comp-tech-solutions-001', '2025-12-25', 'Christmas', 'Christmas Day', NULL, NOW()),
('holiday-003', 'comp-tech-solutions-001', '2026-01-01', 'New Year', 'New Year Day', NULL, NOW()),
('holiday-004', 'comp-tech-solutions-001', '2026-01-26', 'Republic Day', 'Republic Day of India', NULL, NOW()),
('holiday-005', 'comp-tech-solutions-001', '2026-08-15', 'Independence Day', 'Independence Day of India', NULL, NOW());

-- ============================================
-- 10. SAMPLE LEAVE TYPES
-- ============================================
INSERT INTO leave_types (id, company_id, code, name, max_days, carry_forward, created_at)
VALUES 
('leave-annual-001', 'comp-tech-solutions-001', 'AL', 'Annual Leave', 20, TRUE, NOW()),
('leave-sick-001', 'comp-tech-solutions-001', 'SL', 'Sick Leave', 12, FALSE, NOW()),
('leave-casual-001', 'comp-tech-solutions-001', 'CL', 'Casual Leave', 10, FALSE, NOW()),
('leave-maternity-001', 'comp-tech-solutions-001', 'ML', 'Maternity Leave', 180, FALSE, NOW()),
('leave-paternity-001', 'comp-tech-solutions-001', 'PL', 'Paternity Leave', 15, FALSE, NOW());

-- ============================================
-- 11. SAMPLE EXPENSE TYPES
-- ============================================
INSERT INTO expense_types (
  id, company_id, code, name, role_level_limits,
  enable_google_maps, bill_mandatory, approval_required, created_at
)
VALUES 
(
  'exp-travel-001', 'comp-tech-solutions-001', 'TRV', 'Travel Expenses',
  '[
    {"roleLevelId": "role-jr-mgr-001", "roleName": "Manager - Junior", "limitAmount": 5000, "limitUnit": "fixed"},
    {"roleLevelId": "role-sr-mgr-001", "roleName": "Manager - Senior", "limitAmount": 10000, "limitUnit": "fixed"},
    {"roleLevelId": "role-top-mgmt-001", "roleName": "Leadership - Top Management", "limitAmount": 25000, "limitUnit": "fixed"}
  ]'::jsonb,
  FALSE, TRUE, TRUE, NOW()
),
(
  'exp-fuel-001', 'comp-tech-solutions-001', 'FUEL', 'Fuel Expenses',
  '[
    {"roleLevelId": "role-jr-mgr-001", "roleName": "Manager - Junior", "limitAmount": 10, "limitUnit": "per_km"},
    {"roleLevelId": "role-sr-mgr-001", "roleName": "Manager - Senior", "limitAmount": 12, "limitUnit": "per_km"},
    {"roleLevelId": "role-top-mgmt-001", "roleName": "Leadership - Top Management", "limitAmount": 15, "limitUnit": "per_km"}
  ]'::jsonb,
  TRUE, TRUE, TRUE, NOW()
),
(
  'exp-meal-001', 'comp-tech-solutions-001', 'MEAL', 'Meal Allowance',
  '[
    {"roleLevelId": "role-jr-mgr-001", "roleName": "Manager - Junior", "limitAmount": 500, "limitUnit": "per_day"},
    {"roleLevelId": "role-sr-mgr-001", "roleName": "Manager - Senior", "limitAmount": 800, "limitUnit": "per_day"},
    {"roleLevelId": "role-top-mgmt-001", "roleName": "Leadership - Top Management", "limitAmount": 1500, "limitUnit": "per_day"}
  ]'::jsonb,
  FALSE, TRUE, TRUE, NOW()
);

-- ============================================
-- 12. SAMPLE WORKFLOWS
-- ============================================
INSERT INTO workflows (
  id, company_id, title, description, type, department_id,
  assigned_to, assigned_by, deadline, priority, status, progress, notes,
  completed_at, created_at, updated_at
)
VALUES 
(
  'workflow-001', 'comp-tech-solutions-001',
  'Complete Q4 Sales Report',
  'Prepare and submit the quarterly sales report for Q4 2025',
  'task', 'dept-sales-001',
  'user-employee-003', 'user-admin-001',
  CURRENT_DATE + INTERVAL '7 days', 'high', 'in_progress', 45,
  'Focus on regional breakdown and YoY comparison',
  NULL, NOW(), NOW()
),
(
  'workflow-002', 'comp-tech-solutions-001',
  'Code Review for Payment Module',
  'Review and approve the new payment gateway integration',
  'task', 'dept-engineering-001',
  'user-employee-001', 'user-admin-001',
  CURRENT_DATE + INTERVAL '3 days', 'urgent', 'in_progress', 60,
  'Security review is critical',
  NULL, NOW(), NOW()
),
(
  'workflow-003', 'comp-tech-solutions-001',
  'Employee Onboarding Documentation',
  'Update and finalize the employee onboarding handbook',
  'task', 'dept-hr-001',
  'user-employee-004', 'user-admin-001',
  CURRENT_DATE + INTERVAL '14 days', 'medium', 'pending', 0,
  NULL, NULL, NOW(), NOW()
);

-- ============================================
-- END OF SEED DATA
-- ============================================

-- Summary of Test Credentials:
-- 
-- Super Admin:
--   Email: superadmin@klipit.com
--   Password: 123456
--
-- Company Admin:
--   Email: admin@techsolutions.com
--   Password: 123456
--   Company: Tech Solutions Inc
--
-- Employees:
--   1. Sarah Johnson (Senior Engineer)
--      Email: sarah.johnson@techsolutions.com
--      Password: 123456
--
--   2. Michael Chen (Engineer)
--      Email: michael.chen@techsolutions.com
--      Password: 123456
--
--   3. Emily Rodriguez (Sales Manager)
--      Email: emily.rodriguez@techsolutions.com
--      Password: 123456
--
--   4. David Kumar (HR Coordinator)
--      Email: david.kumar@techsolutions.com
--      Password: 123456

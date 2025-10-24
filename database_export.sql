--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attendance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendance_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    employee_id character varying NOT NULL,
    date date NOT NULL,
    check_in timestamp without time zone,
    check_out timestamp without time zone,
    shift_id character varying,
    status text DEFAULT 'pending'::text NOT NULL,
    duration integer,
    location text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.companies (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    plan text DEFAULT 'basic'::text NOT NULL,
    max_employees text DEFAULT '50'::text,
    logo_url text,
    address text,
    phone text,
    website text,
    primary_color text DEFAULT '#00C853'::text,
    secondary_color text DEFAULT '#000000'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: ctc_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ctc_components (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    is_standard boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    department_id character varying,
    designation_id character varying,
    role_level_id character varying,
    reporting_manager_id character varying,
    status text DEFAULT 'active'::text NOT NULL,
    join_date date NOT NULL,
    exit_date date,
    attendance_type text DEFAULT 'regular'::text,
    education jsonb DEFAULT '[]'::jsonb,
    experience jsonb DEFAULT '[]'::jsonb,
    documents jsonb DEFAULT '[]'::jsonb,
    ctc jsonb DEFAULT '[]'::jsonb,
    assets jsonb DEFAULT '[]'::jsonb,
    bank jsonb,
    insurance jsonb,
    statutory jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: expense_claim_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_claim_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    claim_id character varying NOT NULL,
    expense_type_id character varying NOT NULL,
    date date NOT NULL,
    amount integer NOT NULL,
    description text,
    bill_url text,
    start_location text,
    end_location text,
    distance_km integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: expense_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_claims (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    employee_id character varying NOT NULL,
    claim_number text NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    total_amount integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    submitted_at timestamp without time zone,
    manager_reviewed_by character varying,
    manager_reviewed_at timestamp without time zone,
    manager_remarks text,
    admin_disbursed_by character varying,
    admin_disbursed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: expense_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expense_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    role_level_limits jsonb DEFAULT '[]'::jsonb,
    enable_google_maps boolean DEFAULT false,
    bill_mandatory boolean DEFAULT false,
    approval_required boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.holidays (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    date date NOT NULL,
    name text NOT NULL,
    description text,
    department_ids jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_types (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    max_days integer,
    carry_forward boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: offline_payment_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offline_payment_requests (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    amount integer NOT NULL,
    requested_by character varying NOT NULL,
    notes text,
    status text DEFAULT 'pending'::text NOT NULL,
    attachment_urls jsonb DEFAULT '[]'::jsonb,
    approved_by character varying,
    approved_at timestamp without time zone,
    rejection_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_provider text DEFAULT 'stripe'::text,
    payment_intent_id text,
    metadata jsonb DEFAULT '{}'::jsonb,
    approved_by character varying,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payroll_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    payroll_id character varying NOT NULL,
    ctc_component_id character varying,
    type text NOT NULL,
    name text NOT NULL,
    amount integer NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: payroll_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payroll_records (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    employee_id character varying NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    working_days integer NOT NULL,
    present_days integer NOT NULL,
    absent_days integer NOT NULL,
    paid_leave_days integer DEFAULT 0,
    overtime_hours integer DEFAULT 0,
    gross_pay integer NOT NULL,
    total_deductions integer NOT NULL,
    net_pay integer NOT NULL,
    approved_by character varying,
    approved_at timestamp without time zone,
    rejection_reason text,
    payslip_published boolean DEFAULT false,
    payslip_published_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    duration integer DEFAULT 1 NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    max_employees integer DEFAULT 50 NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    employees_included integer DEFAULT 10 NOT NULL,
    price_per_additional_employee integer DEFAULT 0 NOT NULL
);


--
-- Name: registration_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    status text DEFAULT 'company_info'::text NOT NULL,
    session_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    company_id character varying,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: roles_levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles_levels (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    role text NOT NULL,
    level text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shifts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    name text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    weekly_offs jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    company_id character varying,
    department text,
    "position" text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: workflows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflows (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    company_id character varying NOT NULL,
    title text NOT NULL,
    description text,
    type text NOT NULL,
    department_id character varying,
    assigned_to character varying NOT NULL,
    assigned_by character varying NOT NULL,
    deadline date NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    notes text,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: attendance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.attendance_records (id, company_id, employee_id, date, check_in, check_out, shift_id, status, duration, location, notes, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.companies (id, name, email, status, plan, max_employees, logo_url, address, phone, website, primary_color, secondary_color, created_at) FROM stdin;
4304968b-c837-452e-9c87-319b5c2dd598	Persistent Test Co IB8k4l	persistentBMQCV8@example.com	active	basic	50	\N	\N	9876543210	\N	#00C853	#000000	2025-10-23 09:51:33.028
f1d2c527-9c42-4cc9-8408-02218528ed54	trading company	tradingcompany@mailinator.com	active	basic	50	\N	\N	5566776655	\N	#00C853	#000000	2025-10-23 10:00:23.785452
c1a0a75f-22e2-4050-8b24-2582d91de8c4	Clean Test Co 7e5_JM	cleantest7e5_JM@example.com	active	basic	50	\N	\N	9999999999	\N	#00C853	#000000	2025-10-23 10:24:47.228551
5e5294bc-6aa9-4949-a8a8-970d0239c653	Test Company 55Ne21	adminkWoRH6@test.com	pending	standard	100	\N	\N	9876543210	\N	#00C853	#000000	2025-10-23 10:39:49.527435
2d77b895-97b9-4d7c-aa8b-a7b59b4c77f2	TestCorp-d-rzN5	admin-xR_1Ki@testcorp.com	active	basic	50	\N	\N	9876543210	\N	#00C853	#000000	2025-10-23 11:21:31.762677
cfe9c7fd-3f91-4780-b559-527daebac121	trading company	tradingcompany3@mailinator.com	pending	standard	100	\N	\N	3456789099	\N	#00C853	#000000	2025-10-23 12:25:52.006309
e819c303-ad3d-490a-90e8-74551934c122	Test Co r0GC	adminB9uIgJ@test.com	pending	standard	100	\N	\N	9876543210	\N	#00C853	#000000	2025-10-23 13:01:20.750036
dfca1472-b9b1-4ac2-80da-ebfeb0b9b146	First Company talI	johndoe@testcompany.com	pending	basic	50	\N	\N	9876543211	\N	#00C853	#000000	2025-10-23 13:10:44.725837
2bcc6b2d-c351-41de-b1f3-36dfaf9ab5df	First Company bhX5	johndoe+C73e@testcompany.com	pending	basic	50	\N	\N	9123456780	\N	#00C853	#000000	2025-10-23 14:05:19.862744
fdb421ff-efd5-4bc7-abfa-ccd05316a849	Second Company -_R5	janesmith+IA9o@newcompany.com	pending	basic	50	\N	\N	8765432109	\N	#00C853	#000000	2025-10-23 14:10:04.113424
23ba9027-c777-4f87-9f07-4dfeeb0c7ed8	Demo Test Company	demo@testcompany.com	active	basic	50	\N	\N	1234567890	\N	#00C853	#000000	2025-10-24 06:41:52.828224
a0dba776-ceff-4bfd-abaa-b52a39123861	trading company	tradingcompany4@mailinator.com	active	basic	50	\N	\N	3456789011	\N	#00C853	#000000	2025-10-24 06:47:51.813724
eea46f14-7867-432f-8d4b-a017f476b0db	TEST BRanch	testcompany222@maildrop.cc	pending	basic	100	\N	\N	7788996655	\N	#00C853	#000000	2025-10-24 07:11:20.398017
\.


--
-- Data for Name: ctc_components; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ctc_components (id, company_id, name, type, is_standard, created_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, company_id, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.designations (id, company_id, name, description, created_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.employees (id, company_id, first_name, last_name, email, phone, department_id, designation_id, role_level_id, reporting_manager_id, status, join_date, exit_date, attendance_type, education, experience, documents, ctc, assets, bank, insurance, statutory, created_at) FROM stdin;
\.


--
-- Data for Name: expense_claim_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_claim_items (id, claim_id, expense_type_id, date, amount, description, bill_url, start_location, end_location, distance_km, created_at) FROM stdin;
\.


--
-- Data for Name: expense_claims; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_claims (id, company_id, employee_id, claim_number, month, year, total_amount, status, submitted_at, manager_reviewed_by, manager_reviewed_at, manager_remarks, admin_disbursed_by, admin_disbursed_at, created_at) FROM stdin;
\.


--
-- Data for Name: expense_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.expense_types (id, company_id, code, name, role_level_limits, enable_google_maps, bill_mandatory, approval_required, created_at) FROM stdin;
\.


--
-- Data for Name: holidays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.holidays (id, company_id, date, name, description, department_ids, created_at) FROM stdin;
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_types (id, company_id, code, name, max_days, carry_forward, created_at) FROM stdin;
\.


--
-- Data for Name: offline_payment_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offline_payment_requests (id, company_id, plan_id, amount, requested_by, notes, status, attachment_urls, approved_by, approved_at, rejection_reason, created_at, updated_at) FROM stdin;
14825507-e89b-4d81-8204-53be2ebd0435	2d77b895-97b9-4d7c-aa8b-a7b59b4c77f2	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	7bd472ff-2bf6-4ea7-8cbc-02a2e23e53c5		approved	[]	d0f44c8d-5208-4f6a-a8e8-14288b554c16	2025-10-23 11:23:29.878	\N	2025-10-23 11:21:31.845555	2025-10-23 11:21:31.845555
43cb1987-0c13-45c4-a0bc-a303f76e18e1	cfe9c7fd-3f91-4780-b559-527daebac121	08428132-11f7-44ce-b9ae-5d0d9826d1f6	10000	d7b4631f-46ee-4f45-abac-90087af6cb2a		pending	[]	\N	\N	\N	2025-10-23 12:25:52.06822	2025-10-23 12:25:52.06822
a3d13504-32e8-4c31-b5ce-9305f12c9360	a0dba776-ceff-4bfd-abaa-b52a39123861	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	db55e63f-b499-41e0-877e-7542877efa09	test	approved	[]	\N	\N	\N	2025-10-24 06:47:51.8687	2025-10-24 06:47:51.8687
59205e3a-889c-46fa-98ee-b98e29658c0d	eea46f14-7867-432f-8d4b-a017f476b0db	d0aee480-3dbd-41a8-985f-c9865fba1f30	299	99d13cdc-0e31-4e98-a7b1-af56daa136b4		pending	[]	\N	\N	\N	2025-10-24 07:11:20.458395	2025-10-24 07:11:20.458395
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, company_id, plan_id, amount, currency, status, payment_provider, payment_intent_id, metadata, approved_by, approved_at, created_at, updated_at) FROM stdin;
e1e0e658-2ab5-4f27-8400-62341456bd98	e819c303-ad3d-490a-90e8-74551934c122	08428132-11f7-44ce-b9ae-5d0d9826d1f6	10000	INR	pending	dummy	dummy_1761224480813	{"cardLast4": "1111"}	\N	\N	2025-10-23 13:01:20.826572	2025-10-23 13:01:20.826572
29ee9dc3-c055-4966-8d89-cbcf01c00215	dfca1472-b9b1-4ac2-80da-ebfeb0b9b146	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	INR	pending	dummy	dummy_1761225044770	{"cardLast4": "1111"}	\N	\N	2025-10-23 13:10:44.782377	2025-10-23 13:10:44.782377
34f6239f-dd78-4ffa-8c4f-de4a160859a8	2bcc6b2d-c351-41de-b1f3-36dfaf9ab5df	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	INR	pending	dummy	dummy_1761228319906	{"cardLast4": "1111"}	\N	\N	2025-10-23 14:05:19.91828	2025-10-23 14:05:19.91828
8b057495-2a75-40da-8940-b827daa16772	fdb421ff-efd5-4bc7-abfa-ccd05316a849	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	INR	pending	dummy	dummy_1761228604159	{"cardLast4": "1111"}	\N	\N	2025-10-23 14:10:04.172159	2025-10-23 14:10:04.172159
4d8acbd3-366f-4d2f-bc7c-6d77c8633832	23ba9027-c777-4f87-9f07-4dfeeb0c7ed8	d0aee480-3dbd-41a8-985f-c9865fba1f30	5000	INR	approved	dummy	dummy_1761288112875	{"cardLast4": "1111"}	\N	\N	2025-10-24 06:41:52.886412	2025-10-24 06:41:52.886412
\.


--
-- Data for Name: payroll_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_items (id, payroll_id, ctc_component_id, type, name, amount, description, created_at) FROM stdin;
\.


--
-- Data for Name: payroll_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payroll_records (id, company_id, employee_id, month, year, status, working_days, present_days, absent_days, paid_leave_days, overtime_hours, gross_pay, total_deductions, net_pay, approved_by, approved_at, rejection_reason, payslip_published, payslip_published_at, created_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plans (id, name, display_name, duration, price, max_employees, features, is_active, created_at, employees_included, price_per_additional_employee) FROM stdin;
d0aee480-3dbd-41a8-985f-c9865fba1f30	basic	Basic	1	299	100	["50 Employees", "Basic Features", "Email Support"]	t	2025-10-23 10:32:23.710559	10	20
08428132-11f7-44ce-b9ae-5d0d9826d1f6	advance	Advance	1	599	200	["100 Employees", "Advanced Features", "Priority Support", "Payroll Management"]	t	2025-10-23 10:32:23.743627	25	25
bb8dcce0-aaf3-41a7-a13f-f36a8e201d74	pro	Pro	1	999	500	["500 Employees", "All Features", "24/7 Support", "Custom Integrations", "Dedicated Account Manager"]	t	2025-10-23 10:32:23.776662	50	50
\.


--
-- Data for Name: registration_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registration_sessions (id, status, session_data, company_id, expires_at, created_at, updated_at) FROM stdin;
d9a6fede-1fe7-4d95-9fec-1a729f52bd0a	payment_pending	{"email": "adminB9uIgJ@test.com", "phone": "9876543210", "gender": "male", "planId": "08428132-11f7-44ce-b9ae-5d0d9826d1f6", "orderId": "e1e0e658-2ab5-4f27-8400-62341456bd98", "password": "$2b$10$duX6xE17Jqi1Xzof/QRywuO3Tn6UOY9IA/g4mmLlBDPEaYqoVyRvK", "companyName": "Test Co r0GC", "adminLastName": "Admin", "employeeCount": 20, "adminFirstName": "Test", "additionalEmployees": []}	e819c303-ad3d-490a-90e8-74551934c122	2025-10-24 12:58:51.243	2025-10-23 12:58:51.263553	2025-10-23 12:58:51.263553
c3fb5eae-5f6f-4b56-bc6b-c033b1c0b713	payment_pending	{"email": "admin-xR_1Ki@testcorp.com", "phone": "9876543210", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "password": "$2b$10$jmOtYk4tFfVFvBsOCvLCTeSWyCHIiEnrrChb.45/MvmHvfSubgfpS", "companyName": "TestCorp-d-rzN5", "adminLastName": "Doe", "adminFirstName": "John", "offlineRequestId": "14825507-e89b-4d81-8204-53be2ebd0435", "additionalEmployees": []}	2d77b895-97b9-4d7c-aa8b-a7b59b4c77f2	2025-10-24 11:16:35.415	2025-10-23 11:16:35.439284	2025-10-23 11:16:35.439284
e83b2ba2-d2e7-4627-8fd6-bcb1d2050355	employees_setup	{"email": "tradingcompany1@mailinator.com", "phone": "7765432100", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "password": "$2b$10$i0KeWNbykP0upb1MVy3Ph.q8whIFUMB5nHpUsqaOzetpIxdef44am", "companyName": "trading company ltd", "adminLastName": "company", "adminFirstName": "trading", "additionalEmployees": []}	\N	2025-10-24 11:22:55.912	2025-10-23 11:22:55.923525	2025-10-23 11:22:55.923525
c018747d-078a-41eb-80df-58d8140c61d2	company_info	{"email": "tradingcompany2@mailinator.com", "phone": "3456789098", "gender": "male", "password": "$2b$10$FduY5YUIDK2hqbL1r48vcu/EFPtvk3vKM1x4eYOiE2A6P1CKQpN32", "companyName": "trading company", "adminLastName": "company", "adminFirstName": "trading"}	\N	2025-10-24 11:27:23.978	2025-10-23 11:27:23.994582	2025-10-23 11:27:23.994582
ab8ad763-4710-4728-ac66-629d5cc9751b	payment_pending	{"email": "johndoe@testcompany.com", "phone": "9876543211", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "orderId": "29ee9dc3-c055-4966-8d89-cbcf01c00215", "password": "$2b$10$IAhtrTU5rAV.Qky2jWzVrORfBO9szK1aUdLJ0wBARsxOVwWbz6NQG", "companyName": "First Company talI", "adminLastName": "Doe", "employeeCount": 10, "adminFirstName": "John", "additionalEmployees": []}	dfca1472-b9b1-4ac2-80da-ebfeb0b9b146	2025-10-24 13:08:52.546	2025-10-23 13:08:52.559994	2025-10-23 13:08:52.559994
c8cb6a46-7ac7-4ad4-9138-e7c2ce3234ed	payment_pending	{"email": "tradingcompany3@mailinator.com", "phone": "3456789099", "gender": "male", "planId": "08428132-11f7-44ce-b9ae-5d0d9826d1f6", "password": "$2b$10$zwaJ68jXHkCzAgbQmwLDV.qOcQre3PBXc807y68TZjY9U1pLq3WXy", "companyName": "trading company", "adminLastName": "company", "adminFirstName": "trading", "offlineRequestId": "43cb1987-0c13-45c4-a0bc-a303f76e18e1", "additionalEmployees": []}	cfe9c7fd-3f91-4780-b559-527daebac121	2025-10-24 12:25:36.234	2025-10-23 12:25:36.247489	2025-10-23 12:25:36.247489
42a54059-7602-4799-9fb0-6936ee2ef8bb	employees_setup	{"email": "testadminTVDnSY@test.com", "phone": "9876543210", "gender": "male", "planId": "08428132-11f7-44ce-b9ae-5d0d9826d1f6", "password": "$2b$10$Ku6tiUYQjKjpz.m1rpGom.VPngxQuvAhPVN4c6V/6LTg2Va7aNrei", "companyName": "Test Company TVDnSY", "adminLastName": "Admin", "employeeCount": 25, "adminFirstName": "Test", "additionalEmployees": []}	\N	2025-10-24 12:51:56.712	2025-10-23 12:51:56.725804	2025-10-23 12:51:56.725804
d6affdd8-4d04-4c44-aed7-65f8f0af0741	payment_pending	{"email": "janesmith+IA9o@newcompany.com", "phone": "8765432109", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "orderId": "8b057495-2a75-40da-8940-b827daa16772", "password": "$2b$10$wypnTijcvtrhdp9pNZbxi.qNKu1DeWqJRGrnYL/bVkGbhfLSpLkVS", "companyName": "Second Company -_R5", "adminLastName": "Smith", "employeeCount": 10, "adminFirstName": "Jane", "additionalEmployees": []}	fdb421ff-efd5-4bc7-abfa-ccd05316a849	2025-10-24 14:08:43.56	2025-10-23 14:08:43.572081	2025-10-23 14:08:43.572081
7a5f876e-9e3d-446f-8b93-8746598d1bfa	payment_pending	{"email": "testcompany222@maildrop.cc", "phone": "7788996655", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "password": "$2b$10$dxLZefAL4sc6202C5IDkHO.d5PfCcPCm5RlrmyqlQaJ6a0njcJLLy", "companyName": "TEST BRanch", "adminLastName": "Test Company", "employeeCount": 20, "adminFirstName": "Test Company", "offlineRequestId": "59205e3a-889c-46fa-98ee-b98e29658c0d", "additionalEmployees": []}	eea46f14-7867-432f-8d4b-a017f476b0db	2025-10-25 07:10:13.651	2025-10-24 07:10:13.665758	2025-10-24 07:10:13.665758
1e3f5444-5b73-43e5-8c6f-db87cf772b99	payment_pending	{"email": "johndoe+C73e@testcompany.com", "phone": "9123456780", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "orderId": "34f6239f-dd78-4ffa-8c4f-de4a160859a8", "password": "$2b$10$M9MQH4RFT9d/cTDJQjAUf.mnKF5fjmT.fq7ga1qF3yHHtGEE.PyP.", "companyName": "First Company bhX5", "adminLastName": "Doe", "employeeCount": 10, "adminFirstName": "John", "additionalEmployees": []}	2bcc6b2d-c351-41de-b1f3-36dfaf9ab5df	2025-10-24 14:02:37.847	2025-10-23 14:02:37.860607	2025-10-23 14:02:37.860607
3a8f7ee0-dafa-4b31-8914-f3702d7443af	payment_pending	{"email": "tradingcompany4@mailinator.com", "phone": "3456789011", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "password": "$2b$10$ZbdWxt7fawem1LpeapDtdemgX.iwSufcZQFGVjyLv87mA0N2xsYym", "companyName": "trading company", "adminLastName": "company", "employeeCount": 6, "adminFirstName": "trading", "offlineRequestId": "a3d13504-32e8-4c31-b5ce-9305f12c9360", "additionalEmployees": []}	a0dba776-ceff-4bfd-abaa-b52a39123861	2025-10-25 06:47:19.537	2025-10-24 06:47:19.553116	2025-10-24 06:47:19.553116
6c78cbaf-d5de-44cb-a7f4-02141e77a89f	payment_pending	{"email": "demo@testcompany.com", "phone": "1234567890", "gender": "male", "planId": "d0aee480-3dbd-41a8-985f-c9865fba1f30", "orderId": "4d8acbd3-366f-4d2f-bc7c-6d77c8633832", "password": "$2b$10$d7HnzNvDaocuZqqz24lku.T.1KH.4HUZ3dabI4GGDLsuABO51rsHa", "companyName": "Demo Test Company", "adminLastName": "Admin", "employeeCount": 5, "adminFirstName": "Demo", "additionalEmployees": []}	23ba9027-c777-4f87-9f07-4dfeeb0c7ed8	2025-10-25 06:41:25.216	2025-10-24 06:41:25.228646	2025-10-24 06:41:25.228646
0d868b88-c285-42af-951b-5a814bf3ee8b	company_info	{"email": "tradingcompany5@mailinator.com", "phone": "3456789033", "gender": "male", "password": "$2b$10$2pI1K0WLK0XW56Jy8oZnNeTsgb2iXEgEsiYHICXAAlpyUHFhfSROK", "companyName": "trading company", "adminLastName": "company", "adminFirstName": "trading"}	\N	2025-10-25 06:58:08.58	2025-10-24 06:58:08.59159	2025-10-24 06:58:08.59159
\.


--
-- Data for Name: roles_levels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles_levels (id, company_id, role, level, created_at) FROM stdin;
\.


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shifts (id, company_id, name, start_time, end_time, weekly_offs, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password, name, role, company_id, department, "position", status, created_at) FROM stdin;
36c29064-85ea-4680-9000-31d3902e790d	persistentBMQCV8@example.com	password123	John Doe	COMPANY_ADMIN	4304968b-c837-452e-9c87-319b5c2dd598	\N	Company Administrator	active	2025-10-23 09:51:33.059399
ec74f77a-cbe5-449f-adb7-f1773d90b597	tradingcompany@mailinator.com	123456	trading company	COMPANY_ADMIN	f1d2c527-9c42-4cc9-8408-02218528ed54	\N	Company Administrator	active	2025-10-23 10:00:23.81228
25dc98cd-9ebe-4b22-8b4f-852fa68a813c	cleantest7e5_JM@example.com	password123	Test User	COMPANY_ADMIN	c1a0a75f-22e2-4050-8b24-2582d91de8c4	\N	Company Administrator	active	2025-10-23 10:24:47.260616
5c8c0c8b-f428-41a5-90b6-056eedab801a	adminkWoRH6@test.com	123456	John Doe	COMPANY_ADMIN	5e5294bc-6aa9-4949-a8a8-970d0239c653	\N	Company Administrator	active	2025-10-23 10:39:49.556133
d0f44c8d-5208-4f6a-a8e8-14288b554c16	superadmin@hrmsworld.com	$2b$10$2EgAiUOMK0hqwyxBj/oDjuIS7s5k1fl8SDkA/.inXrakRgPhDRoFK	Super Admin	SUPER_ADMIN	\N	\N	\N	active	2025-10-23 11:10:33.787225
7bd472ff-2bf6-4ea7-8cbc-02a2e23e53c5	admin-xR_1Ki@testcorp.com	$2b$10$jmOtYk4tFfVFvBsOCvLCTeSWyCHIiEnrrChb.45/MvmHvfSubgfpS	John Doe	COMPANY_ADMIN	2d77b895-97b9-4d7c-aa8b-a7b59b4c77f2	\N	Company Administrator	active	2025-10-23 11:21:31.808573
d7b4631f-46ee-4f45-abac-90087af6cb2a	tradingcompany3@mailinator.com	$2b$10$zwaJ68jXHkCzAgbQmwLDV.qOcQre3PBXc807y68TZjY9U1pLq3WXy	trading company	COMPANY_ADMIN	cfe9c7fd-3f91-4780-b559-527daebac121	\N	Company Administrator	active	2025-10-23 12:25:52.035601
63ef353f-5c33-4c1f-ad7f-01700aa21df7	adminB9uIgJ@test.com	$2b$10$duX6xE17Jqi1Xzof/QRywuO3Tn6UOY9IA/g4mmLlBDPEaYqoVyRvK	Test Admin	COMPANY_ADMIN	e819c303-ad3d-490a-90e8-74551934c122	\N	Company Administrator	active	2025-10-23 13:01:20.78735
22ac1576-f0d6-43c8-99ee-5c8c7d9d6fa5	johndoe@testcompany.com	$2b$10$IAhtrTU5rAV.Qky2jWzVrORfBO9szK1aUdLJ0wBARsxOVwWbz6NQG	John Doe	COMPANY_ADMIN	dfca1472-b9b1-4ac2-80da-ebfeb0b9b146	\N	Company Administrator	active	2025-10-23 13:10:44.753649
74a6d779-1ab9-4d0b-9f15-6d88ec9ef32b	johndoe+C73e@testcompany.com	$2b$10$M9MQH4RFT9d/cTDJQjAUf.mnKF5fjmT.fq7ga1qF3yHHtGEE.PyP.	John Doe	COMPANY_ADMIN	2bcc6b2d-c351-41de-b1f3-36dfaf9ab5df	\N	Company Administrator	active	2025-10-23 14:05:19.889671
9e635e0d-464a-475d-a632-4448d205cf3e	janesmith+IA9o@newcompany.com	$2b$10$wypnTijcvtrhdp9pNZbxi.qNKu1DeWqJRGrnYL/bVkGbhfLSpLkVS	Jane Smith	COMPANY_ADMIN	fdb421ff-efd5-4bc7-abfa-ccd05316a849	\N	Company Administrator	active	2025-10-23 14:10:04.140894
7822e8ca-da17-41ea-a2cb-f0f7c37150da	demo@testcompany.com	$2b$10$d7HnzNvDaocuZqqz24lku.T.1KH.4HUZ3dabI4GGDLsuABO51rsHa	Demo Admin	COMPANY_ADMIN	23ba9027-c777-4f87-9f07-4dfeeb0c7ed8	\N	Company Administrator	active	2025-10-24 06:41:52.856987
db55e63f-b499-41e0-877e-7542877efa09	tradingcompany4@mailinator.com	$2b$10$ZbdWxt7fawem1LpeapDtdemgX.iwSufcZQFGVjyLv87mA0N2xsYym	trading company	COMPANY_ADMIN	a0dba776-ceff-4bfd-abaa-b52a39123861	\N	Company Administrator	active	2025-10-24 06:47:51.839729
99d13cdc-0e31-4e98-a7b1-af56daa136b4	testcompany222@maildrop.cc	$2b$10$dxLZefAL4sc6202C5IDkHO.d5PfCcPCm5RlrmyqlQaJ6a0njcJLLy	Test Company Test Company	COMPANY_ADMIN	eea46f14-7867-432f-8d4b-a017f476b0db	\N	Company Administrator	active	2025-10-24 07:11:20.42404
\.


--
-- Data for Name: workflows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workflows (id, company_id, title, description, type, department_id, assigned_to, assigned_by, deadline, priority, status, progress, notes, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Name: attendance_records attendance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_pkey PRIMARY KEY (id);


--
-- Name: companies companies_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_email_unique UNIQUE (email);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: ctc_components ctc_components_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ctc_components
    ADD CONSTRAINT ctc_components_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: expense_claim_items expense_claim_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claim_items
    ADD CONSTRAINT expense_claim_items_pkey PRIMARY KEY (id);


--
-- Name: expense_claims expense_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT expense_claims_pkey PRIMARY KEY (id);


--
-- Name: expense_types expense_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_pkey PRIMARY KEY (id);


--
-- Name: holidays holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: offline_payment_requests offline_payment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offline_payment_requests
    ADD CONSTRAINT offline_payment_requests_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payroll_items payroll_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_pkey PRIMARY KEY (id);


--
-- Name: payroll_records payroll_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_pkey PRIMARY KEY (id);


--
-- Name: plans plans_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_name_unique UNIQUE (name);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: registration_sessions registration_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_sessions
    ADD CONSTRAINT registration_sessions_pkey PRIMARY KEY (id);


--
-- Name: roles_levels roles_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles_levels
    ADD CONSTRAINT roles_levels_pkey PRIMARY KEY (id);


--
-- Name: shifts shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_pkey PRIMARY KEY (id);


--
-- Name: attendance_records attendance_records_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: attendance_records attendance_records_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: attendance_records attendance_records_shift_id_shifts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendance_records
    ADD CONSTRAINT attendance_records_shift_id_shifts_id_fk FOREIGN KEY (shift_id) REFERENCES public.shifts(id);


--
-- Name: ctc_components ctc_components_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ctc_components
    ADD CONSTRAINT ctc_components_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: departments departments_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: designations designations_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: employees employees_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: employees employees_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: employees employees_designation_id_designations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_designation_id_designations_id_fk FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: employees employees_reporting_manager_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_reporting_manager_id_employees_id_fk FOREIGN KEY (reporting_manager_id) REFERENCES public.employees(id);


--
-- Name: employees employees_role_level_id_roles_levels_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_role_level_id_roles_levels_id_fk FOREIGN KEY (role_level_id) REFERENCES public.roles_levels(id);


--
-- Name: expense_claim_items expense_claim_items_claim_id_expense_claims_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claim_items
    ADD CONSTRAINT expense_claim_items_claim_id_expense_claims_id_fk FOREIGN KEY (claim_id) REFERENCES public.expense_claims(id);


--
-- Name: expense_claim_items expense_claim_items_expense_type_id_expense_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claim_items
    ADD CONSTRAINT expense_claim_items_expense_type_id_expense_types_id_fk FOREIGN KEY (expense_type_id) REFERENCES public.expense_types(id);


--
-- Name: expense_claims expense_claims_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT expense_claims_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: expense_claims expense_claims_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT expense_claims_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: expense_claims expense_claims_manager_reviewed_by_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_claims
    ADD CONSTRAINT expense_claims_manager_reviewed_by_employees_id_fk FOREIGN KEY (manager_reviewed_by) REFERENCES public.employees(id);


--
-- Name: expense_types expense_types_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expense_types
    ADD CONSTRAINT expense_types_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: holidays holidays_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.holidays
    ADD CONSTRAINT holidays_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: leave_types leave_types_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: offline_payment_requests offline_payment_requests_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offline_payment_requests
    ADD CONSTRAINT offline_payment_requests_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: orders orders_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: payroll_items payroll_items_ctc_component_id_ctc_components_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_ctc_component_id_ctc_components_id_fk FOREIGN KEY (ctc_component_id) REFERENCES public.ctc_components(id);


--
-- Name: payroll_items payroll_items_payroll_id_payroll_records_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_items
    ADD CONSTRAINT payroll_items_payroll_id_payroll_records_id_fk FOREIGN KEY (payroll_id) REFERENCES public.payroll_records(id) ON DELETE CASCADE;


--
-- Name: payroll_records payroll_records_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: payroll_records payroll_records_employee_id_employees_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payroll_records
    ADD CONSTRAINT payroll_records_employee_id_employees_id_fk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: roles_levels roles_levels_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles_levels
    ADD CONSTRAINT roles_levels_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: shifts shifts_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shifts
    ADD CONSTRAINT shifts_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: users users_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: workflows workflows_assigned_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_assigned_by_users_id_fk FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: workflows workflows_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: workflows workflows_company_id_companies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_company_id_companies_id_fk FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: workflows workflows_department_id_departments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflows
    ADD CONSTRAINT workflows_department_id_departments_id_fk FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- PostgreSQL database dump complete
--


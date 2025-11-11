-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE complaint_status AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 
  'WAITING_ON_STUDENT', 'RESOLVED', 'CLOSED'
);
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'IN_APP');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED');

-- Departments table
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STUDENT',
  department_id INT REFERENCES departments(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- SLA Policies table
CREATE TABLE sla_policies (
  id SERIAL PRIMARY KEY,
  priority priority NOT NULL UNIQUE,
  time_to_first_response_minutes INT NOT NULL,
  time_to_resolution_minutes INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaints table
CREATE TABLE complaints (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'SUBMITTED',
  priority priority NOT NULL DEFAULT 'MEDIUM',
  student_id UUID NOT NULL REFERENCES profiles(id),
  department_id INT NOT NULL REFERENCES departments(id),
  category_id INT REFERENCES categories(id),
  assignee_id UUID REFERENCES profiles(id),
  first_response_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  sla_due_first_response_at TIMESTAMP WITH TIME ZONE,
  sla_due_resolution_at TIMESTAMP WITH TIME ZONE,
  is_sla_breached BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Complaint Attachments table
CREATE TABLE complaint_attachments (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comments table
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id),
  body TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activity Log table
CREATE TABLE activity_log (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT REFERENCES complaints(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  from_value TEXT,
  to_value TEXT,
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  complaint_id BIGINT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, complaint_id)
);

-- Notifications table
CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  complaint_id BIGINT REFERENCES complaints(id) ON DELETE SET NULL,
  channel notification_channel NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  status notification_status NOT NULL DEFAULT 'PENDING',
  error TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_profiles_department ON profiles(department_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_assignee ON complaints(assignee_id);
CREATE INDEX idx_complaints_student ON complaints(student_id);
CREATE INDEX idx_complaints_dept ON complaints(department_id);
CREATE INDEX idx_attach_complaint ON complaint_attachments(complaint_id);
CREATE INDEX idx_comments_complaint ON comments(complaint_id);
CREATE INDEX idx_activity_complaint ON activity_log(complaint_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sla_policies_updated_at BEFORE UPDATE ON sla_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STUDENT')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate complaint code
CREATE OR REPLACE FUNCTION generate_complaint_code()
RETURNS TEXT AS $$
DECLARE
  year TEXT := TO_CHAR(now(), 'YYYY');
  seq BIGINT;
  code TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 9) AS BIGINT)), 0) + 1
  INTO seq
  FROM complaints
  WHERE code LIKE 'BR-' || year || '-%';
  
  code := 'BR-' || year || '-' || LPAD(seq::TEXT, 6, '0');
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to set complaint code and SLA deadlines
CREATE OR REPLACE FUNCTION set_complaint_defaults()
RETURNS TRIGGER AS $$
DECLARE
  sla_record RECORD;
BEGIN
  -- Generate code if not set
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := generate_complaint_code();
  END IF;
  
  -- Set SLA deadlines based on priority
  SELECT * INTO sla_record FROM sla_policies WHERE priority = NEW.priority;
  
  IF FOUND THEN
    NEW.sla_due_first_response_at := NEW.created_at + (sla_record.time_to_first_response_minutes || ' minutes')::INTERVAL;
    NEW.sla_due_resolution_at := NEW.created_at + (sla_record.time_to_resolution_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for complaint defaults
CREATE TRIGGER set_complaint_defaults_trigger
  BEFORE INSERT ON complaints
  FOR EACH ROW EXECUTE FUNCTION set_complaint_defaults();

-- Function to check and update SLA breach status
CREATE OR REPLACE FUNCTION check_sla_breach()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if first response SLA is breached
  IF NEW.first_response_at IS NULL AND now() > NEW.sla_due_first_response_at THEN
    NEW.is_sla_breached := TRUE;
  END IF;
  
  -- Check if resolution SLA is breached
  IF NEW.status NOT IN ('RESOLVED', 'CLOSED') AND now() > NEW.sla_due_resolution_at THEN
    NEW.is_sla_breached := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for SLA breach check
CREATE TRIGGER check_sla_breach_trigger
  BEFORE UPDATE ON complaints
  FOR EACH ROW EXECUTE FUNCTION check_sla_breach();

-- Insert seed data
INSERT INTO departments (name, description) VALUES
  ('IT', 'Information Technology and Systems'),
  ('Facilities', 'Campus Facilities and Maintenance'),
  ('Academics', 'Academic Programs and Curriculum'),
  ('Administration', 'Administrative Services');

INSERT INTO categories (name, description) VALUES
  ('Network', 'Internet and network connectivity issues'),
  ('Hardware', 'Computer and equipment problems'),
  ('Software', 'Software installation and issues'),
  ('Cleanliness', 'Cleaning and hygiene concerns'),
  ('Infrastructure', 'Building and facility infrastructure'),
  ('Timetable', 'Class schedule and timing'),
  ('Course Content', 'Curriculum and learning materials'),
  ('Exam', 'Examination related issues'),
  ('Documentation', 'Certificates and documentation'),
  ('Other', 'Other concerns');

INSERT INTO sla_policies (priority, time_to_first_response_minutes, time_to_resolution_minutes) VALUES
  ('LOW', 480, 10080),      -- 8 hours, 7 days
  ('MEDIUM', 240, 4320),    -- 4 hours, 3 days
  ('HIGH', 120, 2880),      -- 2 hours, 2 days
  ('CRITICAL', 30, 1440);   -- 30 mins, 1 day

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for departments (read-only for all authenticated)
CREATE POLICY "Everyone can view active departments"
  ON departments FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Only admins can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Staff and admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
  ));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Only admins can manage user roles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- RLS Policies for categories (read-only for all authenticated)
CREATE POLICY "Everyone can view active categories"
  ON categories FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Only admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- RLS Policies for sla_policies (read-only for all authenticated)
CREATE POLICY "Everyone can view SLA policies"
  ON sla_policies FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Only admins can manage SLA policies"
  ON sla_policies FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
  ));

-- RLS Policies for complaints
CREATE POLICY "Students can view their own complaints"
  ON complaints FOR SELECT
  TO authenticated
  USING (
    student_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN'))
  );

CREATE POLICY "Students can create complaints"
  ON complaints FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Only staff and admins can update complaints"
  ON complaints FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
  ));

-- RLS Policies for complaint_attachments
CREATE POLICY "Users can view attachments of their complaints"
  ON complaint_attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = complaint_attachments.complaint_id 
      AND (complaints.student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
      ))
    )
  );

CREATE POLICY "Users can upload attachments to their complaints"
  ON complaint_attachments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = complaint_attachments.complaint_id 
      AND complaints.student_id = auth.uid()
    )
  );

-- RLS Policies for comments
CREATE POLICY "Users can view non-internal comments on their complaints"
  ON comments FOR SELECT
  TO authenticated
  USING (
    (NOT is_internal AND EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = comments.complaint_id 
      AND complaints.student_id = auth.uid()
    )) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN'))
  );

CREATE POLICY "Staff can add comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN'))
  );

CREATE POLICY "Students can add public comments to their complaints"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT is_internal AND
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = comments.complaint_id 
      AND complaints.student_id = auth.uid()
    )
  );

-- RLS Policies for activity_log (read-only)
CREATE POLICY "Users can view activity log of their complaints"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM complaints 
      WHERE complaints.id = activity_log.complaint_id 
      AND (complaints.student_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('STAFF', 'ADMIN')
      ))
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own subscriptions"
  ON subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
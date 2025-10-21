# SynergySphere Setup Guide

Complete step-by-step setup instructions for SynergySphere.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- A **Supabase account** - [Sign up](https://supabase.com)
- A code editor (VS Code recommended)

## 🔧 Step 1: Project Setup

### 1.1 Install Dependencies

```bash
cd SynergySphere
npm install
```

This will install all required packages including:
- React and React DOM
- React Router
- Supabase client
- TailwindCSS
- Framer Motion
- React Toastify
- Lucide React icons
- date-fns

## 🗄️ Step 2: Supabase Configuration

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `SynergySphere`
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Click "Create new project"
5. Wait for project initialization (2-3 minutes)

### 2.2 Set Up Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('To-Do', 'In Progress', 'Done')) DEFAULT 'To-Do',
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_discussions_project ON discussions(project_id);
```

4. Click "Run" to execute the SQL
5. Verify all tables are created in the **Table Editor**

### 2.3 Set Up Row Level Security (RLS)

1. In SQL Editor, run the following policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their projects"
ON projects FOR SELECT
USING (
  auth.uid() = manager_id OR
  auth.uid() IN (
    SELECT user_id FROM project_members WHERE project_id = id
  )
);

CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Managers can update projects"
ON projects FOR UPDATE
USING (auth.uid() = manager_id);

CREATE POLICY "Managers can delete projects"
ON projects FOR DELETE
USING (auth.uid() = manager_id);

-- Project members policies
CREATE POLICY "Users can view project members"
ON project_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND (manager_id = auth.uid() OR id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    ))
  )
);

CREATE POLICY "Managers can add members"
ON project_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND manager_id = auth.uid()
  )
);

CREATE POLICY "Managers can remove members"
ON project_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id
    AND manager_id = auth.uid()
  )
);

-- Tasks policies
CREATE POLICY "Project members can view tasks"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Project members can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Assignees and managers can update tasks"
ON tasks FOR UPDATE
USING (
  auth.uid() = assigned_to OR
  auth.uid() IN (
    SELECT manager_id FROM projects WHERE id = tasks.project_id
  )
);

CREATE POLICY "Managers can delete tasks"
ON tasks FOR DELETE
USING (
  auth.uid() IN (
    SELECT manager_id FROM projects WHERE id = tasks.project_id
  )
);

-- Discussions policies
CREATE POLICY "Project members can view discussions"
ON discussions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = discussions.project_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Project members can create discussions"
ON discussions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = discussions.project_id
    AND user_id = auth.uid()
  )
);
```

### 2.4 Set Up Storage for Avatars

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name it: `avatars`
4. Make it **Public**
5. Click "Create bucket"

6. Set up storage policies:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 2.5 Enable Realtime

1. Go to **Database** → **Replication**
2. Enable replication for these tables:
   - ✅ `tasks`
   - ✅ `discussions`
   - ✅ `projects`
   - ✅ `project_members`

## 🔑 Step 3: Environment Variables

### 3.1 Get Supabase Credentials

1. Go to **Settings** → **API** in Supabase dashboard
2. Copy:
   - **Project URL**
   - **anon public** key

### 3.2 Create .env File

1. In the project root, create a `.env` file:

```bash
touch .env
```

2. Add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit `.env` to version control!

## 🚀 Step 4: Run the Application

### 4.1 Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4.2 Test the Application

1. **Sign Up**: Create a new account
2. **Create Project**: Add your first project
3. **Add Tasks**: Create some tasks
4. **Test Discussion**: Send messages
5. **Update Profile**: Upload an avatar

## ✅ Verification Checklist

- [ ] All dependencies installed
- [ ] Supabase project created
- [ ] All database tables created
- [ ] RLS policies applied
- [ ] Storage bucket created
- [ ] Realtime enabled
- [ ] Environment variables configured
- [ ] App runs without errors
- [ ] Can sign up and log in
- [ ] Can create projects
- [ ] Can create tasks
- [ ] Can send messages
- [ ] Can update profile

## 🐛 Common Issues

### Issue: "Missing environment variables"
**Solution**: Check your `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: "Failed to fetch"
**Solution**: Verify Supabase project is running and URL is correct

### Issue: "Permission denied"
**Solution**: Check RLS policies are correctly applied

### Issue: "Cannot upload avatar"
**Solution**: Verify storage bucket is public and policies are set

### Issue: "Realtime not working"
**Solution**: Enable replication for tables in Supabase dashboard

## 📚 Next Steps

1. Read the main [README.md](./README.md) for feature details
2. Explore the codebase structure
3. Customize the theme in `tailwind.config.js`
4. Add your own features
5. Deploy to production (see README.md)

## 🎉 You're All Set!

Your SynergySphere installation is complete. Happy collaborating!

For more help, check the [README.md](./README.md) or open an issue on GitHub.

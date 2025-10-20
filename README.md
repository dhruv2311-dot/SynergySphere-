# SynergySphere 🚀

**A Modern Team Collaboration Platform**

Built for Odoo x NMIT Hackathon 2025

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.6-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Overview

SynergySphere is a comprehensive team collaboration platform that enables teams to manage projects, assign tasks, track progress, and communicate effectively in real-time. Built with modern web technologies, it provides a seamless experience across desktop and mobile devices.

## ✨ Features

### 🔐 Authentication
- Secure email/password authentication via Supabase Auth
- User signup with automatic profile creation
- Protected routes and session management

### 📊 Dashboard
- Overview of all projects you're part of
- Project cards showing progress, members, and task counts
- Quick project creation with team member invitations

### 🎯 Project Management
- Create and manage multiple projects
- Add team members by email
- Project manager role with edit/delete permissions
- Real-time project updates

### ✅ Task Management
- Create tasks with title, description, assignee, and due date
- Three-column Kanban view (To-Do, In Progress, Done)
- Drag-and-drop status updates
- Filter tasks by status
- Task assignment to team members
- Edit and delete tasks

### 💬 Team Communication
- Real-time discussion threads for each project
- Message history with timestamps
- Auto-scroll to latest messages
- User avatars and names

### 👤 Profile Management
- Update profile information (name, bio)
- Upload and manage profile picture
- View account information

### 📱 My Tasks Page
- View all tasks assigned to you across projects
- Grouped by project
- Filter by status (To-Do, In Progress, Done)
- Quick status updates

### 🔔 Real-time Notifications
- Toast notifications for new task assignments
- Notifications for task completions
- New message alerts in discussions
- Powered by Supabase Realtime

### 📱 Responsive Design
- Mobile-first approach
- Hamburger menu for mobile navigation
- Optimized layouts for all screen sizes
- Touch-friendly interface

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand + React Context
- **Database & Auth**: Supabase
- **Notifications**: React Toastify
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: date-fns

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx              # Top navigation bar
│   ├── Sidebar.jsx             # Side navigation menu
│   ├── ProjectCard.jsx         # Project display card
│   ├── TaskCard.jsx            # Task display card
│   ├── DiscussionThread.jsx   # Real-time chat component
│   └── Modal.jsx               # Reusable modal component
│
├── pages/
│   ├── Login.jsx               # Login page
│   ├── Signup.jsx              # Registration page
│   ├── Dashboard.jsx           # Main dashboard
│   ├── ProjectDetail.jsx       # Project details with tabs
│   ├── MyTasks.jsx             # User's tasks overview
│   ├── Profile.jsx             # User profile settings
│   └── NotFound.jsx            # 404 page
│
├── context/
│   └── UserContext.jsx         # User authentication context
│
├── hooks/
│   ├── useAuth.js              # Authentication operations
│   ├── useProjects.js          # Project CRUD operations
│   ├── useTasks.js             # Task CRUD operations
│   └── useRealtime.js          # Real-time subscriptions
│
├── lib/
│   └── supabaseClient.js       # Supabase initialization
│
├── utils/
│   └── helpers.js              # Utility functions
│
├── App.jsx                     # Main app component
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## 🗄️ Database Schema

### Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `project_members`
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(project_id, user_id)
);
```

#### `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('To-Do', 'In Progress', 'Done')),
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `discussions`
```sql
CREATE TABLE discussions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Storage Buckets

Create a storage bucket named `avatars` for profile pictures:
- Public access enabled
- File size limit: 2MB
- Allowed file types: image/*

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- A Supabase account and project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SynergySphere
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the SQL commands from the Database Schema section above in the Supabase SQL Editor
   
   c. Create the `avatars` storage bucket:
      - Go to Storage in Supabase dashboard
      - Create new bucket named `avatars`
      - Make it public
   
   d. Enable Realtime for all tables:
      - Go to Database → Replication
      - Enable replication for: `tasks`, `discussions`, `projects`

4. **Configure environment variables**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings → API.

5. **Start the development server**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔧 Configuration

### Row Level Security (RLS) Policies

Add these policies in Supabase for security:

**profiles table:**
```sql
-- Allow users to read all profiles
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

**projects table:**
```sql
-- Allow users to read projects they're part of
CREATE POLICY "Users can view their projects"
ON projects FOR SELECT
USING (
  auth.uid() = manager_id OR
  auth.uid() IN (
    SELECT user_id FROM project_members WHERE project_id = id
  )
);

-- Allow users to create projects
CREATE POLICY "Users can create projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = manager_id);

-- Allow managers to update their projects
CREATE POLICY "Managers can update projects"
ON projects FOR UPDATE
USING (auth.uid() = manager_id);

-- Allow managers to delete their projects
CREATE POLICY "Managers can delete projects"
ON projects FOR DELETE
USING (auth.uid() = manager_id);
```

**tasks table:**
```sql
-- Allow project members to view tasks
CREATE POLICY "Project members can view tasks"
ON tasks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

-- Allow project members to create tasks
CREATE POLICY "Project members can create tasks"
ON tasks FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = tasks.project_id
    AND user_id = auth.uid()
  )
);

-- Allow task assignees and managers to update tasks
CREATE POLICY "Assignees and managers can update tasks"
ON tasks FOR UPDATE
USING (
  auth.uid() = assigned_to OR
  auth.uid() IN (
    SELECT manager_id FROM projects WHERE id = tasks.project_id
  )
);
```

## 📦 Build for Production

```bash
npm run build
```

The optimized build will be in the `dist` folder.

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Deploy to Netlify

1. Install Netlify CLI:
```bash
npm i -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

3. Add environment variables in Netlify dashboard

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to change the primary color:

```js
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom color palette
      }
    }
  }
}
```

### Features

The codebase is modular and easy to extend:
- Add new pages in `src/pages/`
- Create new components in `src/components/`
- Add custom hooks in `src/hooks/`

## 🐛 Troubleshooting

**Issue**: Supabase connection errors
- **Solution**: Verify your `.env` file has correct credentials

**Issue**: Real-time updates not working
- **Solution**: Enable Realtime replication in Supabase dashboard

**Issue**: Avatar upload fails
- **Solution**: Check storage bucket permissions and file size limits

**Issue**: Tasks not showing
- **Solution**: Verify RLS policies are correctly set up

## 📝 License

MIT License - feel free to use this project for learning or hackathons!

## 🤝 Contributing

This is a hackathon project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 👥 Team

Built for Odoo x NMIT Hackathon 2025

## 🙏 Acknowledgments

- Supabase for the amazing backend platform
- React team for the excellent framework
- TailwindCSS for the utility-first CSS framework
- All open-source contributors

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Happy Collaborating! 🎉**

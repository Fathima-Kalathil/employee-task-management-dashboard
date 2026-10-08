# Employee Task Management Dashboard

An internal admin dashboard to manage employees and their tasks.

**Stack:** React (Vite) + Tailwind CSS | Node.js + Express | PostgreSQL (Supabase) | JWT authentication

## Features
- Register and login (JWT). Passwords are stored hashed.
- Add, edit and delete employees; search the employee list
- Create, edit and delete tasks and assign them to employees
- Task fields: title, description, assigned employee, priority, due date, status
- Change a task's status inline; filter tasks by employee and by status (Pending / In Progress / Completed)
- Dashboard summary: total employees and task counts by status
- Confirmation popups for deletes; responsive layout (sidebar collapses on mobile)

## Project structure
```
client/   React frontend (Vite, Tailwind CSS, React Router, Axios)
server/   Node.js + Express REST API (pg, jsonwebtoken)
  schema.sql   database tables - run once in the Supabase SQL Editor
```

## Run locally
Requires Node 18+ and a Supabase (PostgreSQL) project. Run `server/schema.sql` once in the Supabase SQL Editor.

```bash
# Backend
cd server
cp .env.example .env     # set DATABASE_URL and JWT_SECRET
npm install
npm run dev              # http://localhost:5000

# Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Open the app and use **Create an account** to register. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` for a built-in admin login.

## Environment variables
**server**
| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase connection string (Transaction pooler) |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Frontend URL (for CORS), no trailing slash |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Optional built-in admin login |

**client**
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL ending in `/api` |

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create an account, returns JWT |
| POST | /api/auth/login | Login, returns JWT |
| GET/POST | /api/employees | List / create employees |
| PUT/DELETE | /api/employees/:id | Update / delete (their tasks become unassigned) |
| GET/POST | /api/tasks | List (`?status=&employee=`) / create |
| PUT/DELETE | /api/tasks/:id | Update / delete |
| PATCH | /api/tasks/:id/status | Change status |
| GET | /api/stats | Dashboard counts |

All endpoints except register and login require `Authorization: Bearer <token>`.

## Deploy (Vercel)
Create two Vercel projects from this repository:
1. **Backend:** import the `server` folder. Set `DATABASE_URL`, `JWT_SECRET` and `CLIENT_URL`.
2. **Frontend:** import the `client` folder. Set `VITE_API_URL` to `https://<backend-domain>/api`.

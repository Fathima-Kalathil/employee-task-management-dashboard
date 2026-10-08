-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- Creates the employees, tasks and users tables.

create table if not exists employees (
  id serial primary key,
  name text not null,
  email text not null unique,
  position text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id serial primary key,
  title text not null,
  description text not null default '',
  assigned_to integer references employees(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_status on tasks(status);
create index if not exists idx_tasks_assigned_to on tasks(assigned_to);

-- Users who sign up through the Register page
create table if not exists users (
  id serial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);
alter table users enable row level security;

alter table employees enable row level security;
alter table tasks enable row level security;

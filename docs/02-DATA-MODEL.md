# Foundation — Data Model & Database Schema

## TypeScript Types

```typescript
// src/lib/db/types.ts

export type DIYLevel = 'hands-on' | 'capable' | 'basic' | 'manager'
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'done'
export type TaskTag = 'DIY' | 'Pro'
export type ExpenseCategory = 'materials' | 'labor' | 'tools' | 'fixtures' | 'permits' | 'other'
export type MaterialSource = 'amazon' | 'hd' | 'lowes' | 'local' | 'other'
export type MaterialPriority = 'urgent' | 'needed' | 'planned' | 'optional'
export type LogEntryType = 'note' | 'ai' | 'insight' | 'action'

export interface House {
  id:         string
  address:    string
  city:       string
  state:      string
  zip:        string
  year_built: number | null
  sqft:       number | null
  style:      string | null
  rooms:      string[]          // ['Kitchen','Bathroom','Living Room', ...]
  created_at: string
}

export interface Profile {
  id:         string            // matches auth.users.id
  house_id:   string
  name:       string
  diy_level:  DIYLevel
  avatar_url: string | null
  created_at: string
}

export interface Project {
  id:          string
  house_id:    string
  name:        string
  room:        string
  color:       string           // hex, e.g. '#d4903a'
  status:      ProjectStatus
  budget:      number
  target_date: string | null
  notes:       string | null
  created_at:  string
  // computed (not stored)
  spent?:      number
  progress?:   number           // 0-100
  tasks_total?: number
  tasks_done?:  number
  days_left?:   number | null
  next_task?:   string | null
  next_date?:   string | null
}

export interface Phase {
  id:         string
  project_id: string
  name:       string
  color:      string
  position:   number
  created_at: string
}

export interface Task {
  id:          string
  project_id:  string
  phase_id:    string | null
  name:        string
  tag:         TaskTag
  who:         string           // 'Leo' | 'Both' | 'Pro' | partner name
  due_date:    string | null
  duration:    string           // '2h' | '45m' | '1d'
  cost:        number
  done:        boolean
  position:    number
  notes:       string | null
  created_at:  string
}

export interface Expense {
  id:          string
  project_id:  string
  description: string
  amount:      number
  category:    ExpenseCategory
  paid_by:     string
  receipt_url: string | null
  logged_at:   string
}

export interface Material {
  id:          string
  house_id:    string
  project_id:  string | null
  name:        string
  price:       number | null
  qty:         string | null
  source:      MaterialSource
  priority:    MaterialPriority
  needed_by:   string | null
  note:        string | null
  done:        boolean
  url:         string | null
  created_at:  string
}

export interface BrainstormSession {
  id:          string
  project_id:  string
  notes:       string
  updated_at:  string
  created_at:  string
}

export interface BrainstormLogEntry {
  id:          string
  session_id:  string
  text:        string
  type:        LogEntryType
  created_at:  string
}

export interface HouseMemoryEntry {
  id:          string
  house_id:    string
  room:        string | null
  title:       string
  description: string | null
  date:        string | null
  tags:        string[]
  photos:      string[]
  created_at:  string
}

export interface TodayItem {
  text:   string
  time:   string
  badge:  string
  type:   'delivery' | 'blocking' | 'task' | 'buy'
  dot:    string  // hex color
}
```

## Drizzle Schema

```typescript
// src/lib/db/schema.ts
import {
  pgTable, uuid, text, integer, numeric, boolean,
  timestamp, jsonb, pgEnum
} from 'drizzle-orm/pg-core'

export const projectStatusEnum = pgEnum('project_status',
  ['planning','active','paused','done'])
export const taskTagEnum = pgEnum('task_tag', ['DIY','Pro'])
export const expenseCatEnum = pgEnum('expense_category',
  ['materials','labor','tools','fixtures','permits','other'])
export const materialSourceEnum = pgEnum('material_source',
  ['amazon','hd','lowes','local','other'])
export const materialPriorityEnum = pgEnum('material_priority',
  ['urgent','needed','planned','optional'])
export const diyLevelEnum = pgEnum('diy_level',
  ['hands-on','capable','basic','manager'])
export const logEntryTypeEnum = pgEnum('log_entry_type',
  ['note','ai','insight','action'])

export const houses = pgTable('houses', {
  id:         uuid('id').primaryKey().defaultRandom(),
  address:    text('address').notNull(),
  city:       text('city').notNull(),
  state:      text('state').notNull(),
  zip:        text('zip'),
  year_built: integer('year_built'),
  sqft:       integer('sqft'),
  style:      text('style'),
  rooms:      jsonb('rooms').$type<string[]>().default([]),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id:         uuid('id').primaryKey(),  // references auth.users
  house_id:   uuid('house_id').references(() => houses.id),
  name:       text('name').notNull(),
  diy_level:  diyLevelEnum('diy_level').default('capable'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const projects = pgTable('projects', {
  id:          uuid('id').primaryKey().defaultRandom(),
  house_id:    uuid('house_id').references(() => houses.id).notNull(),
  name:        text('name').notNull(),
  room:        text('room').notNull(),
  color:       text('color').notNull().default('#d4b978'),
  status:      projectStatusEnum('status').default('planning').notNull(),
  budget:      numeric('budget', {precision:10,scale:2}).default('0').notNull(),
  target_date: text('target_date'),
  notes:       text('notes'),
  created_at:  timestamp('created_at').defaultNow().notNull(),
})

export const phases = pgTable('phases', {
  id:         uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => projects.id, {onDelete:'cascade'}).notNull(),
  name:       text('name').notNull(),
  color:      text('color').notNull().default('#d4b978'),
  position:   integer('position').default(0).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const tasks = pgTable('tasks', {
  id:         uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => projects.id, {onDelete:'cascade'}).notNull(),
  phase_id:   uuid('phase_id').references(() => phases.id, {onDelete:'set null'}),
  name:       text('name').notNull(),
  tag:        taskTagEnum('tag').default('DIY').notNull(),
  who:        text('who').default('Both').notNull(),
  due_date:   text('due_date'),
  duration:   text('duration').default('1h').notNull(),
  cost:       numeric('cost', {precision:10,scale:2}).default('0').notNull(),
  done:       boolean('done').default(false).notNull(),
  position:   integer('position').default(0).notNull(),
  notes:      text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const expenses = pgTable('expenses', {
  id:          uuid('id').primaryKey().defaultRandom(),
  project_id:  uuid('project_id').references(() => projects.id, {onDelete:'cascade'}).notNull(),
  description: text('description').notNull(),
  amount:      numeric('amount', {precision:10,scale:2}).notNull(),
  category:    expenseCatEnum('category').default('other').notNull(),
  paid_by:     text('paid_by').default('Both').notNull(),
  receipt_url: text('receipt_url'),
  logged_at:   timestamp('logged_at').defaultNow().notNull(),
})

export const materials = pgTable('materials', {
  id:         uuid('id').primaryKey().defaultRandom(),
  house_id:   uuid('house_id').references(() => houses.id).notNull(),
  project_id: uuid('project_id').references(() => projects.id, {onDelete:'set null'}),
  name:       text('name').notNull(),
  price:      numeric('price', {precision:10,scale:2}),
  qty:        text('qty'),
  source:     materialSourceEnum('source').default('other').notNull(),
  priority:   materialPriorityEnum('priority').default('needed').notNull(),
  needed_by:  text('needed_by'),
  note:       text('note'),
  done:       boolean('done').default(false).notNull(),
  url:        text('url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const brainstorm_sessions = pgTable('brainstorm_sessions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => projects.id, {onDelete:'cascade'}).notNull(),
  notes:      text('notes').default('').notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const brainstorm_log = pgTable('brainstorm_log', {
  id:         uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').references(() => brainstorm_sessions.id, {onDelete:'cascade'}).notNull(),
  text:       text('text').notNull(),
  type:       logEntryTypeEnum('type').default('note').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const house_memory = pgTable('house_memory', {
  id:          uuid('id').primaryKey().defaultRandom(),
  house_id:    uuid('house_id').references(() => houses.id).notNull(),
  room:        text('room'),
  title:       text('title').notNull(),
  description: text('description'),
  date:        text('date'),
  tags:        jsonb('tags').$type<string[]>().default([]),
  photos:      jsonb('photos').$type<string[]>().default([]),
  created_at:  timestamp('created_at').defaultNow().notNull(),
})
```

## Supabase SQL Migration

Run this in Supabase SQL editor to create all tables:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type project_status as enum ('planning','active','paused','done');
create type task_tag as enum ('DIY','Pro');
create type expense_category as enum ('materials','labor','tools','fixtures','permits','other');
create type material_source as enum ('amazon','hd','lowes','local','other');
create type material_priority as enum ('urgent','needed','planned','optional');
create type diy_level as enum ('hands-on','capable','basic','manager');
create type log_entry_type as enum ('note','ai','insight','action');

-- Houses
create table houses (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  state text not null default 'CA',
  zip text,
  year_built int,
  sqft int,
  style text,
  rooms jsonb default '[]',
  created_at timestamptz default now() not null
);

-- Profiles (one per auth user, many per house = couples)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  house_id uuid references houses on delete set null,
  name text not null,
  diy_level diy_level default 'capable',
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses on delete cascade,
  name text not null,
  room text not null,
  color text not null default '#d4b978',
  status project_status default 'planning' not null,
  budget numeric(10,2) default 0 not null,
  target_date text,
  notes text,
  created_at timestamptz default now() not null
);

-- Phases
create table phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  name text not null,
  color text not null default '#d4b978',
  position int default 0 not null,
  created_at timestamptz default now() not null
);

-- Tasks
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  phase_id uuid references phases on delete set null,
  name text not null,
  tag task_tag default 'DIY' not null,
  who text default 'Both' not null,
  due_date text,
  duration text default '1h' not null,
  cost numeric(10,2) default 0 not null,
  done boolean default false not null,
  position int default 0 not null,
  notes text,
  created_at timestamptz default now() not null
);

-- Expenses
create table expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  description text not null,
  amount numeric(10,2) not null,
  category expense_category default 'other' not null,
  paid_by text default 'Both' not null,
  receipt_url text,
  logged_at timestamptz default now() not null
);

-- Materials
create table materials (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses on delete cascade,
  project_id uuid references projects on delete set null,
  name text not null,
  price numeric(10,2),
  qty text,
  source material_source default 'other' not null,
  priority material_priority default 'needed' not null,
  needed_by text,
  note text,
  done boolean default false not null,
  url text,
  created_at timestamptz default now() not null
);

-- Brainstorm
create table brainstorm_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects on delete cascade,
  notes text default '' not null,
  updated_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

create table brainstorm_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references brainstorm_sessions on delete cascade,
  text text not null,
  type log_entry_type default 'note' not null,
  created_at timestamptz default now() not null
);

-- House Memory
create table house_memory (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references houses on delete cascade,
  room text,
  title text not null,
  description text,
  date text,
  tags jsonb default '[]',
  photos jsonb default '[]',
  created_at timestamptz default now() not null
);

-- Indexes
create index on projects(house_id);
create index on tasks(project_id);
create index on tasks(phase_id);
create index on expenses(project_id);
create index on materials(house_id);
create index on materials(project_id);
create index on brainstorm_sessions(project_id);
create index on house_memory(house_id);

-- Row Level Security
alter table houses enable row level security;
alter table profiles enable row level security;
alter table projects enable row level security;
alter table phases enable row level security;
alter table tasks enable row level security;
alter table expenses enable row level security;
alter table materials enable row level security;
alter table brainstorm_sessions enable row level security;
alter table brainstorm_log enable row level security;
alter table house_memory enable row level security;

-- RLS Policies
-- Users can only see data for their house
create policy "Users see their house" on houses
  for all using (
    id in (select house_id from profiles where id = auth.uid())
  );

create policy "Users see their profile" on profiles
  for all using (
    house_id in (select house_id from profiles where id = auth.uid())
  );

create policy "House members see projects" on projects
  for all using (
    house_id in (select house_id from profiles where id = auth.uid())
  );

create policy "House members see phases" on phases
  for all using (
    project_id in (
      select id from projects where house_id in (
        select house_id from profiles where id = auth.uid()
      )
    )
  );

create policy "House members see tasks" on tasks
  for all using (
    project_id in (
      select id from projects where house_id in (
        select house_id from profiles where id = auth.uid()
      )
    )
  );

create policy "House members see expenses" on expenses
  for all using (
    project_id in (
      select id from projects where house_id in (
        select house_id from profiles where id = auth.uid()
      )
    )
  );

create policy "House members see materials" on materials
  for all using (
    house_id in (select house_id from profiles where id = auth.uid())
  );

create policy "House members see brainstorm" on brainstorm_sessions
  for all using (
    project_id in (
      select id from projects where house_id in (
        select house_id from profiles where id = auth.uid()
      )
    )
  );

create policy "House members see log" on brainstorm_log
  for all using (
    session_id in (
      select id from brainstorm_sessions where project_id in (
        select id from projects where house_id in (
          select house_id from profiles where id = auth.uid()
        )
      )
    )
  );

create policy "House members see memory" on house_memory
  for all using (
    house_id in (select house_id from profiles where id = auth.uid())
  );
```

## Computed Values

These are not stored — calculate them at query time:

```typescript
// Project spent = sum of all expenses
const project_spent = expenses.sum(amount).where(project_id = project.id)

// Project progress = done tasks / total tasks * 100
const progress = tasks.count(done=true) / tasks.count() * 100

// Days left = target_date - today
const days_left = target_date ? differenceInDays(parseISO(target_date), new Date()) : null

// Next task = first incomplete task ordered by position
const next_task = tasks.findFirst({ done: false, orderBy: position })
```

## Real-time Subscriptions

Set up Supabase real-time on these tables (couples see each other's changes live):

```typescript
// src/lib/supabase/realtime.ts
const REALTIME_TABLES = ['tasks','expenses','materials','projects','brainstorm_sessions']

// Subscribe per house_id to filter to relevant data only
supabase
  .channel('house-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, callback)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'materials' }, callback)
  .subscribe()
```

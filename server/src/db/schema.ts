import { serial, text, pgTable, timestamp, boolean, json, pgEnum } from 'drizzle-orm/pg-core';

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Posts table
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Services table
export const servicesTable = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  features: json('features').$type<string[]>().notNull(), // Array of feature strings
  whatsapp_link: text('whatsapp_link').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Team Members table
export const teamMembersTable = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  position: text('position').notNull(),
  description: text('description'), // Nullable by default
  image_url: text('image_url'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull()
});

// Company Profile table (singleton table - should only have one record)
export const companyProfileTable = pgTable('company_profile', {
  id: serial('id').primaryKey(),
  about_us: text('about_us').notNull(),
  vision: text('vision').notNull(),
  mission: text('mission').notNull(),
  contact_info: text('contact_info').notNull(),
  documentation_images: json('documentation_images').$type<string[]>().notNull(), // Array of image URLs
  proposal_url: text('proposal_url'), // Nullable by default
  legal_doc_url: text('legal_doc_url'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Running Text table
export const runningTextTable = pgTable('running_text', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Categories table (for blog post categories)
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;

export type TeamMember = typeof teamMembersTable.$inferSelect;
export type NewTeamMember = typeof teamMembersTable.$inferInsert;

export type CompanyProfile = typeof companyProfileTable.$inferSelect;
export type NewCompanyProfile = typeof companyProfileTable.$inferInsert;

export type RunningText = typeof runningTextTable.$inferSelect;
export type NewRunningText = typeof runningTextTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  posts: postsTable,
  services: servicesTable,
  teamMembers: teamMembersTable,
  companyProfile: companyProfileTable,
  runningText: runningTextTable,
  categories: categoriesTable
};
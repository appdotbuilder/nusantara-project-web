import { z } from 'zod';

// User schemas
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
  role: z.enum(['admin', 'user']),
  created_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'user']).default('user')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const loginInputSchema = z.object({
  username: z.string(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  username: z.string().min(3).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['admin', 'user']).optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

// Post schemas
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  date: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Post = z.infer<typeof postSchema>;

export const createPostInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.coerce.date().optional() // Defaults to current date if not provided
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

export const updatePostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  date: z.coerce.date().optional()
});

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Service schemas
export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  features: z.array(z.string()),
  whatsapp_link: z.string().url(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Service = z.infer<typeof serviceSchema>;

export const createServiceInputSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  features: z.array(z.string()).min(1, 'At least one feature is required'),
  whatsapp_link: z.string().url('Must be a valid URL')
});

export type CreateServiceInput = z.infer<typeof createServiceInputSchema>;

export const updateServiceInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  features: z.array(z.string()).min(1).optional(),
  whatsapp_link: z.string().url().optional()
});

export type UpdateServiceInput = z.infer<typeof updateServiceInputSchema>;

// Team Member schema
export const teamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  position: z.string(),
  description: z.string().nullable(),
  image_url: z.string().url().nullable(),
  created_at: z.coerce.date()
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// Company Profile schemas
export const companyProfileSchema = z.object({
  id: z.number(),
  about_us: z.string(),
  vision: z.string(),
  mission: z.string(),
  contact_info: z.string(),
  documentation_images: z.array(z.string().url()),
  proposal_url: z.string().url().nullable(),
  legal_doc_url: z.string().url().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type CompanyProfile = z.infer<typeof companyProfileSchema>;

export const updateCompanyProfileInputSchema = z.object({
  about_us: z.string().optional(),
  vision: z.string().optional(),
  mission: z.string().optional(),
  contact_info: z.string().optional(),
  documentation_images: z.array(z.string().url()).optional(),
  proposal_url: z.string().url().nullable().optional(),
  legal_doc_url: z.string().url().nullable().optional()
});

export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileInputSchema>;

// Running Text schemas
export const runningTextSchema = z.object({
  id: z.number(),
  content: z.string(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type RunningText = z.infer<typeof runningTextSchema>;

export const createRunningTextInputSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  is_active: z.boolean().default(true)
});

export type CreateRunningTextInput = z.infer<typeof createRunningTextInputSchema>;

export const updateRunningTextInputSchema = z.object({
  id: z.number(),
  content: z.string().min(1).optional(),
  is_active: z.boolean().optional()
});

export type UpdateRunningTextInput = z.infer<typeof updateRunningTextInputSchema>;

// Category schemas (for blog post categories)
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1, 'Category name is required')
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

// Authentication response schema
export const authResponseSchema = z.object({
  user: userSchema.omit({ password: true }), // Exclude password from response
  token: z.string().optional() // Optional JWT token if implemented
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
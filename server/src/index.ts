import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  loginInputSchema,
  createPostInputSchema,
  updatePostInputSchema,
  createServiceInputSchema,
  updateServiceInputSchema,
  updateCompanyProfileInputSchema,
  createRunningTextInputSchema,
  updateRunningTextInputSchema,
  createCategoryInputSchema
} from './schema';

// Import handlers
import { loginUser, validateSession } from './handlers/auth';
import { createUser, getUsers, getUserById, updateUser, deleteUser } from './handlers/users';
import { createPost, getPosts, getPostById, getRecentPosts, getPostsByCategory, updatePost, deletePost } from './handlers/posts';
import { createService, getServices, getServiceById, updateService, deleteService } from './handlers/services';
import { getCompanyProfile, updateCompanyProfile, getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from './handlers/company_profile';
import { getActiveRunningText, getAllRunningTexts, createRunningText, updateRunningText, deleteRunningText } from './handlers/running_text';
import { getCategories, createCategory, getCategoryById, deleteCategory } from './handlers/categories';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => loginUser(input)),
    validateSession: publicProcedure
      .input(z.string().optional())
      .query(({ input }) => validateSession(input)),
  }),

  // User management routes
  users: router({
    create: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    getAll: publicProcedure
      .query(() => getUsers()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getUserById(input)),
    update: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteUser(input)),
  }),

  // Blog post routes
  posts: router({
    create: publicProcedure
      .input(createPostInputSchema)
      .mutation(({ input }) => createPost(input)),
    getAll: publicProcedure
      .query(() => getPosts()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getPostById(input)),
    getRecent: publicProcedure
      .input(z.number().optional())
      .query(({ input }) => getRecentPosts(input)),
    getByCategory: publicProcedure
      .input(z.string())
      .query(({ input }) => getPostsByCategory(input)),
    update: publicProcedure
      .input(updatePostInputSchema)
      .mutation(({ input }) => updatePost(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deletePost(input)),
  }),

  // Services routes
  services: router({
    create: publicProcedure
      .input(createServiceInputSchema)
      .mutation(({ input }) => createService(input)),
    getAll: publicProcedure
      .query(() => getServices()),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getServiceById(input)),
    update: publicProcedure
      .input(updateServiceInputSchema)
      .mutation(({ input }) => updateService(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteService(input)),
  }),

  // Company profile routes
  companyProfile: router({
    get: publicProcedure
      .query(() => getCompanyProfile()),
    update: publicProcedure
      .input(updateCompanyProfileInputSchema)
      .mutation(({ input }) => updateCompanyProfile(input)),
  }),

  // Team members routes
  teamMembers: router({
    getAll: publicProcedure
      .query(() => getTeamMembers()),
    create: publicProcedure
      .input(z.object({
        name: z.string(),
        position: z.string(),
        description: z.string().nullable().optional(),
        image_url: z.string().url().nullable().optional()
      }))
      .mutation(({ input }) => createTeamMember(input)),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        position: z.string().optional(),
        description: z.string().nullable().optional(),
        image_url: z.string().url().nullable().optional()
      }))
      .mutation(({ input }) => updateTeamMember(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteTeamMember(input)),
  }),

  // Running text routes
  runningText: router({
    getActive: publicProcedure
      .query(() => getActiveRunningText()),
    getAll: publicProcedure
      .query(() => getAllRunningTexts()),
    create: publicProcedure
      .input(createRunningTextInputSchema)
      .mutation(({ input }) => createRunningText(input)),
    update: publicProcedure
      .input(updateRunningTextInputSchema)
      .mutation(({ input }) => updateRunningText(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteRunningText(input)),
  }),

  // Categories routes
  categories: router({
    getAll: publicProcedure
      .query(() => getCategories()),
    create: publicProcedure
      .input(createCategoryInputSchema)
      .mutation(({ input }) => createCategory(input)),
    getById: publicProcedure
      .input(z.number())
      .query(({ input }) => getCategoryById(input)),
    delete: publicProcedure
      .input(z.number())
      .mutation(({ input }) => deleteCategory(input)),
  }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
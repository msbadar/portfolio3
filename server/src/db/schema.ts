import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  avatar: varchar('avatar', { length: 500 }),
  verified: boolean('verified').default(false),
  bio: text('bio'),
  followers: integer('followers').default(0),
  following: integer('following').default(0),
  link: varchar('link', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Unified Posts table - stores posts, blogs, and comments
// type: 'post' for short posts, 'blog' for long-form content, 'comment' for comments
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  type: varchar('type', { length: 20 }).notNull().default('post'), // 'post', 'blog', 'comment'
  parentId: integer('parent_id'), // Self-reference for comments (references posts.id)
  content: text('content').notNull(),
  image: varchar('image', { length: 500 }),
  // Blog-specific fields (null for posts/comments)
  title: varchar('title', { length: 255 }),
  excerpt: text('excerpt'),
  coverImage: varchar('cover_image', { length: 500 }),
  readTime: varchar('read_time', { length: 50 }),
  category: varchar('category', { length: 100 }),
  // Engagement metrics
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  reposts: integer('reposts').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Post likes table (for tracking which users liked which posts/blogs/comments)
export const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User follows table
export const userFollows = pgTable('user_follows', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  followingId: integer('following_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  token: varchar('token', { length: 500 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Sites table
export const sites = pgTable('sites', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User sites junction table (many-to-many relationship)
export const userSites = pgTable('user_sites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  siteId: integer('site_id')
    .references(() => sites.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

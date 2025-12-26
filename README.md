# Portfolio 3

A full-stack portfolio application with a separate client (Next.js) and server (NestJS).

## Project Structure

```
├── client/          # Next.js frontend application
│   ├── src/         # React components, hooks, and pages
│   ├── public/      # Static assets
│   └── package.json
├── server/          # NestJS backend API
│   ├── src/         # API modules (auth, posts, blogs, users)
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Server Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portfolio
DATABASE_SSL=false

# JWT
JWT_SECRET=your-secret-key-min-32-characters-long

# Server
NODE_ENV=development
PORT=3001

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

4. Set up the database:

```bash
# Push schema to database
npm run db:push

# Or generate and run migrations
npm run db:generate
npm run db:migrate
```

5. Start the server:

```bash
npm run start:dev
```

The server will be available at `http://localhost:3001`.

### Client Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start the development server:

```bash
npm run dev
```

The client will be available at `http://localhost:3000`.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get a single post
- `POST /api/posts` - Create a post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Toggle like on a post

### Blogs
- `GET /api/blogs` - Get all blogs
- `GET /api/blogs/:id` - Get a single blog
- `POST /api/blogs` - Create a blog
- `PUT /api/blogs/:id` - Update a blog
- `DELETE /api/blogs/:id` - Delete a blog
- `POST /api/blogs/:id/like` - Toggle like on a blog

### Users
- `GET /api/users/suggestions` - Get user suggestions
- `POST /api/users/:id/follow` - Toggle follow on a user

## Technologies

### Client
- Next.js 16
- React 19
- TypeScript
- TailwindCSS

### Server
- NestJS 11
- Drizzle ORM
- PostgreSQL
- JWT Authentication

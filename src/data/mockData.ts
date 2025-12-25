export const initialPostsData = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Maya Chen",
      username: "mayachen",
      avatar: "https://i.pravatar.cc/150?img=1",
      verified: true,
    },
    content:
      "Just finished a 10-mile hike through the redwoods. The morning mist made everything feel like a dream ✨",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
    likes: 234,
    comments: 18,
    reposts: 5,
    time: "2h",
    liked: false,
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Alex Rivera",
      username: "alexcodes",
      avatar: "https://i.pravatar.cc/150?img=3",
      verified: true,
    },
    content:
      "Hot take: The best code is the code you delete. Spent all day removing 2000 lines and my app is faster than ever.",
    likes: 892,
    comments: 67,
    reposts: 124,
    time: "4h",
    liked: true,
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Jordan Kim",
      username: "jordankim",
      avatar: "https://i.pravatar.cc/150?img=5",
      verified: false,
    },
    content:
      "New studio setup complete! Finally have space to work on the mural series.",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
    likes: 456,
    comments: 32,
    reposts: 12,
    time: "6h",
    liked: false,
  },
];

export const initialBlogsData = [
  {
    id: 1,
    title: "The Art of Minimalist Design in 2025",
    excerpt:
      "Exploring how less becomes more in modern digital experiences and why simplicity wins.",
    content: `In the ever-evolving landscape of digital design, minimalism has emerged not just as a trend, but as a fundamental philosophy.\n\n## The Philosophy Behind Minimalism\n\nMinimalist design isn't about removing elements until nothing is left—it's about removing elements until only the essential remains.\n\n### Key Principles\n\n**1. Intentional White Space**\nWhite space is not empty space. It's a powerful design element that guides the eye.\n\n**2. Typography as the Hero**\nWith fewer visual elements competing for attention, typography takes center stage.\n\nRemember: Good design is as little design as possible.`,
    coverImage:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop",
    readTime: "5 min read",
    date: "Dec 20, 2025",
    likes: 1243,
    comments: 89,
    category: "Design",
    liked: false,
  },
  {
    id: 2,
    title: "Building Scalable React Applications",
    excerpt:
      "A deep dive into architecture patterns that will save your team countless hours.",
    content: `After building React applications for nearly a decade, I've learned that architecture decisions matter most.\n\n## The Foundation\n\nEvery scalable React application needs three things: clear boundaries, predictable data flow, and testable components.\n\n## State Management in 2025\n\nThe days of Redux boilerplate are behind us. Modern state management focuses on server state vs client state separation.\n\nThe best architecture is one your team can understand and maintain.`,
    coverImage:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    readTime: "8 min read",
    date: "Dec 18, 2025",
    likes: 2891,
    comments: 156,
    category: "Development",
    liked: true,
  },
  {
    id: 3,
    title: "The Future of Remote Work Culture",
    excerpt:
      "How distributed teams are redefining collaboration and what it means for the future.",
    content: `Five years after the great remote work experiment began, we're finally seeing what works.\n\n## The New Normal\n\nRemote work isn't going away. But it's evolving.\n\n### Async-First Communication\n\nThe most successful remote teams have embraced asynchronous communication as their default.\n\nThe future of work isn't about location—it's about outcomes.`,
    coverImage:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    readTime: "6 min read",
    date: "Dec 15, 2025",
    likes: 892,
    comments: 67,
    category: "Culture",
    liked: false,
  },
  {
    id: 4,
    title: "Mastering the Art of Side Projects",
    excerpt:
      "Why every developer should have a side project and how to actually finish one.",
    content: `We all have that graveyard of unfinished side projects. Here's how to break the cycle.\n\n## Why Side Projects Matter\n\nSide projects are more than resume padding. They're safe spaces to experiment.\n\n## The Completion Framework\n\nYour first version should be embarrassingly simple.\n\nNow stop reading and start building.`,
    coverImage:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop",
    readTime: "5 min read",
    date: "Dec 12, 2025",
    likes: 3421,
    comments: 234,
    category: "Productivity",
    liked: false,
  },
];

export const suggestionsData = [
  {
    id: 1,
    name: "Emma Watson",
    username: "emmawatson",
    avatar: "https://i.pravatar.cc/150?img=10",
    verified: true,
    followers: "12.4M",
  },
  {
    id: 2,
    name: "David Park",
    username: "davidp",
    avatar: "https://i.pravatar.cc/150?img=11",
    verified: false,
    followers: "8.2K",
  },
  {
    id: 3,
    name: "Lisa Chen",
    username: "lisadesigns",
    avatar: "https://i.pravatar.cc/150?img=12",
    verified: true,
    followers: "234K",
  },
];

export const currentUserData = {
  id: 0,
  name: "John Doe",
  username: "johndoe",
  avatar: "https://i.pravatar.cc/150?img=33",
  verified: true,
  bio: "Designer & Developer 🎨💻 | Building beautiful things | Coffee enthusiast ☕",
  followers: "12.5K",
  following: "892",
  link: "johndoe.design",
};

# Buddhist Postcard Wall

A beautiful full-stack application for sharing Buddhist-inspired postcards with the community. Users can submit postcards with photos and reflections, and rate other postcards.

## Features

- **Submit Postcards**: Upload photos, handwritten notes, and professional reflections
- **Interactive Wall**: View all postcards in an animated grid layout with GSAP effects
- **Postcard Flip Animation**: Flip cards to see handwritten notes and professional reflections
- **Rating System**: Rate postcards with 1-5 stars and see average ratings
- **Duplicate Prevention**: Prevent multiple votes from the same IP/browser
- **Image Optimization**: Automatic thumbnail generation using Sharp

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Database**: Supabase PostgreSQL
- **Storage**: Vercel Blob (for photos and handwritten images)
- **Animations**: GSAP (GreenSock Animation Platform)
- **Image Processing**: Sharp for thumbnail generation
- **UI Components**: shadcn/ui

## Database Setup

The database schema is defined in `/scripts/001_create_tables.sql`. Run this script in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query and paste the contents of `scripts/001_create_tables.sql`
4. Execute the query

This will create:
- `posts` table for storing postcard submissions
- `votes` table for storing ratings

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## API Routes

### GET /api/postcards
Fetch all postcards (non-hidden)

### POST /api/postcards
Submit a new postcard (multipart form data)
- `name`: Postcard author name (max 30 chars)
- `anonymous`: Boolean flag for anonymous posting
- `title`: Postcard title (max 50 chars)
- `shortDesc`: Short description (50-200 chars)
- `proReflection`: Professional reflection (100-300 chars)
- `photo`: Image file (JPG/PNG)
- `handwritten`: Handwritten note image (JPG/PNG)

### POST /api/votes
Submit a rating for a postcard
- `postcard_id`: UUID of the postcard
- `score`: Rating from 1-5

## Features Overview

### Postcard Form
- Input validation for all fields
- File upload for photos and handwritten images
- Character counter for text fields
- Anonymous posting option

### Postcard Wall
- Responsive grid layout (1-3 columns based on screen size)
- GSAP animations on card appearance:
  - Blur to focus effect
  - Slide up from bottom
  - Staggered animation between cards
- Scale on hover with smooth transitions
- Sorting by latest or top-rated

### Postcard Modal
- Front side shows photo and description
- Back side (3D flip) shows handwritten notes and pro reflection
- Rating interface with visual star selector
- Average rating display with progress bar
- Duplicate vote prevention

## Styling

The application uses:
- Tailwind CSS v4 with custom design tokens
- shadcn/ui components
- Custom color scheme (orange/peach theme)
- GSAP for complex animations

## Browser Support

- Modern browsers with ES2020+ support
- CSS 3D transforms required for flip animation
- Intersection Observer API for lazy loading (optional)

## Performance Optimizations

- Image optimization with Sharp (automatic thumbnails)
- Lazy loading of postcard images
- Efficient database queries with indexes
- GSAP GPU acceleration for animations
- Responsive image sizes

---

Built with ❤️ for the Buddhist community

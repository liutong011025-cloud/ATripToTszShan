-- Create posts table for Buddhist Postcard Wall
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) NOT NULL,
  anonymous BOOLEAN DEFAULT false,
  title VARCHAR(50),
  short_desc TEXT NOT NULL CHECK (char_length(short_desc) >= 50 AND char_length(short_desc) <= 200),
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  handwritten_image_url TEXT NOT NULL,
  pro_reflection TEXT NOT NULL CHECK (char_length(pro_reflection) >= 100 AND char_length(pro_reflection) <= 300),
  author_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ocr_text TEXT,
  avg_score DECIMAL(3,2) DEFAULT 0,
  score_count INTEGER DEFAULT 0,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_token UUID NOT NULL,
  ip VARCHAR(45),
  user_agent TEXT,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  invalidated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, voter_token)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_hidden ON posts(hidden);
CREATE INDEX IF NOT EXISTS idx_votes_post_id ON votes(post_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_token ON votes(voter_token);
CREATE INDEX IF NOT EXISTS idx_votes_ip ON votes(ip);

-- Disable RLS for this simple app (no user auth required)
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

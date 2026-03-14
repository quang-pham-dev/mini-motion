import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
try {
  const envLocal = readFileSync(join(process.cwd(), '.env.local'), 'utf8');
  envLocal.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key] = values.join('=');
      }
    }
  });
} catch (error) {
  console.warn('Warning: Could not load .env.local file');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
  console.log('Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local');
  console.log('You can get it from Supabase Dashboard → Settings → API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createMusicBucket() {
  console.log('🎵 Creating music bucket...');

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('❌ Error listing buckets:', listError);
    process.exit(1);
  }

  const musicBucket = buckets?.find(b => b.id === 'music');

  if (musicBucket) {
    console.log('✅ Bucket "music" already exists');
  } else {
    const { data, error } = await supabase.storage.createBucket('music', {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
    });

    if (error) {
      console.error('❌ Error creating bucket:', error);
      process.exit(1);
    }
    console.log('✅ Bucket "music" created successfully');
  }

  // Verify bucket exists
  const { data: verifyBucket } = await supabase.storage.getBucket('music');
  console.log('📦 Bucket details:', verifyBucket);
}

createMusicBucket().catch(console.error);

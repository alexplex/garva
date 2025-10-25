/**
 * Migration script: Neon → Supabase
 * Creates jokes table and copies all jokes from Neon to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Neon credentials
const neonUrl = process.env.NEON_DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!neonUrl) {
  console.error('❌ Missing Neon database URL');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log('🚀 Starting migration from Neon to Supabase...\n');

  // Step 1: Create table in Supabase via direct connection
  console.log('📋 Step 1: Creating jokes table in Supabase...');
  
  const supabaseClient = new Client({
    connectionString: 'postgres://postgres.bgqscrgticthfcepacok:3OwkIEV2VF5E8Dm4@aws-1-eu-west-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await supabaseClient.connect();
    
    await supabaseClient.query(`
      CREATE TABLE IF NOT EXISTS jokes (
        id BIGSERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        downvotes INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    console.log('✅ Table created');
    
    // Enable RLS and add policy
    await supabaseClient.query(`
      ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Allow all operations" ON jokes;
      CREATE POLICY "Allow all operations" ON jokes
        FOR ALL USING (true) WITH CHECK (true);
    `);
    
    console.log('✅ RLS enabled with allow-all policy');
    
    await supabaseClient.end();
  } catch (error) {
    console.error('❌ Error setting up table:', error.message);
    return;
  }

  // Step 2: Fetch jokes from Neon
  console.log('\n📥 Step 2: Fetching jokes from Neon...');
  const neonClient = new Client({ connectionString: neonUrl });
  
  try {
    await neonClient.connect();
    const result = await neonClient.query('SELECT id, content, upvotes, downvotes, "createdAt" as created_at FROM "Joke" ORDER BY id');
    const jokes = result.rows;
    
    console.log(`✅ Found ${jokes.length} jokes in Neon`);
    
    if (jokes.length === 0) {
      console.log('⚠️  No jokes to migrate');
      return;
    }

    await neonClient.end();

    // Step 3: Insert into Supabase in batches
    console.log('\n📤 Step 3: Inserting jokes into Supabase...');
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < jokes.length; i += batchSize) {
      const batch = jokes.slice(i, i + batchSize).map(joke => ({
        content: joke.content,
        upvotes: joke.upvotes,
        downvotes: joke.downvotes,
        created_at: joke.created_at
      }));

      const { error } = await supabase
        .from('jokes')
        .insert(batch);

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        inserted += batch.length;
        console.log(`✅ Inserted ${inserted}/${jokes.length} jokes...`);
      }
    }

    console.log(`\n🎉 Migration complete! ${inserted} jokes migrated successfully`);
    
    // Verify
    const { count } = await supabase
      .from('jokes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Verification: Supabase now has ${count} jokes`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

migrate().catch(console.error);

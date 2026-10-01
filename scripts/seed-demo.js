/**
 * Optional seed script for demo data:
 * Fargʻona 2-son texnikumi (Fergana Technical College #2)
 *
 * Usage:
 *   pnpm db:seed:demo
 *   or: node scripts/seed-demo.js
 */

const fs = require('fs');
const path = require('path');

// Try loading environment variables from .env or apps/api/.env
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', 'apps', 'api', '.env'),
    path.join(__dirname, '..', 'apps', 'web', '.env.local'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

async function runDemoSeed() {
  console.log('--- Applying Demo Institution Seed Data ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('⚠️ Supabase credentials not found in environment.');
    console.log('\nTo manually apply demo data using psql:');
    console.log('  psql "$DATABASE_URL" -f supabase/seed_demo_institution.sql\n');
    console.log('Or add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env');
    return;
  }

  let createClient;
  try {
    const supabaseModule = require('@supabase/supabase-js');
    createClient = supabaseModule.createClient;
  } catch {
    try {
      const apiSupabase = require(path.join(__dirname, '..', 'apps', 'api', 'node_modules', '@supabase', 'supabase-js'));
      createClient = apiSupabase.createClient;
    } catch (e) {
      console.error('Could not import @supabase/supabase-js:', e.message);
      console.log('Run manually: psql "$DATABASE_URL" -f supabase/seed_demo_institution.sql');
      return;
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Connecting to Supabase at: ${supabaseUrl}`);

  // 1. Update institution_settings
  const publicData = {
    name_uz: 'Fargʻona viloyati Fargʻona shahri 2-son texnikumi',
    name_ru: 'Ферганский техникум № 2',
    short_name_uz: '2-son texnikum',
    short_name_ru: 'Техникум № 2',
    institution_type: 'texnikum',
    legal_address_uz: '150100, Oʻzbekiston Respublikasi, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy',
    legal_address_ru: '150100, Республика Узбекистан, Ферганская область, г. Фергана, ул. Аль-Фергани, д. 42',
    main_phone: '+998 (73) 244-00-00',
    admission_phone: '+998 (73) 244-00-00',
    trust_phone: '1006',
    contact_email: 'info@texnikum2.uz',
    admission_email: 'priem@texnikum2.uz',
    website_domain: 'texnikum2.uz',
    geo_latitude: 40.386400,
    geo_longitude: 71.786400,
    logo_url: '/images/gerb.webp',
    favicon_url: '/favicon.ico',
    coat_of_arms_url: '/images/gerb.webp',
    brand_primary_color: '#1e3a8a',
    social_telegram: 'https://t.me/fargona_texnikum2',
    social_instagram: 'https://instagram.com/fargona_texnikum2',
    social_facebook: 'https://facebook.com/fargona_texnikum2',
    social_youtube: 'https://youtube.com/@fargona_texnikum2',
    stir_inn: '302987654',
    work_hours_uz: 'Dushanba – Shanba: 08:30 – 17:30',
    work_hours_ru: 'Понедельник – Суббота: 08:30 – 17:30',
    is_configured: true,
    setup_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: pubError } = await supabase
    .from('institution_settings')
    .update(publicData)
    .eq('id', 1);

  if (pubError) {
    console.error('❌ Failed to update institution_settings:', pubError.message);
    return;
  }
  console.log('✓ Public institution settings updated successfully');

  // 2. Update institution_private
  const privateData = {
    bank_name: 'Oʻzmilliybank Fargʻona viloyati boshqarmasi',
    bank_account: '23402000300100001010',
    mfo_code: '00014',
    jshshir_pinfl: '31205851234567',
    treasury_account: '400110860262667950100075001',
    oked_code: '85320',
    director_name_uz: 'Karimov Jasur Alisherovich',
    director_name_ru: 'Каримов Жасур Алишерович',
    director_phone: '+998 (73) 244-00-01',
    updated_at: new Date().toISOString(),
  };

  const { error: privError } = await supabase
    .from('institution_private')
    .update(privateData)
    .eq('id', 1);

  if (privError) {
    console.error('❌ Failed to update institution_private:', privError.message);
    return;
  }
  console.log('✓ Private institution settings updated successfully');

  console.log('\n🎉 Demo seed completed! Fergana Technical College #2 demo profile is active.');
}

runDemoSeed().catch((err) => {
  console.error('Unexpected error running demo seed:', err);
  process.exit(1);
});

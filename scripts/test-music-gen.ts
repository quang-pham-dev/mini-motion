/**
 * Test Script: MiniMax Music Generation
 *
 * Tests different model + param combinations to find what works.
 *
 * Usage: npx tsx scripts/test-music-gen.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const value = trimmed.substring(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

const API_KEY = process.env.MINIMAX_API_KEY;
const BASE_URL = 'https://api.minimax.io/v1';

if (!API_KEY) {
  console.error('❌ MINIMAX_API_KEY not found');
  process.exit(1);
}

interface TestCase {
  name: string;
  body: Record<string, unknown>;
}

const tests: TestCase[] = [
  // Test 1: music-01 with ONLY lyrics (no prompt, no audio_setting)
  {
    name: 'music-01 — lyrics only (minimal)',
    body: {
      model: 'music-01',
      lyrics:
        '[verse]\nCalm morning light\nA gentle breeze flows through the trees\n[chorus]\nPeace in every step\nHarmony in every breath',
    },
  },
  // Test 2: music-01 with lyrics + audio_setting
  {
    name: 'music-01 — lyrics + audio_setting',
    body: {
      model: 'music-01',
      lyrics:
        '[verse]\nCalm morning light\nA gentle breeze flows through the trees\n[chorus]\nPeace in every step\nHarmony in every breath',
      audio_setting: {
        sample_rate: 44100,
        bitrate: 256000,
        format: 'mp3',
      },
    },
  },
  // Test 3: music-2.5 with prompt + lyrics
  {
    name: 'music-2.5 — prompt + lyrics',
    body: {
      model: 'music-2.5',
      prompt: 'calm ambient music, peaceful, gentle piano',
      lyrics:
        '[verse]\nCalm morning light\nA gentle breeze flows through the trees\n[chorus]\nPeace in every step\nHarmony in every breath',
    },
  },
  // Test 4: music-2.5 with prompt only (no lyrics)
  {
    name: 'music-2.5 — prompt only (no lyrics)',
    body: {
      model: 'music-2.5',
      prompt: 'calm ambient music, peaceful, gentle piano, instrumental',
      is_instrumental: true,
    },
  },
];

async function runTest(test: TestCase): Promise<void> {
  console.log(`\n🧪 Test: ${test.name}`);
  console.log(`   Body: ${JSON.stringify(test.body, null, 2).split('\n').join('\n   ')}`);

  try {
    const res = await fetch(`${BASE_URL}/music_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(test.body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log(`   ❌ HTTP ${res.status}`);
      console.log(`   Error: ${JSON.stringify(data.base_resp || data, null, 2)}`);
      return;
    }

    if (data.base_resp?.status_code !== 0) {
      console.log(`   ❌ API Error: ${data.base_resp?.status_msg}`);
      return;
    }

    if (data.data?.audio) {
      const audioHex = data.data.audio as string;
      const sizeKB = Math.round(audioHex.length / 2 / 1024);
      console.log(`   ✅ SUCCESS! Audio received: ${sizeKB} KB`);

      // Save the audio file
      const outputDir = path.resolve(__dirname, '..', 'test-output');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      const filename = test.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() + '.mp3';
      const outputPath = path.join(outputDir, filename);

      const bytes = new Uint8Array(audioHex.length / 2);
      for (let i = 0; i < audioHex.length; i += 2) {
        bytes[i / 2] = parseInt(audioHex.substring(i, i + 2), 16);
      }
      fs.writeFileSync(outputPath, Buffer.from(bytes));
      console.log(`   💾 Saved to: ${outputPath}`);

      if (data.extra_info) {
        console.log(
          `   📊 Duration: ${data.extra_info.music_duration}s, Sample rate: ${data.extra_info.sample_rate}, Bitrate: ${data.extra_info.bitrate}`
        );
      }
    } else {
      console.log(`   ⚠️ No audio data in response`);
      console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
    }
  } catch (err) {
    console.log(`   ❌ Network error: ${(err as Error).message}`);
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║  🎵 MiniMax Music Generation Test Suite      ║');
  console.log('╚═══════════════════════════════════════════════╝');

  for (const test of tests) {
    await runTest(test);
  }

  console.log('\n\n📋 Done! Check results above.');
}

main().catch(console.error);

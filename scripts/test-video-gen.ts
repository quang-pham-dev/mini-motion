/**
 * Test Script: Cinematic Video Generation with MiniMax T2V-01-Director
 *
 * This script generates 5 cinematic scenes (~6s each = ~30s total)
 * using T2V-01-Director model with professional camera movement commands.
 *
 * Usage:
 *   npx tsx scripts/test-video-gen.ts
 *
 * Requirements:
 *   - MINIMAX_API_KEY in .env.local
 *   - `tsx` installed (npx will auto-install)
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually (no dotenv dependency needed)
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
  console.error('❌ MINIMAX_API_KEY not found. Set it in .env.local');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════════
// 🎬 CINEMATIC SCENES — 5 scenes × ~6s each = ~30s total video
// Theme: "A Day in Saigon" – vibrant city life with dynamic transitions
// ═══════════════════════════════════════════════════════════════

const SCENES = [
  // {
  //   name: 'Scene 1: Why Debt Feels Heavier Than Money',
  //   prompt: `[Pull out, Tilt down] Cinematic shot, a tired person sitting at a dimly lit kitchen table late at night, looking down at a stack of paper bills. Heavy shadows on their face, feeling of isolation, moody lighting, 4k, photorealistic.`
  // },
  {
    name: 'Scene 1: Why Debt Feels Heavier Than Money',
    prompt: `[Pull out, Tilt down] Cinematic shot, a tired person sitting at a dimly lit kitchen table late at night, looking down at a stack of paper bills. Heavy shadows on their face, feeling of isolation, moody lighting, 4k, photorealistic.`,
  },
];

// ═══════════════════════════════════════════════════════════════
// API Helper Functions
// ═══════════════════════════════════════════════════════════════

interface TaskResponse {
  base_resp: { status_code: number; status_msg: string };
  task_id: string;
}

interface StatusResponse {
  base_resp: { status_code: number; status_msg: string };
  status: 'Queueing' | 'Processing' | 'Success' | 'Fail' | 'Preparing';
  file_id?: string;
}

interface FileResponse {
  base_resp: { status_code: number; status_msg: string };
  file: { file_id: string; download_url?: string };
}

async function submitVideoTask(prompt: string): Promise<string> {
  console.log('   📤 Submitting to MiniMax API...');

  const res = await fetch(`${BASE_URL}/video_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'T2V-01-Director',
      // model: 'MiniMax-Hailuo-2.3',
      prompt,
      prompt_optimizer: true,
      duration: 10,
      resolution: '1080P',
    }),
  });

  const data = (await res.json()) as TaskResponse;

  if (!res.ok || data.base_resp?.status_code !== 0) {
    throw new Error(`Submit failed: ${data.base_resp?.status_msg || res.status}`);
  }

  return data.task_id;
}

async function checkTaskStatus(taskId: string): Promise<StatusResponse> {
  const res = await fetch(
    `${BASE_URL}/query/video_generation?task_id=${encodeURIComponent(taskId)}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${API_KEY}` },
    }
  );

  const data = (await res.json()) as StatusResponse;

  if (!res.ok) {
    throw new Error(`Status check failed: ${res.status}`);
  }

  return data;
}

async function getDownloadUrl(fileId: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/files/retrieve?file_id=${encodeURIComponent(fileId)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  const data = (await res.json()) as FileResponse;

  if (!data.file?.download_url) {
    throw new Error('No download URL returned');
  }

  return data.file.download_url;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
}

// ═══════════════════════════════════════════════════════════════
// Main Execution
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   🎬 MiniMax Cinematic Video Generation Test         ║');
  console.log('║   Model: T2V-01-Director (Camera Commands)          ║');
  console.log('║   Theme: "A Day in Saigon"                          ║');
  console.log('║   Scenes: 5 × ~6s = ~30s total                      ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  // Step 1: Submit all scenes concurrently
  console.log('📋 Step 1: Submitting all 5 scenes to MiniMax API...');
  console.log('');

  const tasks: { name: string; taskId: string; startTime: number }[] = [];

  for (const scene of SCENES) {
    console.log(`🎥 ${scene.name}`);
    try {
      const taskId = await submitVideoTask(scene.prompt);
      tasks.push({ name: scene.name, taskId, startTime: Date.now() });
      console.log(`   ✅ Task ID: ${taskId}`);
    } catch (err) {
      console.error(`   ❌ Failed: ${(err as Error).message}`);
    }
    // Small delay between submissions to avoid rate limiting
    await sleep(1000);
  }

  console.log('');
  console.log(`📊 Submitted ${tasks.length}/${SCENES.length} tasks successfully.`);
  console.log('');

  if (tasks.length === 0) {
    console.error('❌ No tasks submitted. Exiting.');
    process.exit(1);
  }

  // Step 2: Poll all tasks until completion
  console.log('⏳ Step 2: Waiting for video generation (this may take 3-8 minutes per video)...');
  console.log('');

  const results: { name: string; url: string; duration: string }[] = [];
  const failed: { name: string; reason: string }[] = [];
  const pending = new Set(tasks.map(t => t.taskId));
  const MAX_WAIT = 10 * 60 * 1000; // 10 minutes max
  const POLL_INTERVAL = 10_000; // 10 seconds

  while (pending.size > 0) {
    for (const task of tasks) {
      if (!pending.has(task.taskId)) continue;

      // Check timeout
      if (Date.now() - task.startTime > MAX_WAIT) {
        pending.delete(task.taskId);
        failed.push({ name: task.name, reason: 'Timed out after 10 minutes' });
        console.log(`   ⏰ ${task.name} — TIMED OUT`);
        continue;
      }

      try {
        const status = await checkTaskStatus(task.taskId);

        if (status.status === 'Success' && status.file_id) {
          const url = await getDownloadUrl(status.file_id);
          const elapsed = formatDuration(Date.now() - task.startTime);
          pending.delete(task.taskId);
          results.push({ name: task.name, url, duration: elapsed });
          console.log(`   ✅ ${task.name} — DONE (${elapsed})`);
          console.log(`      🔗 ${url}`);
        } else if (status.status === 'Fail') {
          pending.delete(task.taskId);
          failed.push({ name: task.name, reason: status.base_resp.status_msg });
          console.log(`   ❌ ${task.name} — FAILED: ${status.base_resp.status_msg}`);
        } else {
          // Still processing
          const elapsed = formatDuration(Date.now() - task.startTime);
          process.stdout.write(
            `\r   ⏳ [${elapsed}] Pending: ${pending.size} — ${status.status}...     `
          );
        }
      } catch (err) {
        // Network error, continue polling
        console.error(`   ⚠️ Poll error for ${task.name}: ${(err as Error).message}`);
      }
    }

    if (pending.size > 0) {
      await sleep(POLL_INTERVAL);
    }
  }

  // Step 3: Summary
  console.log('');
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║                    📊 RESULTS                        ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('');

  if (results.length > 0) {
    console.log(`✅ Completed: ${results.length}/${tasks.length}`);
    console.log('');
    for (const r of results) {
      console.log(`  🎬 ${r.name}`);
      console.log(`     ⏱  Generated in: ${r.duration}`);
      console.log(`     🔗 ${r.url}`);
      console.log('');
    }
  }

  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.length}/${tasks.length}`);
    for (const f of failed) {
      console.log(`  💔 ${f.name}: ${f.reason}`);
    }
    console.log('');
  }

  console.log('💰 Tip: Each T2V-01-Director video costs ~$0.35-0.70 per generation.');
  console.log('   Total estimated cost for this test: ~$1.75-3.50');
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

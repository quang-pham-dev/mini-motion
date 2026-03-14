import { ERROR_MESSAGES } from '@/constants';

interface MiniMaxConfig {
  apiKey: string;
  baseUrl?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Scene {
  text: string;
  visual_description: string;
}

export interface ScriptOutput {
  title: string;
  scenes: Scene[];
  music_suggestion: string;
}

// Video generation – POST /v1/video_generation
interface VideoTaskResponse {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
  task_id: string;
}

// Query video task status – GET /v1/query/video_generation?task_id=xxx
interface VideoTaskStatusResponse {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
  // Status: "Queueing" | "Processing" | "Success" | "Fail"
  status: 'Queueing' | 'Processing' | 'Success' | 'Fail';
  // file_id is returned when status === 'Success'
  file_id?: string;
  video_width?: number;
  video_height?: number;
}

// Retrieve file URL – GET /v1/files/retrieve?file_id=xxx
interface FileRetrieveResponse {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
  file: {
    file_id: string;
    filename?: string;
    purpose?: string;
    download_url?: string;
  };
}

// Music generation – POST /v1/music_generation (synchronous, returns hex audio)
interface MusicGenerationResponse {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
  data: {
    audio: string; // hex-encoded audio data
    status: number; // 2 = success
  };
  extra_info?: {
    music_duration?: number;
    bitrate?: number;
    sample_rate?: number;
  };
}

// TTS – POST /v1/t2a_v2 (synchronous, returns hex audio)
interface TTSResponse {
  base_resp: {
    status_code: number;
    status_msg: string;
  };
  data: {
    audio: string; // hex-encoded audio data
    status: number; // 2 = success
  };
  extra_info?: {
    audio_length?: number;
    audio_size?: number;
    bitrate?: number;
    sample_rate?: number;
  };
}

interface TTSRequest {
  model: string;
  text: string;
  voice_setting?: {
    voice_id: string;
  };
  audio_setting?: {
    sample_rate: number;
    bitrate: number;
    format: string;
  };
}

/**
 * Convert a hex-encoded string to an ArrayBuffer.
 * MiniMax audio APIs return audio as hex strings in JSON responses.
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

export class MiniMaxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: MiniMaxConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.minimax.io/v1';
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.baseUrl}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MiniMax API error response:', data);
      throw new Error(`MiniMax API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return data;
  }

  async generateScript(inputText: string): Promise<ScriptOutput> {
    const systemPrompt = `You are a creative video script writer. Transform the given text into a structured JSON format for short-form video production.

Output MUST be valid JSON with this exact structure:
{
  "title": "A compelling title for the video",
  "scenes": [
    {
      "text": "Narration text for this scene (keep it concise, 2-3 sentences max)",
      "visual_description": "Detailed visual description for AI video generation"
    }
  ],
  "music_suggestion": "Description of the music mood/vibe (e.g., 'upbeat electronic', 'calm acoustic', 'dramatic orchestral')"
}

Guidelines:
- Create 3-6 scenes depending on the content length
- Each scene should have a clear visual action
- Visual descriptions should be vivid and specific for AI video generation
- Music suggestion should match the content tone
- Output ONLY valid JSON, no additional text`;

    const userPrompt = `Create a video script from this text:\n\n${inputText}`;

    const response = await this.chatCompletion({
      model: 'MiniMax-Text-01',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    if (!response.choices || response.choices.length === 0) {
      console.error('MiniMax API response:', response);
      throw new Error('MiniMax API returned empty response');
    }

    const content = response.choices[0].message.content;

    // Strip markdown code fences if model returns ```json ... ```
    const jsonContent = content
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    try {
      const parsed = JSON.parse(jsonContent);
      return parsed as ScriptOutput;
    } catch {
      throw new Error(`Failed to parse script JSON: ${content}`);
    }
  }

  /**
   * Generate a video via MiniMax API.
   * Endpoint: POST /v1/video_generation
   * Returns task_id for async polling.
   *
   * Models:
   * - 'T2V-01': Basic text-to-video (short clips ~5s)
   * - 'T2V-01-Director': Supports [camera commands] like [Push in], [Pan left], [Zoom in], etc.
   * - 'MiniMax-Hailuo-02': Higher quality generation
   * - 'MiniMax-Hailuo-2.3': Latest, highest quality
   */
  async generateVideo(
    prompt: string,
    options?: {
      model?: 'T2V-01' | 'T2V-01-Director' | 'MiniMax-Hailuo-02' | 'MiniMax-Hailuo-2.3';
      promptOptimizer?: boolean;
    }
  ): Promise<string> {
    const model = options?.model || 'T2V-01';
    const requestBody: Record<string, unknown> = {
      model,
      prompt,
    };

    // prompt_optimizer helps enhance short prompts into more detailed ones
    if (options?.promptOptimizer !== undefined) {
      requestBody.prompt_optimizer = options.promptOptimizer;
    }

    const response = await fetch(`${this.baseUrl}/video_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MiniMax Video API error response:', data);
      throw new Error(`MiniMax Video API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    const videoData = data as VideoTaskResponse;

    if (videoData.base_resp?.status_code !== 0) {
      throw new Error(`MiniMax Video API error: ${videoData.base_resp?.status_msg}`);
    }

    return videoData.task_id;
  }

  /**
   * Query video task status.
   * Endpoint: GET /v1/query/video_generation?task_id={task_id}
   * FIX: Method is GET, task_id is a query param (not POST body).
   */
  async checkVideoTaskStatus(taskId: string): Promise<VideoTaskStatusResponse> {
    // FIX: GET request with task_id as query string
    const url = `${this.baseUrl}/query/video_generation?task_id=${encodeURIComponent(taskId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('MiniMax Query API error response:', data);
      throw new Error(`MiniMax Query API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    return data as VideoTaskStatusResponse;
  }

  /**
   * Retrieve a file's download URL by file_id.
   * Endpoint: GET /v1/files/retrieve?file_id={file_id}
   */
  async retrieveFile(fileId: string): Promise<string> {
    const url = `${this.baseUrl}/files/retrieve?file_id=${encodeURIComponent(fileId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const data = (await response.json()) as FileRetrieveResponse;

    if (!response.ok || data.base_resp?.status_code !== 0) {
      throw new Error(`MiniMax File Retrieve error: ${data.base_resp?.status_msg}`);
    }

    if (!data.file?.download_url) {
      throw new Error('No download URL in file retrieve response');
    }

    return data.file.download_url;
  }

  /**
   * Generate music via MiniMax API.
   * Endpoint: POST /v1/music_generation
   *
   * IMPORTANT:
   * - Model `music-2.5` supports `prompt` + `lyrics` (TESTED & WORKING)
   * - Model `music-01` requires `refer_voice`/`refer_instrumental` (NOT usable without pre-uploaded audio)
   * - This API is SYNCHRONOUS – returns hex-encoded audio data directly
   * - Returns data.audio as hex string, must decode to ArrayBuffer
   */
  async generateMusic(prompt: string, lyrics?: string): Promise<ArrayBuffer> {
    // Auto-generate a simple lyrics structure if none provided
    const effectiveLyrics = lyrics || `[verse]\n${prompt}\n[chorus]\n${prompt}`;

    const requestBody: Record<string, unknown> = {
      model: 'music-2.5',
      prompt,
      lyrics: effectiveLyrics,
    };

    const response = await fetch(`${this.baseUrl}/music_generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = (await response.json()) as MusicGenerationResponse;

    if (!response.ok) {
      console.error('MiniMax Music API error response:', data);
      throw new Error(`MiniMax Music API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    if (data.base_resp?.status_code !== 0) {
      throw new Error(`MiniMax Music API error: ${data.base_resp?.status_msg}`);
    }

    if (!data.data?.audio) {
      throw new Error('No audio data in music generation response');
    }

    // FIX: Decode hex-encoded audio string to ArrayBuffer
    return hexToArrayBuffer(data.data.audio);
  }

  /**
   * Generate TTS audio via MiniMax T2A v2 API.
   * Endpoint: POST /v1/t2a_v2
   *
   * FIX: Response is JSON with data.audio as hex string, NOT a binary stream.
   * Must parse JSON first, then decode hex to ArrayBuffer.
   */
  async generateTTS(text: string, voiceId: string = 'male-qn-qingse'): Promise<ArrayBuffer> {
    const response = await fetch(`${this.baseUrl}/t2a_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'speech-01-turbo',
        text,
        voice_setting: {
          voice_id: voiceId,
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: 'mp3',
        },
      } as TTSRequest),
    });

    // FIX: Response is JSON, NOT a binary stream
    const data = (await response.json()) as TTSResponse;

    if (!response.ok) {
      console.error('MiniMax TTS API error response:', data);
      throw new Error(`MiniMax TTS API error: ${response.status} - ${JSON.stringify(data)}`);
    }

    if (data.base_resp?.status_code !== 0) {
      throw new Error(`MiniMax TTS API error: ${data.base_resp?.status_msg}`);
    }

    if (!data.data?.audio) {
      throw new Error('No audio data in TTS response');
    }

    // FIX: Decode hex-encoded audio string to ArrayBuffer
    return hexToArrayBuffer(data.data.audio);
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 2000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Poll video generation task until complete.
 * FIX: status field is now "status" (not "task_status"), Success returns file_id.
 * After Success, must retrieve download URL via files/retrieve API.
 */
export async function pollVideoTask(
  client: MiniMaxClient,
  taskId: string,
  maxWaitTime: number = 300000,
  pollInterval: number = 5000
): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const status = await exponentialBackoff(() => client.checkVideoTaskStatus(taskId));

    if (status.status === 'Success') {
      if (!status.file_id) {
        throw new Error('Video generation completed but no file_id returned');
      }
      // FIX: Must call files/retrieve to get the actual download URL
      const downloadUrl = await client.retrieveFile(status.file_id);
      return downloadUrl;
    }

    if (status.status === 'Fail') {
      throw new Error(`Video generation failed: ${status.base_resp.status_msg}`);
    }

    // Still Queueing or Processing – wait and poll again
    await sleep(pollInterval);
  }

  throw new Error('Video generation timed out');
}

let client: MiniMaxClient | null = null;

export function getMiniMaxClient(): MiniMaxClient {
  if (!client) {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      throw new Error(ERROR_MESSAGES.MINIMAX_API_KEY_MISSING);
    }
    client = new MiniMaxClient({ apiKey });
  }
  return client;
}

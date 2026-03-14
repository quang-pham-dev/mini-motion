import { ERROR_MESSAGES } from '@/constants';
import { getMiniMaxClient, pollVideoTask } from '@/lib/minimax';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, waitForCompletion } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_PROMPT }, { status: 400 });
    }

    const client = getMiniMaxClient();
    // FIX: generateVideo now uses correct endpoint: POST /v1/video_generation
    const taskId = await client.generateVideo(prompt);

    if (!waitForCompletion) {
      return NextResponse.json({ taskId, status: 'processing' });
    }

    // FIX: pollVideoTask now uses GET /v1/query/video_generation?task_id=xxx
    // and then retrieves download URL via GET /v1/files/retrieve?file_id=xxx
    const videoUrl = await pollVideoTask(client, taskId);
    return NextResponse.json({ taskId, videoUrl, status: 'completed' });
  } catch (error) {
    console.error('Video generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes(ERROR_MESSAGES.MINIMAX_API_KEY_MISSING)) {
        return NextResponse.json({ error: ERROR_MESSAGES.MISSING_API_KEY }, { status: 500 });
      }
      if (
        error.message.includes('clipboard') ||
        error.message.includes('image') ||
        error.message.includes('does not support image input')
      ) {
        return NextResponse.json(
          {
            error:
              'Image input is not supported. Please use a text-only prompt for video generation.',
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: ERROR_MESSAGES.MISSING_TASK_ID }, { status: 400 });
    }

    const client = getMiniMaxClient();
    // FIX: checkVideoTaskStatus now uses GET with task_id as query param
    const status = await client.checkVideoTaskStatus(taskId);

    // FIX: response field is "status" (not "task_status"), and returns file_id not video_url
    let videoUrl: string | null = null;
    if (status.status === 'Success' && status.file_id) {
      try {
        videoUrl = await client.retrieveFile(status.file_id);
      } catch (e) {
        console.error('Failed to retrieve file URL:', e);
      }
    }

    return NextResponse.json({
      taskId,
      taskStatus: status.status,
      fileId: status.file_id || null,
      videoUrl,
    });
  } catch (error) {
    console.error('Video status error:', error);
    return NextResponse.json({ error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}

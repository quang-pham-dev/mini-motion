# API Reference

Complete REST API reference for Mini Motion.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All endpoints require authentication via Supabase. Include Supabase JWT token in the request:

```http
Authorization: Bearer <supabase_jwt_token>
```

## Endpoints

### Generate Script

Generate a video script from a text prompt.

```http
POST /api/generate-script
```

**Request Body:**

```json
{
  "prompt": "Create a video about ocean conservation"
}
```

**Response (200):**

```json
{
  "script": {
    "title": "Ocean Conservation",
    "scenes": [
      {
        "text": "The ocean covers 71% of our planet...",
        "visual_description": "Beautiful underwater coral reef with colorful fish"
      }
    ],
    "music_suggestion": "calm ambient"
  }
}
```

**Error Response (400):**

```json
{
  "error": "Prompt is required"
}
```

---

### Generate Video

Start video generation for a scene.

```http
POST /api/generate-video
```

**Request Body:**

```json
{
  "prompt": "Beautiful underwater coral reef with colorful fish"
}
```

**Response (200):**

```json
{
  "taskId": "task_abc123"
}
```

**Error Response (500):**

```json
{
  "error": "Failed to start video generation"
}
```

---

### Poll Video Status

Poll for video generation task status.

```http
GET /api/generate-video?taskId=task_abc123
```

**Response (200):**

```json
{
  "taskStatus": "Processing"
}
```

**Possible Status Values:**

| Status       | Description           |
| ------------ | --------------------- |
| `Pending`    | Task queued           |
| `Processing` | Video being generated |
| `Success`    | Video ready           |
| `Fail`       | Generation failed     |

**Success Response:**

```json
{
  "taskStatus": "Success",
  "videoUrl": "https://..."
}
```

---

### Generate Music

Generate background music.

```http
POST /api/generate-music
```

**Request Body:**

```json
{
  "prompt": "calm ambient music for nature video"
}
```

**Response (200):**

```json
{
  "url": "https://cdn.supabase.co/storage/..."
}
```

---

### Generate TTS

Generate text-to-speech voiceover.

```http
POST /api/generate-tts
```

**Request Body:**

```json
{
  "text": "The ocean covers 71% of our planet..."
}
```

**Response (200):**

```json
{
  "url": "https://cdn.supabase.co/storage/..."
}
```

---

### List Projects

Get all projects for authenticated user.

```http
GET /api/projects
```

**Response (200):**

```json
{
  "projects": [
    {
      "id": "proj_abc123",
      "title": "Ocean Video",
      "status": "draft",
      "created_at": "2026-03-14T10:00:00Z",
      "music_vibe": "calm",
      "music_url": null,
      "scenes": []
    }
  ]
}
```

---

### Create Project

Create a new project.

```http
POST /api/projects
```

**Request Body:**

```json
{
  "title": "My Video Project",
  "music_vibe": "upbeat"
}
```

**Response (201):**

```json
{
  "project": {
    "id": "proj_abc123",
    "title": "My Video Project",
    "status": "draft",
    "created_at": "2026-03-14T10:00:00Z",
    "music_vibe": "upbeat",
    "music_url": null,
    "scenes": []
  }
}
```

---

### Get Project

Get a specific project with scenes.

```http
GET /api/projects/:id
```

**Response (200):**

```json
{
  "project": {
    "id": "proj_abc123",
    "title": "Ocean Video",
    "status": "draft",
    "created_at": "2026-03-14T10:00:00Z",
    "music_vibe": "calm",
    "music_url": "https://...",
    "scenes": [
      {
        "id": "scene_001",
        "scene_number": 1,
        "script_text": "The ocean covers 71%...",
        "visual_prompt": "underwater coral reef",
        "video_task_id": null,
        "video_url": null,
        "audio_url": null,
        "video_status": "idle",
        "audio_status": "idle"
      }
    ]
  }
}
```

---

### Update Project

Update project metadata.

```http
PATCH /api/projects/:id
```

**Request Body:**

```json
{
  "title": "Updated Title",
  "music_url": "https://...",
  "status": "completed"
}
```

**Response (200):**

```json
{
  "project": {
    "id": "proj_abc123",
    "title": "Updated Title",
    ...
  }
}
```

---

### Delete Project

Delete a project and all its scenes.

```http
DELETE /api/projects/:id
```

**Response (204):** No content

---

### Create Scenes

Create scenes for a project.

```http
POST /api/projects/:id/scenes
```

**Request Body:**

```json
{
  "scenes": [
    {
      "script_text": "Scene 1 text",
      "visual_prompt": "Scene 1 visual"
    },
    {
      "script_text": "Scene 2 text",
      "visual_prompt": "Scene 2 visual"
    }
  ]
}
```

**Response (201):**

```json
{
  "scenes": [
    {
      "id": "scene_001",
      "scene_number": 1,
      ...
    }
  ]
}
```

---

### Update Scene

Update a specific scene.

```http
PATCH /api/projects/:id/scenes/:sceneId
```

**Request Body:**

```json
{
  "video_url": "https://...",
  "video_status": "completed",
  "video_task_id": "task_abc123"
}
```

**Response (200):**

```json
{
  "scene": {
    "id": "scene_001",
    ...
  }
}
```

## Error Codes

| Code | Description                            |
| ---- | -------------------------------------- |
| 400  | Bad Request - Invalid input            |
| 401  | Unauthorized - Invalid or missing auth |
| 404  | Not Found - Resource doesn't exist     |
| 500  | Internal Server Error                  |

## Rate Limiting

API endpoints are subject to rate limiting. If you receive a 429 response, wait before retrying.

## SDK Usage

Instead of calling APIs directly, use the services layer:

```typescript
import { useGetProject, useUpdateProject } from '@/services/projects';
import { useGenerateVideo } from '@/services/generators';

// Query
const { data } = useGetProject('proj_abc123');

// Mutation
const mutation = useGenerateVideo();
await mutation.mutateAsync({ prompt: '...' });
```

See [Services Documentation](SERVICES.md) for details.

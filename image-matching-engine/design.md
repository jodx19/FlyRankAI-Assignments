# AI Image Matching Engine - Phase 1 Design

## Problem Statement
The goal is to build a system that understands images in a library, tags them, and correctly matches them to corresponding blog posts based on semantic meaning rather than exact keywords. Critically, the system must include a "mismatch guard" to avoid incorrect matches, safely rejecting them and explaining why, rather than guessing.

## Data Model
We will use a relational database (SQLite) with the following core entities:
- **Images**: `id`, `filename`, `url`, `subject`, `category`, `caption`, `confidence`, `embedding` (JSON array representing the vector)
- **Tags**: `id`, `image_id`, `attribute` (normalized table of descriptive attributes)
- **Posts**: `id`, `title`, `content`, `embedding` (JSON array representing the vector)
- **Suggestions**: `id`, `post_id`, `image_id`, `score`, `status` (pending, approved, rejected), `reason`

## API Surface (Review API)
- `GET /posts/:id/images`: Returns ranked image suggestions for a specific post, applying the mismatch guard to include explanations for rejections.
- `POST /suggestions/:id/approve`: Approves a suggested image pairing.
- `POST /suggestions/:id/reject`: Rejects a suggested image pairing.

## Layer Sketch
1. **Ingestion & Classification Layer**: A batch job that reads images, calls the Vision API (Gemini Flash) to extract structured tags/captions, and generates embeddings for the images.
2. **Matching Engine Layer**: Calculates similarity between post embeddings and image embeddings.
3. **Mismatch Guard Layer**: Evaluates similarity scores and category tags against predefined thresholds. Explicitly rejects pairings that fail validation.
4. **API Layer**: Serves suggestions to human reviewers and handles approval/rejection workflows.

## Explicit Non-Goal
This system will **not** build a frontend UI. The review interface will be handled entirely via backend API endpoints. We are also **not** building a general-purpose image search engine, but a specialized post-to-image matching tool with strict rejection capabilities.

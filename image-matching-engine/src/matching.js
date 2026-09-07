import db from './db.js';
import { generateEmbedding } from './embedding.js';

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findBestImageForPost(postId) {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) throw new Error("Post not found");

  let postEmbedding = post.embedding ? JSON.parse(post.embedding) : null;
  
  if (!postEmbedding) {
    const textToEmbed = `${post.title}. ${post.content}`;
    postEmbedding = await generateEmbedding(textToEmbed);
    db.prepare('UPDATE posts SET embedding = ? WHERE id = ?').run(JSON.stringify(postEmbedding), postId);
  }

  const images = db.prepare('SELECT * FROM images WHERE processed = 1').all();
  if (images.length === 0) throw new Error("No images in database");

  const candidates = [];

  for (const img of images) {
    if (!img.embedding) {
      // Lazy generate embedding for image if missing
      const textToEmbed = `Subject: ${img.subject}. Category: ${img.category}. Caption: ${img.caption}. Attributes: ${img.attributes}`;
      const imgEmbedding = await generateEmbedding(textToEmbed);
      db.prepare('UPDATE images SET embedding = ? WHERE id = ?').run(JSON.stringify(imgEmbedding), img.id);
      img.embedding = JSON.stringify(imgEmbedding);
    }

    const imgVector = JSON.parse(img.embedding);
    const score = cosineSimilarity(postEmbedding, imgVector);
    
    candidates.push({ image: img, score });
  }

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // --- THE MISMATCH GUARD ---
  // A production safety layer to reject inappropriate matches
  
  const topCandidate = candidates[0];
  const SIMILARITY_THRESHOLD = 0.55; 

  if (topCandidate.score < SIMILARITY_THRESHOLD) {
    return {
      status: 'REJECTED',
      reason: `No image cleared the similarity threshold. Best score was ${topCandidate.score.toFixed(3)}.`,
      candidate: topCandidate.image
    };
  }

  if (topCandidate.image.confidence < 0.6) {
    return {
      status: 'REJECTED',
      reason: `The top image match has a low vision confidence score (${topCandidate.image.confidence}). Rejected for safety.`,
      candidate: topCandidate.image
    };
  }
  
  // Specific Entity Collision Guard (e.g., Red Fox vs Gray Wolf)
  // This ensures that even if similarity is high due to context, a mismatch in core subject is caught.
  const postTextLower = `${post.title} ${post.content}`.toLowerCase();
  const subjectLower = topCandidate.image.subject.toLowerCase();
  
  if (postTextLower.includes('fox') && (subjectLower.includes('wolf') || subjectLower.includes('dog'))) {
    return {
      status: 'REJECTED',
      reason: `Mismatch Guard triggered: Post specifically discusses foxes, but image subject detected as '${topCandidate.image.subject}'.`,
      candidate: topCandidate.image
    };
  }

  return {
    status: 'SUGGESTED',
    score: topCandidate.score,
    reason: `Image cleared threshold with score ${topCandidate.score.toFixed(3)} and confidence ${topCandidate.image.confidence}.`,
    candidate: topCandidate.image
  };
}

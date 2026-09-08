import { prisma } from '../db';

// Simple types matching the Prisma Post and Variant models
interface Post {
  id: string;
  content: string;
  sourceUrl: string | null;
  createdAt: Date;
}

interface Variant {
  id: string;
  postId: string;
  platform: string;
  content: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConstraintProfile {
  maxLength: number;
  hashtagsMax: number;
  tone: string;
}

const profiles: Record<string, ConstraintProfile> = {
  x: { maxLength: 280, hashtagsMax: 2, tone: 'concise and punchy' },
  linkedin: { maxLength: 3000, hashtagsMax: 5, tone: 'professional and insightful' },
  telegram: { maxLength: 4096, hashtagsMax: 3, tone: 'conversational and direct' },
};

function enforceConstraints(platform: string, text: string): void {
  const profile = profiles[platform];
  if (!profile) throw new Error(`Unknown platform: ${platform}`);

  if (text.length > profile.maxLength) {
    throw new Error(`[Constraint Violation] Platform '${platform}' max length is ${profile.maxLength}, got ${text.length}`);
  }

  const hashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).length;
  if (hashtags > profile.hashtagsMax) {
    throw new Error(`[Constraint Violation] Platform '${platform}' max hashtags is ${profile.hashtagsMax}, got ${hashtags}`);
  }
}

// Simple template-based generator since AI is optional
function applyTemplate(post: Post, platform: string, profile: ConstraintProfile): string {
  let content = post.content.substring(0, profile.maxLength - 50); // reserve space for link/tags
  
  // Truncate to first paragraph for simple variation
  const firstPara = content.split('\n')[0];
  
  if (platform === 'x') {
    return `${firstPara.substring(0, 200)}\n\nRead more: ${post.sourceUrl || 'link'} #news #update`;
  }
  if (platform === 'linkedin') {
    return `Excited to share our latest thoughts!\n\n${content}\n\nCheck out the full article here: ${post.sourceUrl || 'link'}\n#Professional #Update`;
  }
  if (platform === 'telegram') {
    return `🚨 **New Update** 🚨\n\n${firstPara}\n\n👉 ${post.sourceUrl || 'link'}\n#Alert`;
  }
  
  return content;
}

export async function generateVariants(post: Post): Promise<Variant[]> {
  const createdVariants: Variant[] = [];
  
  for (const platform of Object.keys(profiles)) {
    const profile = profiles[platform];
    const generatedText = applyTemplate(post, platform, profile);
    
    // Validate against constraints
    enforceConstraints(platform, generatedText);
    
    const variant = await prisma.variant.create({
      data: {
        postId: post.id,
        platform,
        content: generatedText,
        status: 'draft',
      }
    });
    createdVariants.push(variant);
  }
  
  return createdVariants;
}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/db.js';
import { analyzeImage } from '../src/vision.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'data', 'images');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(imagesDir)) {
    console.log(`Images directory not found at ${imagesDir}. Please add images.`);
    return;
  }

  const files = fs.readdirSync(imagesDir).filter(file => 
    file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png')
  );

  console.log(`Found ${files.length} images to process.`);

  const insertImage = db.prepare(`
    INSERT INTO images (filename, subject, category, caption, confidence, attributes, processed)
    VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(filename) DO UPDATE SET
      subject=excluded.subject,
      category=excluded.category,
      caption=excluded.caption,
      confidence=excluded.confidence,
      attributes=excluded.attributes,
      processed=1
  `);

  let totalCost = 0; // Rough tracking

  for (const file of files) {
    const row = db.prepare('SELECT processed FROM images WHERE filename = ?').get(file);
    if (row && row.processed === 1) {
      console.log(`Skipping ${file}, already processed.`);
      continue;
    }

    console.log(`Processing ${file}...`);
    const filePath = path.join(imagesDir, file);
    const mimeType = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    
    let retries = 3;
    while (retries > 0) {
      try {
        const metadata = await analyzeImage(filePath, mimeType);
        
        // Mismatch Guard Pre-check: Reject low confidence classifications
        if (metadata.confidence < 0.6) {
          console.warn(`[WARNING] Low confidence (${metadata.confidence}) for ${file}. Flagging...`);
          metadata.subject = "UNKNOWN";
        }

        insertImage.run(
          file, 
          metadata.subject, 
          metadata.category, 
          metadata.caption, 
          metadata.confidence,
          JSON.stringify(metadata.attributes)
        );

        console.log(`  -> Analyzed as: ${metadata.subject} (Conf: ${metadata.confidence})`);
        
        // Rough estimate for Gemini Flash Vision request (~260 tokens per image)
        totalCost += 0.00001; // Free tier used, but logging simulated cost
        break; 
      } catch (err) {
        console.error(`  -> Error on ${file}: ${err.message}`);
        retries--;
        if (retries === 0) {
          console.error(`  -> Failed after 3 retries.`);
        } else {
          console.log(`  -> Retrying in 2 seconds...`);
          await sleep(2000);
        }
      }
    }
  }
  console.log(`Ingestion complete. Estimated API cost: $${totalCost.toFixed(5)}`);
}

run().catch(console.error);

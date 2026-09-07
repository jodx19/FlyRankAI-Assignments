import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const imagesDir = path.join(__dirname, '..', 'data', 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 10 Sample images to get started (Red Fox, Gray Wolf, Dog, Bear, Deer)
const sampleImages = [
  { name: 'red_fox_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/1/16/Fox_-_British_Wildlife_Centre_%2817429406962%29.jpg' },
  { name: 'gray_wolf_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Canis_lupus_265b.jpg' },
  { name: 'golden_retriever_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Golden_Retriever_standing_Hund_Dog.jpg' },
  { name: 'brown_bear_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/2010-kodiak-bear-1.jpg' },
  { name: 'deer_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/White-tailed_deer.jpg' },
  { name: 'red_fox_2.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Fox_study_6.jpg' },
  { name: 'gray_wolf_2.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Canis_lupus_signatus.jpg' },
  { name: 'german_shepherd_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/German_Shepherd_-_Hund_portrait.jpg' },
  { name: 'black_bear_1.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/01_Schwarzbär.jpg' },
  { name: 'deer_2.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Fallow_deer_in_a_field.jpg' }
];

console.log('Downloading sample images...');

let downloaded = 0;

for (const img of sampleImages) {
  const filePath = path.join(imagesDir, img.name);
  if (fs.existsSync(filePath)) {
    console.log(`Skipping ${img.name}, already exists.`);
    downloaded++;
    continue;
  }
  
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };

  https.get(img.url, options, (res) => {
    if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Simple redirect follow
        https.get(res.headers.location, options, (res2) => {
            res2.pipe(fs.createWriteStream(filePath));
            console.log(`Downloaded ${img.name}`);
        });
      } else {
        res.pipe(fs.createWriteStream(filePath));
        console.log(`Downloaded ${img.name}`);
      }
    } else {
      console.log(`Failed to download ${img.name}: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading ${img.name}: ${err.message}`);
  });
}

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function optimizeImage(folder, filename, width, isPng = false) {
  const input = path.join(folder, filename);
  const output = path.join(folder, `TEMP_${filename}`);
  console.log(`Optimizing: ${filename}`);
  
  if (!fs.existsSync(input)) {
    console.log(`Skipping: ${filename} does not exist.`);
    return;
  }
  
  try {
    let pipeline = sharp(input).resize({ width, withoutEnlargement: true });
    
    if (isPng) {
      pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
    }
    
    await pipeline.toFile(output);
    
    const oldSize = fs.statSync(input).size;
    const newSize = fs.statSync(output).size;
    
    fs.unlinkSync(input);
    fs.renameSync(output, input);
    
    console.log(`✅ ${filename} compressed: ${(oldSize/1024/1024).toFixed(2)}MB -> ${(newSize/1024/1024).toFixed(2)}MB`);
  } catch (err) {
    console.error(`❌ Failed on ${filename}`, err);
  }
}

async function run() {
  await optimizeImage('public/gallery', 'osomoy.jpg', 1200);
  await optimizeImage('public/gallery', 'arifin.jpg', 800);
  await optimizeImage('public/gallery', 'bachelor point.jpg', 1000);
  await optimizeImage('public', 'hero.png', 1600, true);
}

run();

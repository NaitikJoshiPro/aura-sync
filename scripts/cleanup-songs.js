const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '../public/songs');

function cleanup() {
  if (!fs.existsSync(songsDir)) {
    console.error(`Directory not found: ${songsDir}`);
    return;
  }

  const files = fs.readdirSync(songsDir);

  files.forEach(file => {
    if (file.includes('_spotdown.org')) {
      const oldPath = path.join(songsDir, file);
      const newName = file.replace('_spotdown.org', '');
      const newPath = path.join(songsDir, newName);

      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: "${file}" -> "${newName}"`);
    }
  });

  console.log('Cleanup complete.');
}

cleanup();

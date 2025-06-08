const https = require('https');
const fs = require('fs');
const path = require('path');

const pieces = [
  'wK', 'wQ', 'wR', 'wB', 'wN', 'wP',
  'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'
];

const baseUrl = 'https://lichess1.org/assets/piece/cburnett/';
const outputDir = './public/chess-pieces';

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

pieces.forEach(piece => {
  const url = `${baseUrl}${piece}.svg`;
  const filePath = path.join(outputDir, `${piece}.svg`);
  
  const file = fs.createWriteStream(filePath);
  
  https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${piece}.svg`);
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${piece}.svg:`, err);
  });
});
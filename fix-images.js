const fs = require('fs');
const path = require('path');

const filesToFix = [
  'frontend/src/pages/category/[categoryName]/app.js',
  'frontend/src/pages/catalog.js',
  'frontend/src/components/TopRatedProducts.js',
  'frontend/src/components/SearchResults.js',
  'frontend/src/components/RecommendedProducts.js',
  'frontend/src/components/new-arrival.js',
  'frontend/src/components/New-Arrival-comp.js',
  'frontend/src/components/FeaturedProducts.js',
  'frontend/src/components/category.js',
  'frontend/src/pages/[productName]/index.js'
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace objectFit: 'cover' -> objectFit: 'contain'
    content = content.replace(/objectFit:\s*['"]cover['"]/g, "objectFit: 'contain'");
    // Replace object-fit: cover -> object-fit: contain
    content = content.replace(/object-fit:\s*cover/g, "object-fit: contain");
    
    fs.writeFileSync(fullPath, content);
    console.log('Fixed', relPath);
  } else {
    console.log('File not found', relPath);
  }
});

const fs = require('fs');
const path = require('path');

function imageToBase64(imagePath) {
    try {
        const imageBuffer = fs.readFileSync(imagePath);
        const base64String = imageBuffer.toString('base64');
        return base64String;
    } catch (error) {
        console.error(`Error converting ${imagePath}:`, error.message);
        return null;
    }
}

function main() {
    const imagesDir = path.join(__dirname, 'shree_public', 'images');
    const outputFile = 'base64_images.txt';
    
    try {
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));
        
        let output = 'Base64 encoded images for HTML:\n\n';
        
        imageFiles.forEach((imageFile, index) => {
            const imagePath = path.join(imagesDir, imageFile);
            console.log(`Converting ${imageFile}...`);
            
            const base64String = imageToBase64(imagePath);
            if (base64String) {
                output += `<!-- ${imageFile} -->\n`;
                output += `<img src="data:image/jpeg;base64,${base64String}" alt="Shree Agrawal Yaatri Grah - Room ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px;">\n\n`;
                console.log(`✓ ${imageFile} converted successfully`);
            } else {
                console.log(`✗ Failed to convert ${imageFile}`);
            }
        });
        
        fs.writeFileSync(outputFile, output);
        console.log(`\nBase64 conversion completed! Check ${outputFile}`);
        
        // Also create a simple HTML snippet
        const htmlSnippet = createHTMLSnippet(imageFiles, imagesDir);
        fs.writeFileSync('gallery_snippet.html', htmlSnippet);
        console.log('Gallery HTML snippet created: gallery_snippet.html');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function createHTMLSnippet(imageFiles, imagesDir) {
    let html = '<div class="gallery-grid">\n';
    
    imageFiles.forEach((imageFile, index) => {
        const imagePath = path.join(imagesDir, imageFile);
        const base64String = imageToBase64(imagePath);
        
        if (base64String) {
            html += `    <div class="gallery-item">\n`;
            html += `        <img src="data:image/jpeg;base64,${base64String}" alt="Shree Agrawal Yaatri Grah - Room ${index + 1}" style="max-width: 100%; height: auto; border-radius: 8px;" loading="lazy">\n`;
            html += `    </div>\n`;
        }
    });
    
    html += '</div>';
    return html;
}

main(); 
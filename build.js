import fs from 'fs';
import uglifyJs from 'uglify-js';

// Replace 'input.js' with the path to your JavaScript file
const inputFile = 'script.js';
// Replace 'bookmarklet.js' with the desired output file name
const outputFile = 'script.min.js';

fs.readFile(inputFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }

    try {
        // Minify the JavaScript code
        const minified = uglifyJs.minify(data).code;

        // Create the bookmarklet
        const bookmarklet = `javascript:${minified}`;

        // Write the bookmarklet to a new file
        fs.writeFile(outputFile, bookmarklet, (err) => {
            if (err) {
                console.error('Error writing the file:', err);
            } else {
                console.log(`Bookmarklet saved to ${outputFile}`);
            }
        });
    } catch (error) {
        console.error('Error minifying the JavaScript:', error);
    }
});

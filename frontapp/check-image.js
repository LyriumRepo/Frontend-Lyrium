const fs = require('fs');
const path = require('path');

try {
    const PNG = require('pngjs').PNG;
    const imgPath = 'c:/Users/danmar/Desktop/Frontend-Lyrium/frontapp/public/img/precios_digestion_saludable/3.png';
    const data = fs.readFileSync(imgPath);
    const png = PNG.sync.read(data);
    console.log('Width:', png.width, 'Height:', png.height);
    
    // Check pixel at (0, 0)
    const idx0 = (png.width * 0 + 0) << 2;
    const r0 = png.data[idx0];
    const g0 = png.data[idx0 + 1];
    const b0 = png.data[idx0 + 2];
    const a0 = png.data[idx0 + 3];
    console.log('Pixel at (0,0):', { r: r0, g: g0, b: b0, a: a0 });

    // Check pixel at (w/2, 0)
    const midX = Math.floor(png.width / 2);
    const idxMid = (png.width * 0 + midX) << 2;
    const rM = png.data[idxMid];
    const gM = png.data[idxMid + 1];
    const bM = png.data[idxMid + 2];
    const aM = png.data[idxMid + 3];
    console.log('Pixel at (mid,0):', { r: rM, g: gM, b: bM, a: aM });
} catch (e) {
    console.log('Error or pngjs not installed:', e.message);
}

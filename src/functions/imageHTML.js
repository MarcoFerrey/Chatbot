// function/ImageHTML.js
import puppeteer from 'puppeteer';

/**
 * Recibe un HTML completo y escribe un PNG en outputPath.
 */
export async function generarImagen(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1100, height: 600, deviceScaleFactor: 2 });
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('screen');

    // Cambiamos a JPEG con calidad 80 para aligerar peso
    await page.screenshot({
      path: outputPath,
      fullPage: true
    })
  } finally {
    await browser.close();
  }
}

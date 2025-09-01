// Erzeugt assets/Laurin_Huebner_CV.pdf aus index.html per Headless-Chrome
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const outDir = path.resolve("assets");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const fileUrl = "file://" + path.resolve("index.html");
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--allow-file-access-from-files",
      "--disable-web-security"
    ],
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 } // nah an A4
  });

  try {
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 120000 });

    // Kleines Helferlein: entferne Header-Buttons für PDF (wir nutzen Print-Styles ohnehin,
    // aber falls html2pdf.js/Buttons mal sichtbar sind, verstecken wir sie hart).
    await page.addStyleTag({ content: `
      .actions, #themeToggle, #pdfAuto { display: none !important; }
    `});

    const outPath = path.join(outDir, "Laurin_Huebner_CV.pdf");
    await page.pdf({
      path: outPath,
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" }
    });

    console.log("PDF geschrieben:", outPath);
  } finally {
    await browser.close();
  }
})();

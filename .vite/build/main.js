"use strict";
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
function handleSquirrelEvent() {
  if (process.argv.length === 1) return false;
  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated": {
      const exePath = process.execPath.replace(/\\/g, "\\\\");
      const command = `"${exePath}" "%1"`;
      const regCommands = [
        `REG ADD "HKCU\\Software\\Classes\\.pdf\\OpenWithProgids" /v "Bind.pdf" /t REG_SZ /d "" /f`,
        `REG ADD "HKCU\\Software\\Classes\\Bind.pdf" /ve /t REG_SZ /d "PDF Document - Bind" /f`,
        `REG ADD "HKCU\\Software\\Classes\\Bind.pdf\\shell\\open\\command" /ve /t REG_SZ /d "${command}" /f`
      ].join(" && ");
      exec(regCommands);
      app.quit();
      return true;
    }
    case "--squirrel-uninstall": {
      exec([
        `REG DELETE "HKCU\\Software\\Classes\\.pdf\\OpenWithProgids" /v "Bind.pdf" /f`,
        `REG DELETE "HKCU\\Software\\Classes\\Bind.pdf" /f`
      ].join(" && "));
      app.quit();
      return true;
    }
    case "--squirrel-obsolete":
      app.quit();
      return true;
  }
  return false;
}
if (handleSquirrelEvent()) {
  app.quit();
}
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#09090b",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  {
    mainWindow.loadURL("http://localhost:5173");
  }
  const pdfArg = process.argv.find((arg) => arg.toLowerCase().endsWith(".pdf"));
  if (pdfArg && fs.existsSync(pdfArg)) {
    mainWindow.webContents.once("did-finish-load", () => {
      mainWindow.webContents.send("file-opened", pdfArg);
    });
  }
}
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, argv) => {
    const pdfArg = argv.find((arg) => arg.toLowerCase().endsWith(".pdf"));
    if (pdfArg && fs.existsSync(pdfArg) && mainWindow) {
      mainWindow.webContents.send("file-opened", pdfArg);
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
ipcMain.on("window:minimize", () => {
  mainWindow == null ? void 0 : mainWindow.minimize();
});
ipcMain.on("window:maximize", () => {
  if (mainWindow == null ? void 0 : mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow == null ? void 0 : mainWindow.maximize();
  }
});
ipcMain.on("window:close", () => {
  mainWindow == null ? void 0 : mainWindow.close();
});
ipcMain.handle("window:is-maximized", () => {
  return (mainWindow == null ? void 0 : mainWindow.isMaximized()) ?? false;
});
ipcMain.handle("dialog:open-file", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    title: "Open PDF",
    filters: [{ name: "PDF Files", extensions: ["pdf"] }],
    properties: ["openFile", "multiSelections"]
  });
  if (canceled || filePaths.length === 0) return null;
  return filePaths;
});
ipcMain.handle("dialog:save-file", async (_event, options = {}) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    title: "Save PDF",
    defaultPath: options.defaultName || "output.pdf",
    filters: [{ name: "PDF Files", extensions: ["pdf"] }]
  });
  if (canceled || !filePath) return null;
  return filePath;
});
let PDFDocument = null;
async function getPDFDocument() {
  if (!PDFDocument) {
    const pdfLib = await Promise.resolve().then(() => require("./index-CpCgh7Sw.js"));
    PDFDocument = pdfLib.PDFDocument;
  }
  return PDFDocument;
}
ipcMain.handle("pdf:open-file", async (_event, filePath) => {
  var _a, _b;
  try {
    const PDFDoc = await getPDFDocument();
    const bytes = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDoc.load(bytes, { ignoreEncryption: true });
    const pages = pdfDoc.getPages().map((page, index) => {
      const { width, height } = page.getSize();
      return { index, width, height };
    });
    return {
      success: true,
      filePath,
      fileName: path.basename(filePath),
      pageCount: pdfDoc.getPageCount(),
      metadata: {
        title: pdfDoc.getTitle() || null,
        author: pdfDoc.getAuthor() || null,
        subject: pdfDoc.getSubject() || null,
        creator: pdfDoc.getCreator() || null,
        producer: pdfDoc.getProducer() || null,
        creationDate: ((_a = pdfDoc.getCreationDate()) == null ? void 0 : _a.toISOString()) || null,
        modificationDate: ((_b = pdfDoc.getModificationDate()) == null ? void 0 : _b.toISOString()) || null
      },
      pages
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
ipcMain.handle("pdf:delete-pages", async (_event, { filePath, pageIndices, savePath }) => {
  try {
    const PDFDoc = await getPDFDocument();
    const bytes = await fs.promises.readFile(filePath);
    const pdfDoc = await PDFDoc.load(bytes);
    const sorted = [...pageIndices].sort((a, b) => b - a);
    for (const idx of sorted) {
      if (idx >= 0 && idx < pdfDoc.getPageCount()) {
        pdfDoc.removePage(idx);
      }
    }
    const outputPath = savePath || filePath;
    const savedBytes = await pdfDoc.save();
    await fs.promises.writeFile(outputPath, savedBytes);
    return {
      success: true,
      newPageCount: pdfDoc.getPageCount(),
      savedTo: outputPath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});
ipcMain.handle("pdf:merge", async (_event, { filePaths, savePath }) => {
  try {
    const PDFDoc = await getPDFDocument();
    const mergedPdf = await PDFDoc.create();
    for (const fp of filePaths) {
      const bytes = await fs.promises.readFile(fp);
      const donorPdf = await PDFDoc.load(bytes);
      const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }
    const savedBytes = await mergedPdf.save();
    await fs.promises.writeFile(savePath, savedBytes);
    return {
      success: true,
      pageCount: mergedPdf.getPageCount(),
      savedTo: savePath
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
});

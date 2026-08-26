"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // ─── PDF Operations ─────────────────────────────────────────────────────
  openPdf: (filePath) => ipcRenderer.invoke("pdf:open-file", filePath),
  deletePages: (opts) => ipcRenderer.invoke("pdf:delete-pages", opts),
  mergePdfs: (opts) => ipcRenderer.invoke("pdf:merge", opts),
  // ─── File Dialogs ───────────────────────────────────────────────────────
  openFileDialog: () => ipcRenderer.invoke("dialog:open-file"),
  saveFileDialog: (opts) => ipcRenderer.invoke("dialog:save-file", opts),
  // ─── Window Controls (custom titlebar) ──────────────────────────────────
  minimizeWindow: () => ipcRenderer.send("window:minimize"),
  maximizeWindow: () => ipcRenderer.send("window:maximize"),
  closeWindow: () => ipcRenderer.send("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:is-maximized"),
  // ─── Listeners (main → renderer) ───────────────────────────────────────
  onFileOpened: (callback) => {
    const handler = (_event, filePath) => callback(filePath);
    ipcRenderer.on("file-opened", handler);
    return () => ipcRenderer.removeListener("file-opened", handler);
  }
});

// Preload bridge: exposes a tiny, synchronous file-storage API to the renderer.
// The renderer has no Node access (contextIsolation on, nodeIntegration off),
// so all disk I/O goes through the main process over IPC.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("mdflowStore", {
  // User accounts (single users.txt file).
  readUsers: () => ipcRenderer.sendSync("store:readUsers"),
  writeUsers: (data) => ipcRenderer.sendSync("store:writeUsers", data),

  // Notes: read aggregates every per-user file; write splits the full list
  // back into one notes_<userId>.txt file per user.
  readAllNotes: () => ipcRenderer.sendSync("store:readAllNotes"),
  writeAllNotes: (data) => ipcRenderer.sendSync("store:writeAllNotes", data),
});

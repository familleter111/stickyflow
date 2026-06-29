const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Packaged build => production; running from source => dev.
const isDev = !app.isPackaged;

// Keep all app data (incl. localStorage) under a stable per-app folder so
// notes persist across launches and updates.
app.setName("MDFlow");

let mainWindow = null;

/* ------------------------------------------------------------------ *
 * File storage: notes & users are persisted as plain .txt files under
 * <userData>/data. There is one notes_<userId>.txt file per user, plus
 * a single users.txt holding the account list.
 * ------------------------------------------------------------------ */

// Computed lazily so it picks up the app name set above.
function dataDir() {
  const dir = path.join(app.getPath("userData"), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const usersFile = () => path.join(dataDir(), "users.txt");

// Keep filenames safe regardless of the id format.
function notesFile(userId) {
  const safe = String(userId).replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(dataDir(), `notes_${safe}.txt`);
}

function listNoteFiles() {
  return fs
    .readdirSync(dataDir())
    .filter((f) => f.startsWith("notes_") && f.endsWith(".txt"));
}

function registerStorageIpc() {
  ipcMain.on("store:readUsers", (e) => {
    try {
      e.returnValue = fs.readFileSync(usersFile(), "utf-8");
    } catch {
      e.returnValue = null; // no file yet -> let the app seed defaults
    }
  });

  ipcMain.on("store:writeUsers", (e, data) => {
    try {
      fs.writeFileSync(usersFile(), data, "utf-8");
    } catch {
      /* ignore write errors */
    }
    e.returnValue = true;
  });

  ipcMain.on("store:readAllNotes", (e) => {
    try {
      const files = listNoteFiles();
      if (files.length === 0) {
        e.returnValue = null; // nothing stored yet -> let the app seed demos
        return;
      }
      const all = [];
      for (const f of files) {
        try {
          const parsed = JSON.parse(
            fs.readFileSync(path.join(dataDir(), f), "utf-8"),
          );
          if (Array.isArray(parsed)) all.push(...parsed);
        } catch {
          /* skip a corrupt file rather than failing the whole load */
        }
      }
      e.returnValue = JSON.stringify(all);
    } catch {
      e.returnValue = null;
    }
  });

  ipcMain.on("store:writeAllNotes", (e, data) => {
    try {
      let notes = [];
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) notes = parsed;
      } catch {
        /* ignore bad payload */
      }

      // Group every note under its owner.
      const groups = new Map();
      for (const n of notes) {
        const owner = n && n.userId ? n.userId : "_unknown";
        if (!groups.has(owner)) groups.set(owner, []);
        groups.get(owner).push(n);
      }

      // Write one readable .txt file per user.
      const keep = new Set();
      for (const [owner, arr] of groups) {
        const file = notesFile(owner);
        keep.add(path.basename(file));
        fs.writeFileSync(file, JSON.stringify(arr, null, 2), "utf-8");
      }

      // Drop files for users who no longer have any notes.
      for (const f of listNoteFiles()) {
        if (!keep.has(f)) {
          try {
            fs.unlinkSync(path.join(dataDir(), f));
          } catch {
            /* ignore */
          }
        }
      }
    } catch {
      /* ignore write errors */
    }
    e.returnValue = true;
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 840,
    minWidth: 940,
    minHeight: 620,
    backgroundColor: "#f6f8fb",
    title: "MDFlow",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // Open external links (e.g. fonts) in the default browser, not the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerStorageIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

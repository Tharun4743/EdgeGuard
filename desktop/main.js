const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let javaProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the React app from the bundled frontend/dist
  mainWindow.loadFile(path.join(__dirname, 'frontend/index.html'));

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const jarPath = path.join(__dirname, 'backend/backend-0.0.1-SNAPSHOT.jar');
  const javaPath = path.join(__dirname, 'jre/bin/java.exe');
  console.log('Starting Java Backend:', jarPath, 'using', javaPath);
  
  javaProcess = spawn(javaPath, ['-jar', jarPath]);

  javaProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  javaProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  javaProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
}

app.on('ready', () => {
  startBackend();
  // Wait a few seconds for Spring Boot to start before creating the window
  setTimeout(createWindow, 3000);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (javaProcess) {
    javaProcess.kill('SIGINT');
  }
});

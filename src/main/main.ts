/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, session } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import axios from 'axios';
import { IPreGame, IUser } from '../renderer/components/Agent.interface';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug').default();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
        webviewTag: true
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    session.defaultSession.clearStorageData({
      storages: ['cookies']  // Puedes especificar qué almacenar borrar: cookies, caché, etc.
    }).then(() => {
      console.log('Cookies borradas!');
    });
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);


ipcMain.handle('clear-cookies', async () => {
  await session.defaultSession.clearStorageData({
    storages: ['cookies']
  });
  console.log('Cookies borradas desde React!');
});

ipcMain.handle('get-entitlements', async (event, token) => {
  try {
    //console.log(token)
    const response = await axios.post('https://entitlements.auth.riotgames.com/api/token/v1', {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    //console.log("ENTITLEMENTS: " + response.data.entitlements_token)
    
    return response.data.entitlements_token;

  } catch (error: any) {
    console.error('Error al obtener entitlements:', error.message);
    throw error.message; 
  }
});

ipcMain.handle('get-puuid', async (event, token) => {
  try {
    const response = await axios.get('https://auth.riotgames.com/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })

    return (response.data as IUser).sub
  } catch(e) {
    console.error(e)
  }
})

ipcMain.handle('get-match-id', async (event, pid, auid, token, entitlements) => {
  try {
    const response = await axios.get(`https://glz-eu-1.eu.a.pvp.net/pregame/v1/players/${pid}`, {
      headers: {
        "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
        "X-Riot-ClientVersion": "B920FBFF19DBA8A7",
        "X-Riot-Entitlements-JWT": entitlements,
        Authorization: `Bearer ${token}`
      }
    });

    return (response.data as IPreGame).MatchID
  } catch(e) {
    console.error(e)
  }
})

ipcMain.handle('instalock', async (event, mid, auid, token, entitlements) => {
  try {
    console.log(mid, auid, token, entitlements)
    const response = await axios.post(`https://glz-eu-1.eu.a.pvp.net/pregame/v1/matches/${mid}/lock/${auid}`, {}, {
      headers: {
        "X-Riot-ClientPlatform": "ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjogIlVua25vd24iDQp9",
        "X-Riot-ClientVersion": "B318723E61D84617",
        "X-Riot-Entitlements-JWT": entitlements,
        Authorization: `Bearer ${token}`
      }
    })

    return response ? "success" : "error"

  } catch(e) {
    console.log(e)
  }
})

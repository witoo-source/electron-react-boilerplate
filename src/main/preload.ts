// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    clearCookies: () => ipcRenderer.invoke('clear-cookies'),
    getEntitlements: (token: string) => ipcRenderer.invoke('get-entitlements', token),
    instalock: (mid: string, auid: string, token: string, entitlements: string) => ipcRenderer.invoke('instalock', mid, auid, token, entitlements),
    getPUUID: (token: string) => ipcRenderer.invoke('get-puuid', token),
    getMatchID: (pid: string, auid: string, token: string, entitlements: string) => ipcRenderer.invoke('get-match-id', pid, auid, token, entitlements)
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);


export type ElectronHandler = typeof electronHandler;

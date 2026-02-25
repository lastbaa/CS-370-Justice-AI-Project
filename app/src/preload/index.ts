import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppSettings, ChatSession, IPC } from '../../../shared/src/types'

// Expose Electron API
contextBridge.exposeInMainWorld('electron', electronAPI)

// Expose our safe API to the renderer
contextBridge.exposeInMainWorld('api', {
  checkOllama: () => ipcRenderer.invoke(IPC.CHECK_OLLAMA),

  openFileDialog: () => ipcRenderer.invoke(IPC.OPEN_FILE_DIALOG),

  openFolderDialog: () => ipcRenderer.invoke(IPC.OPEN_FOLDER_DIALOG),

  loadFiles: (filePaths: string[]) => ipcRenderer.invoke(IPC.LOAD_FILES, filePaths),

  getFiles: () => ipcRenderer.invoke(IPC.GET_FILES),

  removeFile: (fileId: string) => ipcRenderer.invoke(IPC.REMOVE_FILE, fileId),

  query: (question: string) => ipcRenderer.invoke(IPC.QUERY, question),

  getSettings: () => ipcRenderer.invoke(IPC.GET_SETTINGS),

  saveSettings: (settings: AppSettings) => ipcRenderer.invoke(IPC.SAVE_SETTINGS, settings),

  // Encrypted chat history
  saveSession: (session: ChatSession) => ipcRenderer.invoke(IPC.SAVE_SESSION, session),
  getSessions: () => ipcRenderer.invoke(IPC.GET_SESSIONS),
  deleteSession: (sessionId: string) => ipcRenderer.invoke(IPC.DELETE_SESSION, sessionId),
})

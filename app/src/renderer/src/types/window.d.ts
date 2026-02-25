import { AppSettings, OllamaStatus, FileInfo, QueryResult, ChatSession } from '../../../../../shared/src/types'

export {}

declare global {
  interface Window {
    api: {
      checkOllama: () => Promise<OllamaStatus>
      openFileDialog: () => Promise<string[]>
      openFolderDialog: () => Promise<string | null>
      loadFiles: (filePaths: string[]) => Promise<FileInfo[]>
      getFiles: () => Promise<FileInfo[]>
      removeFile: (fileId: string) => Promise<void>
      query: (question: string) => Promise<QueryResult>
      getSettings: () => Promise<AppSettings>
      saveSettings: (settings: AppSettings) => Promise<void>
      saveSession: (session: ChatSession) => Promise<boolean>
      getSessions: () => Promise<ChatSession[]>
      deleteSession: (sessionId: string) => Promise<boolean>
    }
  }
}

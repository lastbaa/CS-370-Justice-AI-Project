import { useEffect, useRef, useState } from 'react'
import {
  AppSettings,
  ChatMessage,
  ChatSession,
  DEFAULT_SETTINGS,
  FileInfo,
} from '../../../../shared/src/types'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import Settings from './components/Settings'

type View = 'main' | 'settings'

function makeSessionName(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user')
  if (!first) return 'New Chat'
  const text = first.content.trim()
  return text.length > 52 ? text.slice(0, 52) + '…' : text
}

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('main')
  const [files, setFiles] = useState<FileInfo[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => uuidv4())
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState(false)

  const messagesRef = useRef(messages)
  const sessionIdRef = useRef(currentSessionId)
  messagesRef.current = messages
  sessionIdRef.current = currentSessionId

  useEffect(() => {
    async function init(): Promise<void> {
      try {
        const savedSettings = await window.api.getSettings()
        setSettings(savedSettings)
      } catch { }
      try {
        const existingFiles = await window.api.getFiles()
        setFiles(existingFiles)
      } catch { }
      try {
        const saved = await window.api.getSessions()
        setSessions(saved)
      } catch { }
    }
    init()
  }, [])

  // Auto-save current session (debounced 1s)
  useEffect(() => {
    if (messages.length === 0) return
    const timer = setTimeout(async () => {
      const session: ChatSession = {
        id: sessionIdRef.current,
        name: makeSessionName(messagesRef.current),
        messages: messagesRef.current,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      try {
        await window.api.saveSession(session)
        const updated = await window.api.getSessions()
        setSessions(updated)
      } catch { }
    }, 1000)
    return () => clearTimeout(timer)
  }, [messages])

  // ── File management ───────────────────────────────────────────
  async function handleLoadPaths(paths: string[]): Promise<void> {
    setLoadError(null)
    setIsLoading(true)
    try {
      const loaded = await window.api.loadFiles(paths)
      if (loaded.length === 0) {
        setLoadError('No supported files found. Try PDF or DOCX files.')
        return
      }
      setFiles((prev) => {
        const existingIds = new Set(prev.map((f) => f.id))
        return [...prev, ...loaded.filter((f) => !existingIds.has(f.id))]
      })
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load files.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddFiles(): Promise<void> {
    try {
      const paths = await window.api.openFileDialog()
      if (!paths || paths.length === 0) return
      await handleLoadPaths(paths)
    } catch { }
  }

  async function handleAddFolder(): Promise<void> {
    try {
      const folderPath = await window.api.openFolderDialog()
      if (!folderPath) return
      await handleLoadPaths([folderPath])
    } catch { }
  }

  async function handleRemoveFile(id: string): Promise<void> {
    try {
      await window.api.removeFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error('Failed to remove file:', err)
    }
  }

  // ── Chat ──────────────────────────────────────────────────────
  async function handleQuery(question: string): Promise<void> {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsQuerying(true)

    // Preview build — simulate AI processing pipeline
    await new Promise<void>((resolve) => setTimeout(resolve, 4200))

    setIsQuerying(false)
    const mockMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content:
        'Justice AI analyzed your documents and identified the most relevant passages. In the full release, this response will include the exact cited answer — referencing the specific filename, page number, and a direct quoted excerpt from the source material.\n\nEvery response is grounded strictly in your loaded documents. Nothing is extrapolated, assumed, or sent to any external server.',
      citations: [],
      notFound: false,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, mockMessage])
  }

  // ── Sessions ──────────────────────────────────────────────────
  function handleNewChat(): void {
    setMessages([])
    setCurrentSessionId(uuidv4())
    setChatMode(true)
    setView('main')
  }

  async function handleLoadSession(session: ChatSession): Promise<void> {
    setMessages(session.messages)
    setCurrentSessionId(session.id)
  }

  async function handleDeleteSession(sessionId: string): Promise<void> {
    try {
      await window.api.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      if (sessionId === currentSessionId) handleNewChat()
    } catch (err) {
      console.error('Failed to delete session:', err)
    }
  }

  async function handleSaveSettings(newSettings: AppSettings): Promise<void> {
    try {
      await window.api.saveSettings(newSettings)
      setSettings(newSettings)
      setView('main')
    } catch (err) {
      console.error('Failed to save settings:', err)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080808]">
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isLoading={isLoading}
        onNewChat={handleNewChat}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onAddFiles={handleAddFiles}
        onOpenSettings={() => setView('settings')}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          files={files}
          isQuerying={isQuerying}
          isLoading={isLoading}
          loadError={loadError}
          chatMode={chatMode}
          onQuery={handleQuery}
          onNewChat={handleNewChat}
          onAddFiles={handleAddFiles}
          onAddFolder={handleAddFolder}
          onRemoveFile={handleRemoveFile}
          onLoadPaths={handleLoadPaths}
        />
      </div>

      {view === 'settings' && (
        <Settings settings={settings} onSave={handleSaveSettings} onClose={() => setView('main')} />
      )}
    </div>
  )
}

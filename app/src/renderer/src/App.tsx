import { useEffect, useState } from 'react'
import { AppSettings, ChatMessage, DEFAULT_SETTINGS, FileInfo, OllamaStatus } from '../../../../shared/src/types'
import { v4 as uuidv4 } from 'uuid'
import OnboardingScreen from './components/OnboardingScreen'
import Sidebar from './components/Sidebar'
import ChatInterface from './components/ChatInterface'
import Settings from './components/Settings'

type View = 'onboarding' | 'main' | 'settings'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('onboarding')
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null)
  const [files, setFiles] = useState<FileInfo[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(false)
  const [isQuerying, setIsQuerying] = useState(false)

  useEffect(() => {
    async function init(): Promise<void> {
      try {
        const savedSettings = await window.api.getSettings()
        setSettings(savedSettings)
      } catch {
        // use defaults
      }

      try {
        const status = await window.api.checkOllama()
        setOllamaStatus(status)
        if (status.running && status.hasLlmModel && status.hasEmbedModel) {
          const existingFiles = await window.api.getFiles()
          setFiles(existingFiles)
          setView('main')
        } else {
          setView('onboarding')
        }
      } catch {
        setView('onboarding')
      }
    }
    init()
  }, [])

  async function handleCheckOllama(): Promise<void> {
    try {
      const status = await window.api.checkOllama()
      setOllamaStatus(status)
      return
    } catch {
      setOllamaStatus(null)
    }
  }

  async function handleFilesLoaded(newFiles: FileInfo[]): Promise<void> {
    setFiles((prev) => {
      const existingIds = new Set(prev.map((f) => f.id))
      const unique = newFiles.filter((f) => !existingIds.has(f.id))
      return [...prev, ...unique]
    })
  }

  async function handleRemoveFile(id: string): Promise<void> {
    try {
      await window.api.removeFile(id)
      setFiles((prev) => prev.filter((f) => f.id !== id))
    } catch (err) {
      console.error('Failed to remove file:', err)
    }
  }

  async function handleQuery(question: string): Promise<void> {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMessage])
    setIsQuerying(true)

    try {
      const result = await window.api.query(question)
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: result.answer,
        citations: result.citations,
        notFound: result.notFound,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'An unexpected error occurred'}`,
        notFound: true,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsQuerying(false)
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

  if (view === 'onboarding') {
    return (
      <OnboardingScreen
        ollamaStatus={ollamaStatus}
        onRetry={async () => {
          await handleCheckOllama()
          const fresh = await window.api.checkOllama().catch(() => null)
          if (fresh) setOllamaStatus(fresh)
        }}
        onComplete={async () => {
          const existingFiles = await window.api.getFiles()
          setFiles(existingFiles)
          setView('main')
        }}
      />
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0d1117]">
      {/* Sidebar */}
      <Sidebar
        files={files}
        isLoading={isLoading}
        onFilesLoaded={handleFilesLoaded}
        onRemoveFile={handleRemoveFile}
        onOpenSettings={() => setView('settings')}
        setIsLoading={setIsLoading}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <ChatInterface
          messages={messages}
          isQuerying={isQuerying}
          hasFiles={files.length > 0}
          onQuery={handleQuery}
        />
      </div>

      {/* Settings overlay */}
      {view === 'settings' && (
        <Settings
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setView('main')}
        />
      )}
    </div>
  )
}

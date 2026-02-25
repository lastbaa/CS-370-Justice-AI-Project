import { useState } from 'react'
import { ChatSession, FileInfo } from '../../../../../shared/src/types'

interface Props {
  files: FileInfo[]
  isLoading: boolean
  sessions: ChatSession[]
  currentSessionId: string
  onFilesLoaded: (files: FileInfo[]) => void
  onRemoveFile: (id: string) => void
  onOpenSettings: () => void
  onNewChat: () => void
  onLoadSession: (session: ChatSession) => void
  onDeleteSession: (sessionId: string) => void
  setIsLoading: (loading: boolean) => void
}

function ScalesLogo(): JSX.Element {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="6" r="3" fill="#c9a84c" />
      <rect x="23" y="6" width="2" height="30" fill="#c9a84c" />
      <rect x="6" y="8" width="36" height="2" rx="1" fill="#c9a84c" />
      <ellipse cx="12" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="4" y1="22" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="8" y1="9" x2="4" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="16" y1="9" x2="20" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <ellipse cx="36" cy="22" rx="8" ry="4" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="28" y1="22" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="32" y1="9" x2="28" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <line x1="40" y1="9" x2="44" y2="22" stroke="#c9a84c" strokeWidth="1.5" />
      <rect x="18" y="36" width="12" height="2" rx="1" fill="#c9a84c" />
    </svg>
  )
}

function Spinner(): JSX.Element {
  return (
    <svg className="animate-spin h-4 w-4 text-[#c9a84c]" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function FileCard({
  file,
  onRemove,
}: {
  file: FileInfo
  onRemove: () => void
}): JSX.Element {
  const [hovered, setHovered] = useState(false)
  const ext = file.fileName.split('.').pop()?.toUpperCase() ?? 'DOC'

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2.5 hover:border-[#c9a84c]/40 transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 flex-shrink-0 rounded bg-[#c9a84c]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#c9a84c]">
            {ext}
          </span>
          <span className="text-sm font-medium text-[#e6edf3] truncate" title={file.fileName}>
            {file.fileName}
          </span>
        </div>
        {hovered && (
          <button
            onClick={onRemove}
            className="no-drag flex-shrink-0 flex h-5 w-5 items-center justify-center rounded hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149] transition-colors"
            title="Remove file"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-1 ml-7 text-xs text-[#8b949e]">
        {file.totalPages} {file.totalPages === 1 ? 'page' : 'pages'} · {file.wordCount.toLocaleString()} words · {file.chunkCount} chunks
      </p>
    </div>
  )
}

function SessionItem({
  session,
  isActive,
  onLoad,
  onDelete,
}: {
  session: ChatSession
  isActive: boolean
  onLoad: () => void
  onDelete: () => void
}): JSX.Element {
  const [hovered, setHovered] = useState(false)
  const date = new Date(session.updatedAt)
  const timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  const msgCount = session.messages.filter((m) => m.role === 'user').length

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onLoad}
      className={`group relative rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
        isActive
          ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/30'
          : 'border border-transparent hover:bg-[#21262d] hover:border-[#30363d]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-xs leading-snug truncate flex-1 ${isActive ? 'text-[#e6edf3]' : 'text-[#8b949e]'}`}
          title={session.name}
        >
          {session.name}
        </p>
        {hovered && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="no-drag flex-shrink-0 flex h-4 w-4 items-center justify-center rounded hover:bg-[#f85149]/20 text-[#8b949e] hover:text-[#f85149] transition-colors"
            title="Delete session"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
              <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-[#484f58]">
        {msgCount} {msgCount === 1 ? 'query' : 'queries'} · {timeStr}
      </p>
    </div>
  )
}

export default function Sidebar({
  files,
  isLoading,
  sessions,
  currentSessionId,
  onFilesLoaded,
  onRemoveFile,
  onOpenSettings,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  setIsLoading,
}: Props): JSX.Element {
  const [loadError, setLoadError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'files' | 'history'>('files')

  async function handleAddFiles(): Promise<void> {
    setLoadError(null)
    try {
      const paths = await window.api.openFileDialog()
      if (!paths || paths.length === 0) return
      setIsLoading(true)
      const loaded = await window.api.loadFiles(paths)
      if (loaded.length === 0) {
        setLoadError('No files could be processed.')
      }
      onFilesLoaded(loaded)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load files')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddFolder(): Promise<void> {
    setLoadError(null)
    try {
      const folderPath = await window.api.openFolderDialog()
      if (!folderPath) return
      setIsLoading(true)
      const loaded = await window.api.loadFiles([folderPath])
      if (loaded.length === 0) {
        setLoadError('No PDF or DOCX files found in that folder.')
      }
      onFilesLoaded(loaded)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load folder')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col border-r border-[#30363d] bg-[#161b22]">
      {/* Header */}
      <div className="drag-region flex items-center justify-between px-4 py-3.5 border-b border-[#30363d]">
        <div className="no-drag flex items-center gap-2">
          <ScalesLogo />
          <div>
            <h1 className="text-sm font-bold text-[#c9a84c] tracking-wide leading-none">Justice AI</h1>
            <p className="text-[10px] text-[#484f58] leading-tight mt-0.5">Legal Research</p>
          </div>
        </div>
        {/* New chat button */}
        <button
          onClick={onNewChat}
          className="no-drag flex h-7 w-7 items-center justify-center rounded-lg border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e] hover:bg-[#21262d] transition-all"
          title="New chat"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2z" />
          </svg>
        </button>
      </div>

      {/* Tab toggle */}
      <div className="flex border-b border-[#30363d]">
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
            activeTab === 'files'
              ? 'text-[#e6edf3] border-b-2 border-[#c9a84c]'
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          Documents
          {files.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#30363d] px-1.5 py-0.5 text-[10px] font-normal text-[#8b949e]">
              {files.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-[#e6edf3] border-b-2 border-[#c9a84c]'
              : 'text-[#8b949e] hover:text-[#e6edf3]'
          }`}
        >
          History
          {sessions.length > 0 && (
            <span className="ml-1.5 rounded-full bg-[#30363d] px-1.5 py-0.5 text-[10px] font-normal text-[#8b949e]">
              {sessions.length}
            </span>
          )}
        </button>
      </div>

      {/* Documents tab */}
      {activeTab === 'files' && (
        <>
          <div className="px-3 py-3 border-b border-[#30363d]">
            <div className="flex flex-col gap-1.5">
              <button
                onClick={handleAddFiles}
                disabled={isLoading}
                className="no-drag flex items-center gap-2 rounded-lg border border-[#30363d] bg-transparent px-3 py-2 text-sm text-[#e6edf3] hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Spinner /> : (
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-[#c9a84c]">
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75zM8.75 9.25a.75.75 0 0 0-1.5 0v1.5H5.75a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5H8.75v-1.5z" />
                  </svg>
                )}
                <span>Add Files</span>
                <span className="ml-auto text-[10px] text-[#484f58]">PDF, DOCX</span>
              </button>
              <button
                onClick={handleAddFolder}
                disabled={isLoading}
                className="no-drag flex items-center gap-2 rounded-lg border border-[#30363d] bg-transparent px-3 py-2 text-sm text-[#e6edf3] hover:border-[#c9a84c]/60 hover:bg-[#c9a84c]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="text-[#c9a84c]">
                  <path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75zM8.75 8.25a.75.75 0 0 0-1.5 0v1.5H5.75a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5H8.75v-1.5z" />
                </svg>
                <span>Add Folder</span>
              </button>
            </div>
            {loadError && <p className="mt-2 text-xs text-[#f85149] px-1">{loadError}</p>}
            {isLoading && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8b949e] px-1">
                <Spinner />
                Processing…
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <svg width="28" height="28" viewBox="0 0 16 16" fill="none" className="mb-2">
                  <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75z" fill="#21262d" />
                </svg>
                <p className="text-xs text-[#8b949e]">No documents loaded</p>
                <p className="mt-0.5 text-[10px] text-[#484f58]">Add files to begin</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} onRemove={() => onRemoveFile(file.id)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none" className="mb-2">
                <path d="M1.5 8a6.5 6.5 0 1 1 13 0 6.5 6.5 0 0 1-13 0zM8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.5 4.75a.75.75 0 0 0-1.5 0v3.5l-1.72 1.72a.75.75 0 1 0 1.06 1.06l2-2a.75.75 0 0 0 .22-.53V4.75z" fill="#30363d" />
              </svg>
              <p className="text-xs text-[#8b949e]">No sessions yet</p>
              <p className="mt-0.5 text-[10px] text-[#484f58]">Sessions save automatically</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {sessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={session.id === currentSessionId}
                  onLoad={() => onLoadSession(session)}
                  onDelete={() => onDeleteSession(session.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings button */}
      <div className="border-t border-[#30363d] px-3 py-3">
        <button
          onClick={onOpenSettings}
          className="no-drag flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.303c-.066-.019-.176-.011-.299.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.645-.715 1.195-1.459 1.259a8.205 8.205 0 0 1-1.402 0c-.744-.064-1.289-.614-1.459-1.259l-.288-1.107c-.017-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.019.176.011.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.212-.224l.288-1.107C6.01.645 6.556.095 7.299.03 7.53.01 7.765 0 8 0zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0zM8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
          </svg>
          Settings
        </button>
      </div>
    </aside>
  )
}

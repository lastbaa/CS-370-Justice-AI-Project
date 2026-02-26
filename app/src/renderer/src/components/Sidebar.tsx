import { useState } from 'react'
import { ChatSession } from '../../../../../shared/src/types'

interface Props {
  sessions: ChatSession[]
  currentSessionId: string
  isLoading: boolean
  onGoHome: () => void
  onNewChat: () => void
  onLoadSession: (session: ChatSession) => void
  onDeleteSession: (sessionId: string) => void
  onAddFiles: () => void
  onOpenSettings: () => void
}

function GavelIcon({ size = 18 }: { size?: number }): JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
      <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
      <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
    </svg>
  )
}

function groupSessions(
  sessions: ChatSession[]
): { label: string; items: ChatSession[] }[] {
  const now = Date.now()
  const day = 86_400_000
  const groups: { label: string; items: ChatSession[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Last 7 days', items: [] },
    { label: 'Last 30 days', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const s of sessions) {
    const age = now - s.updatedAt
    if (age < day) groups[0].items.push(s)
    else if (age < 2 * day) groups[1].items.push(s)
    else if (age < 7 * day) groups[2].items.push(s)
    else if (age < 30 * day) groups[3].items.push(s)
    else groups[4].items.push(s)
  }

  return groups.filter((g) => g.items.length > 0)
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onLoad}
      className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-all ${
        isActive
          ? 'bg-[#1a1a1a] text-white'
          : 'text-[#666] hover:bg-[#111] hover:text-[#aaa]'
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" className="shrink-0 opacity-50">
        <path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25z" />
      </svg>
      <span className="flex-1 truncate text-[12.5px] leading-snug" title={session.name}>
        {session.name}
      </span>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="no-drag shrink-0 flex h-5 w-5 items-center justify-center rounded text-[#555] hover:text-[#f85149] transition-colors"
          title="Delete"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function Sidebar({
  sessions,
  currentSessionId,
  isLoading,
  onGoHome,
  onNewChat,
  onLoadSession,
  onDeleteSession,
  onAddFiles,
  onOpenSettings,
}: Props): JSX.Element {
  const groups = groupSessions(sessions)

  return (
    <aside className="flex h-screen w-[240px] shrink-0 flex-col border-r border-[#161616] bg-[#090909]">
      {/* Drag region + logo */}
      <div className="drag-region flex items-center gap-2.5 px-4 pt-5 pb-4">
        <button
          onClick={onGoHome}
          className="no-drag flex items-center gap-2 hover:opacity-75 transition-opacity"
        >
          <GavelIcon size={18} />
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">
            Justice <span style={{ color: '#c9a84c' }}>AI</span>
          </span>
        </button>
      </div>

      {/* New Chat */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewChat}
          className="no-drag flex w-full items-center gap-2.5 rounded-xl border border-[#1e1e1e] px-3.5 py-2.5 text-[12.5px] font-medium text-[#666] hover:border-[#2a2a2a] hover:bg-[#111] hover:text-[#ccc] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2z" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center px-4">
            <p className="text-[11px] text-[#333]">No chats yet</p>
            <p className="mt-0.5 text-[10px] text-[#2a2a2a]">Sessions auto-save</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#333]">
                  {group.label}
                </p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={session.id === currentSessionId}
                      onLoad={() => onLoadSession(session)}
                      onDelete={() => onDeleteSession(session.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="border-t border-[#161616] px-2 py-3 flex flex-col gap-0.5">
        <button
          onClick={onAddFiles}
          disabled={isLoading}
          className="no-drag flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-[#555] hover:bg-[#111] hover:text-[#aaa] disabled:opacity-40 transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor" style={{ color: '#c9a84c' }}>
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75zM8.75 9.25a.75.75 0 0 0-1.5 0v1.5H5.75a.75.75 0 0 0 0 1.5h1.5v1.5a.75.75 0 0 0 1.5 0v-1.5h1.5a.75.75 0 0 0 0-1.5H8.75v-1.5z" />
          </svg>
          {isLoading ? 'Loading…' : 'Add Documents'}
        </button>
        <button
          onClick={onOpenSettings}
          className="no-drag flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-[#555] hover:bg-[#111] hover:text-[#aaa] transition-all"
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

import { ChatMessage } from '../../../../../shared/src/types'
import SourceCard from './SourceCard'

interface Props {
  message: ChatMessage
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message }: Props): JSX.Element {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%]">
          <div className="rounded-2xl rounded-tr-sm border border-[#c9a84c]/40 bg-[#c9a84c]/10 px-4 py-3">
            <p className="text-sm text-[#e6edf3] leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="mt-1 text-right text-[10px] text-[#8b949e]">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    )
  }

  // Assistant message
  const isNotFound = message.notFound

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%]">
        {/* Avatar + message */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#c9a84c]/20 border border-[#c9a84c]/40">
            <svg width="14" height="14" viewBox="0 0 48 48" fill="none">
              <rect x="23" y="6" width="2" height="30" fill="#c9a84c" />
              <rect x="6" y="8" width="36" height="2" rx="1" fill="#c9a84c" />
              <ellipse cx="12" cy="22" rx="7" ry="3.5" fill="none" stroke="#c9a84c" strokeWidth="2" />
              <ellipse cx="36" cy="22" rx="7" ry="3.5" fill="none" stroke="#c9a84c" strokeWidth="2" />
              <line x1="5" y1="22" x2="19" y2="22" stroke="#c9a84c" strokeWidth="2" />
              <line x1="29" y1="22" x2="43" y2="22" stroke="#c9a84c" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            {isNotFound ? (
              <div className="rounded-xl rounded-tl-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="flex-shrink-0 mt-0.5 text-amber-400"
                  >
                    <path d="M8.22 1.754a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368zm-1.763-.707c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575zM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-.25-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0z" />
                  </svg>
                  <p className="text-sm text-amber-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl rounded-tl-sm bg-[#21262d] border border-[#30363d] px-4 py-3">
                <p className="text-sm text-[#e6edf3] leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            )}

            <p className="mt-1 text-[10px] text-[#8b949e]">{formatTime(message.timestamp)}</p>

            {/* Citations */}
            {!isNotFound && message.citations && message.citations.length > 0 && (
              <div className="mt-2">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#8b949e]">
                  Sources ({message.citations.length})
                </p>
                {message.citations.map((citation, idx) => (
                  <SourceCard key={idx} citation={citation} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

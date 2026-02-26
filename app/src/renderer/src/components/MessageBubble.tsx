import { ChatMessage } from '../../../../../shared/src/types'
import SourceCard from './SourceCard'

interface Props {
  message: ChatMessage
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function GavelAvatar(): JSX.Element {
  return (
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5"
      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.22)' }}
    >
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
        <rect x="1" y="3" width="8" height="4" rx="1.25" fill="#c9a84c" transform="rotate(45 5 5)" />
        <line x1="10" y1="10" x2="18" y2="18" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
        <rect x="1" y="17" width="8" height="2" rx="1" fill="#c9a84c" opacity="0.45" />
      </svg>
    </div>
  )
}

export default function MessageBubble({ message }: Props): JSX.Element {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%]">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <p className="mt-1.5 text-right text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    )
  }

  const isNotFound = message.notFound

  return (
    <div className="flex gap-3">
      <GavelAvatar />

      <div className="flex-1 min-w-0">
        <p
          className="mb-2 text-[10.5px] font-semibold tracking-wide"
          style={{ color: 'rgba(201,168,76,0.65)' }}
        >
          Justice AI
        </p>

        {isNotFound ? (
          <div
            className="rounded-xl px-4 py-3"
            style={{
              background: 'rgba(248,81,73,0.06)',
              border: '1px solid rgba(248,81,73,0.18)',
            }}
          >
            <p
              className="text-[13px] leading-relaxed whitespace-pre-wrap"
              style={{ color: 'rgba(255,180,180,0.8)' }}
            >
              {message.content}
            </p>
          </div>
        ) : (
          <p className="text-[13px] text-white leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        <p className="mt-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.18)' }}>
          {formatTime(message.timestamp)}
        </p>

        {!isNotFound && message.citations && message.citations.length > 0 && (
          <div className="mt-3">
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'rgba(255,255,255,0.22)' }}
            >
              Sources · {message.citations.length}
            </p>
            <div className="flex flex-col gap-2">
              {message.citations.map((citation, idx) => (
                <SourceCard key={idx} citation={citation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

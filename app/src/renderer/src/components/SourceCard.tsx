import { Citation } from '../../../../../shared/src/types'

interface Props {
  citation: Citation
}

export default function SourceCard({ citation }: Props): JSX.Element {
  const scorePercent = Math.round(citation.score * 100)

  return (
    <div className="mt-2 rounded-lg border border-l-4 border-[#1e1e1e] border-l-[#c9a84c] bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Document icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="flex-shrink-0 text-[#c9a84c]"
          >
            <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25V1.75zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5H3.75zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.014-.013-2.914-2.914-.01-.011z" />
          </svg>
          <span className="text-sm font-medium text-[#ffffff] truncate" title={citation.fileName}>
            {citation.fileName}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-[#8b949e]">
            Page <span className="font-medium text-[#ffffff]">{citation.pageNumber}</span>
          </span>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-12 rounded-full bg-[#1e1e1e] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#c9a84c]"
                style={{ width: `${Math.min(scorePercent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-[#8b949e]">{scorePercent}%</span>
          </div>
        </div>
      </div>
      <blockquote className="border-l-0 pl-0 text-sm text-[#8b949e] italic leading-relaxed line-clamp-3">
        "{citation.excerpt}"
      </blockquote>
    </div>
  )
}

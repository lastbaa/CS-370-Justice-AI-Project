import { useEffect, useRef, useState } from 'react'
import { Citation } from '../../../../../shared/src/types'
import * as pdfjsLib from 'pdfjs-dist'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'

// Configure PDF.js worker — use the bundled worker via ESM URL
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

interface Props {
  citation: Citation | null
  onClose: () => void
}

// ── Text position finder ─────────────────────────────────────────────────────
interface HighlightRect {
  x: number
  y: number
  w: number
  h: number
}

function findHighlightRects(
  items: TextItem[],
  excerpt: string,
  viewport: pdfjsLib.PageViewport
): HighlightRect[] {
  // Build full concatenated string and track each item's start position
  let fullText = ''
  const itemMeta: { start: number; end: number; item: TextItem }[] = []

  for (const item of items) {
    const start = fullText.length
    fullText += item.str
    itemMeta.push({ start, end: fullText.length, item })
    // pdfjs items sometimes don't include spaces; add one if needed
    if (!item.str.endsWith(' ')) fullText += ' '
  }

  // Search for the first ~80 chars of the excerpt (trim whitespace/newlines)
  const needle = excerpt
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
    .toLowerCase()
  const haystack = fullText.replace(/\s+/g, ' ').toLowerCase()
  const foundAt = haystack.indexOf(needle)
  if (foundAt === -1) return []

  const foundEnd = foundAt + needle.length
  const rects: HighlightRect[] = []

  for (const { start, end, item } of itemMeta) {
    if (end <= foundAt || start >= foundEnd) continue

    // Compute canvas coords from the item transform
    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform)
    // tx = [a, b, c, d, e, f] — standard affine matrix
    const x = tx[4]
    const y = tx[5]
    // Height: magnitude of the y-scale column
    const h = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3])
    // Width: scale item.width by the x-scale magnitude
    const xScale = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1])
    const w = item.width * xScale

    // y is the baseline; move up by h to get the top of the glyph
    rects.push({ x, y: y - h, w, h: h * 1.3 })
  }

  return rects
}

// ── PDF Viewer ───────────────────────────────────────────────────────────────
function PdfViewer({ citation }: { citation: Citation }): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')
  const [totalPages, setTotalPages] = useState<number>(0)
  const SCALE = 1.6

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    async function render(): Promise<void> {
      try {
        const b64 = await window.api.getFileData(citation.filePath)
        if (cancelled) return

        // Decode base64 → Uint8Array
        const binary = atob(b64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

        const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
        if (cancelled) return

        setTotalPages(pdf.numPages)
        const pageNum = Math.min(citation.pageNumber, pdf.numPages)
        const page = await pdf.getPage(pageNum)
        if (cancelled) return

        const viewport = page.getViewport({ scale: SCALE })
        const canvas = canvasRef.current
        if (!canvas) return

        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!

        // Render the PDF page
        await page.render({ canvasContext: ctx, viewport }).promise
        if (cancelled) return

        // Overlay highlights
        const textContent = await page.getTextContent()
        if (cancelled) return

        const textItems = textContent.items.filter((i): i is TextItem => 'str' in i)
        const rects = findHighlightRects(textItems, citation.excerpt, viewport)

        if (rects.length > 0) {
          ctx.save()
          ctx.fillStyle = 'rgba(201, 168, 76, 0.28)'
          ctx.strokeStyle = 'rgba(201, 168, 76, 0.55)'
          ctx.lineWidth = 1
          for (const r of rects) {
            ctx.fillRect(r.x, r.y, r.w, r.h)
            ctx.strokeRect(r.x, r.y, r.w, r.h)
          }
          ctx.restore()
        }

        setStatus('done')
      } catch (err) {
        console.error('DocumentViewer render error:', err)
        if (!cancelled) setStatus('error')
      }
    }

    render()
    return () => { cancelled = true }
  }, [citation.filePath, citation.pageNumber, citation.excerpt])

  return (
    <div className="flex-1 overflow-auto" style={{ background: '#111' }}>
      {status === 'loading' && (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="h-5 w-5 rounded-full animate-spin"
              style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }}
            />
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Loading page {citation.pageNumber}…
            </p>
          </div>
        </div>
      )}
      {status === 'error' && (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div>
            <p className="text-[13px] font-medium" style={{ color: 'rgba(248,81,73,0.8)' }}>
              Could not render this document
            </p>
            <p className="mt-1 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              The file may have moved or is password-protected.
            </p>
          </div>
        </div>
      )}
      <div style={{ display: status === 'done' ? 'block' : 'none', padding: '16px' }}>
        {totalPages > 0 && (
          <p
            className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: 'rgba(255,255,255,0.18)' }}
          >
            Page {citation.pageNumber} of {totalPages}
          </p>
        )}
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-2xl mx-auto block"
          style={{ maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}

// ── DOCX / text fallback ─────────────────────────────────────────────────────
function TextViewer({ citation }: { citation: Citation }): JSX.Element {
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    window.api.getPageText(citation.filePath, citation.pageNumber).then((t) => {
      setText(t || '(No text extracted for this page)')
    })
  }, [citation.filePath, citation.pageNumber])

  if (text === null) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          className="h-5 w-5 rounded-full animate-spin"
          style={{ border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c' }}
        />
      </div>
    )
  }

  // Highlight the excerpt in the text
  const needle = citation.excerpt.replace(/\s+/g, ' ').trim().slice(0, 120)
  const parts = text.split(new RegExp(`(${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))

  return (
    <div className="flex-1 overflow-auto p-5">
      <p
        className="text-[12.5px] leading-relaxed whitespace-pre-wrap font-mono"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        {parts.map((part, i) =>
          part.toLowerCase() === needle.toLowerCase() ? (
            <mark
              key={i}
              style={{ background: 'rgba(201,168,76,0.35)', color: 'white', borderRadius: 2 }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </p>
    </div>
  )
}

// ── Main DocumentViewer panel ─────────────────────────────────────────────────
export default function DocumentViewer({ citation, onClose }: Props): JSX.Element | null {
  const ext = citation?.fileName.split('.').pop()?.toLowerCase()
  const isPdf = ext === 'pdf'

  return (
    <aside
      className="flex h-screen flex-col shrink-0"
      style={{
        width: citation ? 520 : 0,
        minWidth: citation ? 520 : 0,
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        background: '#0a0a0a',
        overflow: 'hidden',
        transition: 'width 0.25s ease, min-width 0.25s ease',
      }}
    >
      {citation && (
        <>
          {/* Header */}
          <div
            className="drag-region flex h-11 shrink-0 items-center gap-3 px-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div className="no-drag flex-1 flex items-center gap-2 min-w-0">
              {/* File type badge */}
              <span
                className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(201,168,76,0.1)', color: '#c9a84c' }}
              >
                {ext?.toUpperCase() ?? 'DOC'}
              </span>
              <span
                className="text-[12px] font-medium truncate"
                style={{ color: 'rgba(255,255,255,0.65)' }}
                title={citation.fileName}
              >
                {citation.fileName}
              </span>
              <span
                className="shrink-0 text-[11px]"
                style={{ color: 'rgba(255,255,255,0.25)' }}
              >
                · p.{citation.pageNumber}
              </span>
            </div>

            <button
              onClick={onClose}
              className="no-drag shrink-0 flex h-6 w-6 items-center justify-center rounded-md transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'
                ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1.22 1.22a.75.75 0 0 1 1.06 0L6 4.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L7.06 6l3.72 3.72a.75.75 0 1 1-1.06 1.06L6 7.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L4.94 6 1.22 2.28a.75.75 0 0 1 0-1.06z" />
              </svg>
            </button>
          </div>

          {/* Excerpt strip */}
          <div
            className="shrink-0 px-4 py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#070707' }}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.12em] mb-1"
              style={{ color: 'rgba(201,168,76,0.45)' }}
            >
              Cited excerpt
            </p>
            <p
              className="text-[11px] leading-relaxed italic"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              "{citation.excerpt.slice(0, 180)}{citation.excerpt.length > 180 ? '…' : ''}"
            </p>
          </div>

          {/* Document body */}
          {isPdf ? (
            <PdfViewer key={`${citation.filePath}-${citation.pageNumber}`} citation={citation} />
          ) : (
            <TextViewer key={`${citation.filePath}-${citation.pageNumber}`} citation={citation} />
          )}
        </>
      )}
    </aside>
  )
}

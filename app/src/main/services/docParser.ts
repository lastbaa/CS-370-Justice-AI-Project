import { readFile } from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import { ParsedDocument, DocumentPage } from '../../../../shared/src/types'

export class DocParser {
  async parseFile(filePath: string): Promise<ParsedDocument> {
    const lower = filePath.toLowerCase()
    if (lower.endsWith('.pdf')) {
      return this.parsePdf(filePath)
    } else if (lower.endsWith('.docx')) {
      return this.parseDocx(filePath)
    } else {
      throw new Error(`Unsupported file type: ${filePath}`)
    }
  }

  private async parsePdf(filePath: string): Promise<ParsedDocument> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const buffer = await readFile(filePath)
    const pages: DocumentPage[] = []

    const renderPage = (pageData: {
      getTextContent: () => Promise<{ items: Array<{ str: string }> }>
    }): Promise<string> => {
      return pageData.getTextContent().then((content) => {
        const text = content.items.map((i) => i.str).join(' ').trim()
        pages.push({ pageNumber: pages.length + 1, text })
        return text
      })
    }

    await pdfParse(buffer, { pagerender: renderPage })

    const fileName = filePath.split('/').pop() || filePath
    const wordCount = pages.reduce((sum, p) => sum + p.text.split(/\s+/).filter(Boolean).length, 0)

    return {
      id: uuidv4(),
      filePath,
      fileName,
      extension: 'pdf',
      pages,
      totalPages: pages.length,
      wordCount,
      loadedAt: Date.now(),
    }
  }

  private async parseDocx(filePath: string): Promise<ParsedDocument> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const buffer = await readFile(filePath)
    const result = await mammoth.extractRawText({ buffer })
    const fullText: string = result.value || ''

    // Attempt to split on form-feed page breaks (\f), fallback to single page
    const rawPages = fullText.split('\f').filter((p: string) => p.trim().length > 0)
    const pageTexts: string[] = rawPages.length > 0 ? rawPages : [fullText]

    const pages: DocumentPage[] = pageTexts.map((text: string, idx: number) => ({
      pageNumber: idx + 1,
      text: text.trim(),
    }))

    const fileName = filePath.split('/').pop() || filePath
    const wordCount = pages.reduce((sum, p) => sum + p.text.split(/\s+/).filter(Boolean).length, 0)

    return {
      id: uuidv4(),
      filePath,
      fileName,
      extension: 'docx',
      pages,
      totalPages: pages.length,
      wordCount,
      loadedAt: Date.now(),
    }
  }
}

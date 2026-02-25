import { LocalIndex } from 'vectra'
import { join } from 'path'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'
import {
  ParsedDocument,
  DocumentChunk,
  FileInfo,
  Citation,
  QueryResult,
  AppSettings,
} from '../../../../shared/src/types'
import { OllamaService } from './ollama'

const SYSTEM_PROMPT = `You are Justice AI, a secure legal research assistant designed for legal professionals. You run entirely on this device. No data is sent externally.

Your only job is to help the user find information within the documents they have loaded. You are NOT providing legal advice. You are a research and retrieval tool to support the legal professional using you.

Rules you must never break:
1. Answer ONLY using the document excerpts provided in the context below.
2. Always cite the exact filename and page number for every claim you make.
3. Always include a direct quoted excerpt from the source document to support your answer.
4. If the answer cannot be found in the provided documents, respond only with: "I could not find information about this in your loaded documents. Please ensure the relevant files are loaded."
5. Never use pretrained knowledge to fill gaps. Never guess. Never hallucinate.
6. Never provide legal advice or legal conclusions. If asked for a legal opinion, remind the user that Justice AI is a research tool and that legal conclusions are theirs to make.

Context from loaded documents:
{context}

User question: {question}`

interface ChunkMetadata extends DocumentChunk {
  itemId: string
}

export class RagPipeline {
  private index: LocalIndex | null = null
  private fileRegistry = new Map<string, FileInfo>()
  private chunkRegistry = new Map<string, ChunkMetadata>()
  private docChunkIds = new Map<string, string[]>()
  private ollamaService: OllamaService
  private indexPath: string

  constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService
    this.indexPath = join(app.getPath('userData'), 'vector-index')
  }

  async initialize(_settings: AppSettings): Promise<void> {
    this.index = new LocalIndex(this.indexPath)
    const exists = await this.index.isIndexCreated()
    if (!exists) {
      await this.index.createIndex()
    }

    // Load existing items from the index to rebuild registries on startup
    try {
      const allItems = await this.index.listItems()
      // Track unique documents to rebuild fileRegistry
      const docMap = new Map<string, { meta: ChunkMetadata; count: number }>()

      for (const item of allItems) {
        const meta = item.metadata as ChunkMetadata
        if (meta && meta.itemId && meta.documentId) {
          this.chunkRegistry.set(meta.itemId, meta)
          const existing = this.docChunkIds.get(meta.documentId) || []
          existing.push(meta.itemId)
          this.docChunkIds.set(meta.documentId, existing)

          // Track docs for fileRegistry rebuild
          if (!docMap.has(meta.documentId)) {
            docMap.set(meta.documentId, { meta, count: 1 })
          } else {
            docMap.get(meta.documentId)!.count++
          }
        }
      }

      // Rebuild fileRegistry from chunk metadata
      for (const [docId, { meta, count }] of docMap) {
        if (!this.fileRegistry.has(docId)) {
          // We don't have totalPages/wordCount in chunk metadata, use defaults
          this.fileRegistry.set(docId, {
            id: docId,
            fileName: meta.fileName,
            filePath: meta.filePath,
            totalPages: meta.pageNumber, // approximation: highest page seen
            wordCount: 0, // not stored in chunk metadata
            loadedAt: Date.now(),
            chunkCount: count,
          })
        }
      }

      // Second pass: fix totalPages to be the max pageNumber per doc
      for (const item of allItems) {
        const meta = item.metadata as ChunkMetadata
        if (meta && meta.documentId && this.fileRegistry.has(meta.documentId)) {
          const fi = this.fileRegistry.get(meta.documentId)!
          if (meta.pageNumber > fi.totalPages) {
            fi.totalPages = meta.pageNumber
          }
        }
      }
    } catch {
      // Index may be empty or not yet created — that is fine
    }
  }

  async addDocument(doc: ParsedDocument, settings: AppSettings): Promise<FileInfo> {
    if (!this.index) {
      throw new Error('RagPipeline not initialized')
    }

    const chunks = this.chunkDocument(doc, settings.chunkSize, settings.chunkOverlap)
    const itemIds: string[] = []

    for (const chunk of chunks) {
      try {
        const embedding = await this.ollamaService.embed(
          chunk.text,
          settings.embedModel,
          settings.ollamaBaseUrl
        )
        const itemId = uuidv4()
        const meta: ChunkMetadata = { ...chunk, itemId }
        await this.index.insertItem({ id: itemId, vector: embedding, metadata: meta as unknown as Record<string, unknown> })
        this.chunkRegistry.set(itemId, meta)
        itemIds.push(itemId)
      } catch (err) {
        console.error(`Failed to embed chunk ${chunk.chunkIndex} of ${doc.fileName}:`, err)
      }
    }

    this.docChunkIds.set(doc.id, itemIds)

    const fileInfo: FileInfo = {
      id: doc.id,
      fileName: doc.fileName,
      filePath: doc.filePath,
      totalPages: doc.totalPages,
      wordCount: doc.wordCount,
      loadedAt: doc.loadedAt,
      chunkCount: itemIds.length,
    }

    this.fileRegistry.set(doc.id, fileInfo)
    return fileInfo
  }

  async removeDocument(fileId: string): Promise<void> {
    if (!this.index) {
      throw new Error('RagPipeline not initialized')
    }

    const itemIds = this.docChunkIds.get(fileId) || []
    for (const id of itemIds) {
      try {
        await this.index.deleteItem(id)
        this.chunkRegistry.delete(id)
      } catch (err) {
        console.error(`Failed to delete item ${id}:`, err)
      }
    }

    this.docChunkIds.delete(fileId)
    this.fileRegistry.delete(fileId)
  }

  async query(question: string, settings: AppSettings): Promise<QueryResult> {
    if (!this.index) {
      throw new Error('RagPipeline not initialized')
    }

    let queryEmbedding: number[]
    try {
      queryEmbedding = await this.ollamaService.embed(
        question,
        settings.embedModel,
        settings.ollamaBaseUrl
      )
    } catch (err) {
      throw new Error(`Failed to embed query: ${err}`)
    }

    let results: Array<{ item: { metadata: unknown }; score: number }> = []
    try {
      results = await this.index.queryItems(queryEmbedding, settings.topK)
    } catch {
      results = []
    }

    const retrievedChunks = results.map((r) => {
      const meta = r.item.metadata as ChunkMetadata
      return { ...meta, score: r.score }
    })

    // Build context
    const contextParts = retrievedChunks.map((chunk, idx) => {
      return `[${idx + 1}] File: ${chunk.fileName} | Page: ${chunk.pageNumber}\n${chunk.text}`
    })
    const context =
      contextParts.length > 0
        ? contextParts.join('\n\n---\n\n')
        : 'No relevant document excerpts were found.'

    const prompt = SYSTEM_PROMPT.replace('{context}', context).replace('{question}', question)

    let answer: string
    try {
      answer = await this.ollamaService.generate(prompt, settings.llmModel, settings.ollamaBaseUrl)
    } catch (err) {
      throw new Error(`Failed to generate answer: ${err}`)
    }

    const notFound =
      answer.toLowerCase().includes('i could not find') ||
      answer.toLowerCase().includes('no relevant') ||
      contextParts.length === 0

    const citations: Citation[] = retrievedChunks.map((chunk) => ({
      fileName: chunk.fileName,
      filePath: chunk.filePath,
      pageNumber: chunk.pageNumber,
      excerpt: chunk.text.slice(0, 300) + (chunk.text.length > 300 ? '...' : ''),
      score: chunk.score,
    }))

    return { answer, citations: notFound ? [] : citations, notFound }
  }

  getFiles(): FileInfo[] {
    return Array.from(this.fileRegistry.values())
  }

  private chunkDocument(
    doc: ParsedDocument,
    chunkSize: number,
    chunkOverlap: number
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = []
    let globalChunkIndex = 0

    for (const page of doc.pages) {
      const text = page.text
      if (!text || text.trim().length === 0) continue

      let start = 0
      while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length)
        const chunkText = text.slice(start, end).trim()

        if (chunkText.length > 0) {
          chunks.push({
            id: uuidv4(),
            documentId: doc.id,
            fileName: doc.fileName,
            filePath: doc.filePath,
            pageNumber: page.pageNumber,
            chunkIndex: globalChunkIndex++,
            text: chunkText,
            tokenCount: Math.ceil(chunkText.length / 4),
          })
        }

        if (end === text.length) break
        start = end - chunkOverlap
        if (start < 0) start = 0
      }
    }

    return chunks
  }
}

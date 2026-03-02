import { OllamaStatus, OllamaModel } from '../../../../shared/src/types'

export class OllamaService {
  async checkStatus(baseUrl: string, llmModel: string, embedModel: string): Promise<OllamaStatus> {
    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })

      if (!response.ok) {
        return {
          running: false,
          models: [],
          hasLlmModel: false,
          hasEmbedModel: false,
          llmModelName: llmModel,
          embedModelName: embedModel,
        }
      }

      const data = (await response.json()) as { models: Array<{ name: string; size: number; digest: string }> }
      const models: OllamaModel[] = (data.models || []).map((m) => ({
        name: m.name,
        size: m.size,
        digest: m.digest,
      }))

      const normalize = (name: string) => name.toLowerCase().replace(/:latest$/, '')
      const hasEmbedModel = models.some(
        (m) => normalize(m.name) === normalize(embedModel) || m.name.toLowerCase().startsWith(normalize(embedModel))
      )

      return {
        running: true,
        models,
        hasLlmModel: true, // LLM is now via HuggingFace API
        hasEmbedModel,
        llmModelName: llmModel,
        embedModelName: embedModel,
      }
    } catch {
      return {
        running: false,
        models: [],
        hasLlmModel: false,
        hasEmbedModel: false,
        llmModelName: llmModel,
        embedModelName: embedModel,
      }
    }
  }

  async embed(text: string, model: string, baseUrl: string): Promise<number[]> {
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Ollama embed error (${response.status}): ${err}`)
    }

    const data = (await response.json()) as { embedding: number[] }
    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Ollama returned no embedding')
    }
    return data.embedding
  }

}

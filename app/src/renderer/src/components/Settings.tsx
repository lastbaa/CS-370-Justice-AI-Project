import { useState } from 'react'
import { AppSettings } from '../../../../../shared/src/types'

interface Props {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
  onClose: () => void
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div>
      <label className="block text-sm font-medium text-[#ffffff] mb-1">{label}</label>
      {description && <p className="text-xs text-[#8b949e] mb-2">{description}</p>}
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}): JSX.Element {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#1e1e1e] bg-[#080808] px-3 py-2 text-sm text-[#ffffff] placeholder-[#8b949e] outline-none focus:border-[#c9a84c]/60 transition-colors"
    />
  )
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}): JSX.Element {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={min}
      max={max}
      className="w-full rounded-lg border border-[#1e1e1e] bg-[#080808] px-3 py-2 text-sm text-[#ffffff] outline-none focus:border-[#c9a84c]/60 transition-colors"
    />
  )
}

function SectionHeader({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8b949e] mb-4 pb-2 border-b border-[#1e1e1e]">
      {children}
    </h3>
  )
}

export default function Settings({ settings, onSave, onClose }: Props): JSX.Element {
  const [local, setLocal] = useState<AppSettings>({ ...settings })

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    setLocal((prev) => ({ ...prev, [key]: value }))
  }

  function handleSave(): void {
    onSave(local)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-[#1e1e1e] bg-[#0d0d0d] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e1e1e] px-6 py-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[#c9a84c]">
              <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.103-.303c-.066-.019-.176-.011-.299.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.212.224l-.288 1.107c-.17.645-.715 1.195-1.459 1.259a8.205 8.205 0 0 1-1.402 0c-.744-.064-1.289-.614-1.459-1.259l-.288-1.107c-.017-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.103.303c.066.019.176.011.299-.071.214-.143.437-.272.668-.386.133-.066.194-.158.212-.224l.288-1.107C6.01.645 6.556.095 7.299.03 7.53.01 7.765 0 8 0zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0zM8 5.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
            </svg>
            <h2 className="text-base font-semibold text-[#ffffff]">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8b949e] hover:bg-[#141414] hover:text-[#ffffff] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: '60vh' }}>
          {/* Model Configuration */}
          <div className="mb-6">
            <SectionHeader>Model Configuration</SectionHeader>
            <div className="flex flex-col gap-4">
              <Field
                label="LLM Model"
                description="The language model used to generate answers. Must be pulled in Ollama."
              >
                <TextInput
                  value={local.llmModel}
                  onChange={(v) => update('llmModel', v)}
                  placeholder="saul-7b"
                />
              </Field>
              <Field
                label="Embedding Model"
                description="The model used to embed document chunks and queries."
              >
                <TextInput
                  value={local.embedModel}
                  onChange={(v) => update('embedModel', v)}
                  placeholder="nomic-embed-text"
                />
              </Field>
              <Field
                label="Ollama Base URL"
                description="The URL where Ollama is running locally."
              >
                <TextInput
                  value={local.ollamaBaseUrl}
                  onChange={(v) => update('ollamaBaseUrl', v)}
                  placeholder="http://localhost:11434"
                />
              </Field>
            </div>
          </div>

          {/* RAG Configuration */}
          <div className="mb-6">
            <SectionHeader>RAG Configuration</SectionHeader>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Chunk Size" description="Characters per chunk (100–2000)">
                <NumberInput
                  value={local.chunkSize}
                  onChange={(v) => update('chunkSize', Math.max(100, Math.min(2000, v)))}
                  min={100}
                  max={2000}
                />
              </Field>
              <Field label="Chunk Overlap" description="Overlap between chunks (0–200)">
                <NumberInput
                  value={local.chunkOverlap}
                  onChange={(v) => update('chunkOverlap', Math.max(0, Math.min(200, v)))}
                  min={0}
                  max={200}
                />
              </Field>
              <Field label="Top-K Results" description="Chunks retrieved per query (1–20)">
                <NumberInput
                  value={local.topK}
                  onChange={(v) => update('topK', Math.max(1, Math.min(20, v)))}
                  min={1}
                  max={20}
                />
              </Field>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-lg border border-[#1e1e1e] bg-[#080808] px-4 py-3">
            <div className="flex items-start gap-2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="flex-shrink-0 mt-0.5 text-[#3fb950]"
              >
                <path d="M8.533.133a1.75 1.75 0 0 0-1.066 0l-5.25 1.68A1.75 1.75 0 0 0 1 3.48V7c0 1.566.832 3.125 2.561 4.608.458.391.978.752 1.535 1.078a11.865 11.865 0 0 0 2.904 1.218c1.11 0 3.028-.877 4.439-2.296C13.168 10.125 14 8.566 14 7V3.48a1.75 1.75 0 0 0-1.217-1.667L8.533.133zm-.61 1.429a.25.25 0 0 1 .153 0l5.25 1.68a.25.25 0 0 1 .174.237V7c0 1.32-.69 2.6-2.249 3.933C10.157 12.022 8.63 12.75 8 12.75c-.63 0-2.157-.728-3.251-1.817C3.19 9.6 2.5 8.32 2.5 7V3.48a.25.25 0 0 1 .174-.238z" />
              </svg>
              <div>
                <p className="text-xs font-medium text-[#3fb950] mb-1">Privacy Guarantee</p>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  All data remains on your machine. No network requests are made except to your local Ollama instance at the configured base URL. Your documents and queries never leave your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#1e1e1e] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#1e1e1e] bg-transparent px-4 py-2 text-sm text-[#8b949e] hover:text-[#ffffff] hover:border-[#8b949e] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#080808] hover:bg-[#e8c97e] transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

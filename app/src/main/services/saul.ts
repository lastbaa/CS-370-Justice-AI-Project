import { HfInference } from '@huggingface/inference'

const MODEL = 'Equall/Saul-7B-Instruct-v1'

export async function askSaul(
  systemPrompt: string,
  userQuestion: string,
  hfToken: string
): Promise<string> {
  if (!hfToken) {
    throw new Error('HuggingFace token is not configured. Open Settings to add your token.')
  }

  const hf = new HfInference(hfToken)

  const response = await hf.chatCompletion({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuestion },
    ],
    max_tokens: 1024,
  })

  return response.choices[0].message.content ?? ''
}

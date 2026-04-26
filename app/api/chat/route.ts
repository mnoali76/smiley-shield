import { createGateway } from 'ai'
import { streamText, convertToModelMessages, type UIMessage } from 'ai'

export const maxDuration = 30

const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY ?? '',
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: gateway('anthropic/claude-sonnet-4-6'),
    system: 'You are a helpful assistant.',
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}

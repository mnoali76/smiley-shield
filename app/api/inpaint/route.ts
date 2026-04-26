// Receives image + mask from the client, forwards to ClipDrop cleanup API,
// and streams back the cleaned image. All processing is server-side so the
// API key is never exposed to the browser.
export async function POST(req: Request) {
  const apiKey = process.env.CLIPDROP_API_KEY
  if (!apiKey) {
    return new Response('CLIPDROP_API_KEY not configured', { status: 500 })
  }

  const body = await req.formData()
  const image = body.get('image') as Blob | null
  const mask  = body.get('mask')  as Blob | null

  if (!image || !mask) {
    return new Response('image and mask are required', { status: 400 })
  }

  const form = new FormData()
  form.append('image_file', image, 'image.png')
  form.append('mask_file',  mask,  'mask.png')

  const response = await fetch('https://clipdrop-api.co/cleanup/v1', {
    method: 'POST',
    headers: { 'x-api-key': apiKey },
    body: form,
  })

  if (!response.ok) {
    const text = await response.text()
    return new Response(`ClipDrop error: ${text}`, { status: response.status })
  }

  const buffer = await response.arrayBuffer()
  return new Response(buffer, {
    headers: { 'Content-Type': 'image/png' },
  })
}

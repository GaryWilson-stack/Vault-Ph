import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'eyad-api-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/eyad', async (req, res) => {
            if (req.method === 'OPTIONS') {
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
              })
              res.end()
              return
            }

            if (req.method !== 'POST') {
              res.writeHead(405, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }))
              return
            }

            const apiKey = env.EYAD_STORE_API_KEY
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Server misconfiguration: EYAD_STORE_API_KEY is missing.' }))
              return
            }

            let bodyStr = ''
            req.on('data', chunk => {
              bodyStr += chunk
            })

            req.on('end', async () => {
              try {
                let parsed: any = {}
                if (bodyStr) {
                  try {
                    parsed = JSON.parse(bodyStr)
                  } catch {
                    parsed = {}
                  }
                }

                const endpoint = parsed.endpoint || 'capabilities'
                delete parsed.endpoint

                // Forward request to Eyad Store upstream
                const upstreamUrl = `https://reseller.eyadstore.gg/store/api/${endpoint.replace(/^\/+/, '')}`

                const response = await fetch(upstreamUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Store-Key': apiKey,
                    'User-Agent': 'VaultPH-DevServer/1.0'
                  },
                  body: JSON.stringify(parsed)
                })

                const data = await response.text()
                res.writeHead(response.status, {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                })
                res.end(data)
              } catch (err: any) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: err.message }))
              }
            })
          })
        }
      }
    ]
  }
})

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testDir = path.resolve(__dirname, '../../test')
const serverUrl = process.env.API_URL || http://localhost:/api/analyze

async function runTests() {
  if (!fs.existsSync(testDir)) {
    console.error(Test directory not found at: )
    return
  }

  const files = fs.readdirSync(testDir).filter((file) => file.match(/\.(jpg|jpeg|png|webp)$/i))
  const results = []

  console.log(Found  test images in \n)

  for (const file of files) {
    const filePath = path.join(testDir, file)
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('label', blob, file)

    console.log(Testing ...)
    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      const status = response.status

      results.push({ file, status, data })
      console.log(-> Status: )
      if (status === 200) {
        console.log(-> Success: Score /10)
      } else {
        console.log(-> Notice: )
      }
    } catch (err) {
      console.error(-> Request failed:, err.message)
      results.push({ file, error: err.message })
    }
  }

  const outputPath = path.resolve(__dirname, '../test_results.json')
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(\nTest results saved to )
}

runTests().catch(console.error)

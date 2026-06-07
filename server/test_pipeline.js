import fs from 'fs'
import path from 'path'

const testDir = '/data/PROJECTS/LabeLens/test'
const serverUrl = 'http://localhost:3001/api/analyze'

async function runTests() {
  const files = fs.readdirSync(testDir).filter(file => file.match(/\.(jpg|jpeg|png)$/i))
  const results = []

  console.log(`Found ${files.length} images to test.\n`)

  for (const file of files) {
    const filePath = path.join(testDir, file)
    const fileBuffer = fs.readFileSync(filePath)
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('label', blob, file)

    console.log(`Testing ${file}...`)
    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      const status = response.status
      
      results.push({
        file,
        status,
        data,
      })
      console.log(`-> Status: ${status}`)
      if (status === 400) {
        console.log(`-> Rejected: ${data.error}`)
      } else if (status === 200) {
        console.log(`-> Success: Score ${data.data?.overall_score}`)
      } else {
        console.log(`-> Unexpected:`, data)
      }
    } catch (err) {
      console.error(`-> Request failed:`, err.message)
      results.push({ file, error: err.message })
    }
  }

  const outputPath = '/data/PROJECTS/LabeLens/server/test_results.json'
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`\nTest results saved to ${outputPath}`)
}

runTests().catch(console.error)

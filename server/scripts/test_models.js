import 'dotenv/config'
import Groq from 'groq-sdk'
const groq = new Groq()
const models = await groq.models.list()
console.log(models.data.map(m => m.id))

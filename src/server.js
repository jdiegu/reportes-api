import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve('.env')
})

import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT

connectDB()

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})

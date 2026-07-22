import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve('.env')
})

import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT

async function start() {
  if (!PORT) {
    console.error('PORT no esta definido en las variables de entorno')
    process.exit(1)
  }
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
  })
}

start()

const {MongoClient} = require('mongodb')
const dotenv = require('dotenv')
dotenv.config()

const client = new MongoClient(process.env.CONNECTION_STRING)

async function start(){
  await client.connect()
  console.log("Connected to MongoDB")
  const app = require('./app')
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
  })
}

start().catch(err => {
  console.error("Failed to start:", err)
})

module.exports = client
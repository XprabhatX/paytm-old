import express from 'express'
import 'dotenv/config'
import cors from 'cors'

import connect from './utils/connect.js'
import router from './routes/index.js'

const app = express()

// middlewares
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.json({'message': 'paytm servers are healthy ✅'})
})

app.use('/api/v1', router)

app.listen(process.env.PORT, async () => {
    console.log('✔ server is initialized\n✔ listening on port: ' + process.env.PORT)
    await connect()
})
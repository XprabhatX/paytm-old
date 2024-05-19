import mongoose from 'mongoose'
import 'dotenv/config'

async function connect() {
    try {

        mongoose.connect(process.env.MONGO_URI, {
            dbName: 'paytm'
        })
        console.log('✔ connected to DB')
    } catch (error) {
        console.log('❌ problem connecting with DB. Error: ' + error)
        process.exit(1)
    }
}

export default connect
import mongoose from 'mongoose'
import User from './user.model.js'

const ObjectId = mongoose.Schema.Types.ObjectId

const accountSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        ref: User,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
})
const Account = mongoose.model('Account', accountSchema)

export default Account
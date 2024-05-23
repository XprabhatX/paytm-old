import { Router } from 'express'
import Account from '../model/account.model.js'
import authMiddleware from '../middleware.js'
import mongoose from 'mongoose'

const router = Router()

router.get('/balance', authMiddleware, async(req, res) => {
    const user = await Account.findOne({userId: req.userId})
    console.log(user)
    res.status(200).json({balance: user.balance})
})

router.put('/transfer', authMiddleware, async(req, res) => {
    const session = mongoose.startSession()

    session.startTransaction()
    const {to, amount} = req.body

    const sender = await Account.findOne({userId: req.userId}).session(session)
    if (!sender) res.status(411).json({message: "Sender's account doesn't exist!"})

    if (sender.balance < amount) return res.status(411).json({mssage: "Insufficient balance"})

    const receiver = await Account.findOne({userId: to}).session(session)

    if (!receiver) return res.status(411).json({message: "Receiver's account doesn't exist!"})

    await Account.updateOne({userId: req.userId},
        {
            $inc: {balance: -amount}
        }
    ).session(session)

    await Account.updateOne({userId: to},
        {
            $inc: {balance: amount}
        }
    ).session(session)

    await (await session).commitTransaction()
    res.status(200).json({message: "Transaction successful"})
})

export default router
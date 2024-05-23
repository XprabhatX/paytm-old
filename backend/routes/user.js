import { Router } from 'express'
import zod from 'zod'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import User from '../model/user.model.js'
import authMiddleware from '../middleware.js'
import Account from '../model/account.model.js'

const signUpBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})

const router = Router()

router.post('/signup', async (req, res) => {
    const { success } = signUpBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: 'Incorrect email input'
        })
    }

    const {username, firstName, lastName, password} = req.body

    const existingUser = await User.findOne({username})

    if (existingUser) {
        return res.status(411).json({
            message: 'Email already taken'
        })
    }
    
    
    const user = await User.create({
        username,
        firstName,
        lastName
    })
    
    // hashing the password
    const hashedPassword = await user.createHash(password)
    user.password = hashedPassword
    await user.save()
    const userId = user._id

    //setting random initial balance
    const randomBalance = Math.floor(Math.random() * 10000)
    await Account.create({
        userId,
        balance: randomBalance
    })

    // generating token
    const token = jwt.sign({
        userId
    }, process.env.JWT_SECRET)

    
    res.status(200).json({
        message: 'User created successfully',
        token
    })
})

router.post('/signin', async (req, res) => {
    let user = await User.findOne({username: req.body.username})

    if (!user) {
        return res.status(400).json({message: 'user not found'})
    }

    if (await (user.validatePassword(req.body.password))) {
        const userId = user._id
        const token = jwt.sign({
            userId
        }, process.env.JWT_SECRET)
        
        res.status(200).json({token})
    } else {
        res.status(400).json({message: 'incorrect username/password'})
    }
})

const updateBody = zod.object({
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
    password: zod.string().optional()
})

router.put('/', authMiddleware, async (req, res) => {
    console.log('Reached update request!')
    const { success } = updateBody.parse(req.body)

    if (!success) {
        res.status(411).json({message: 'Error while updating the data'})
    }

    await User.updateOne({_id: req.userId}, req.body)
    res.status(200).json({message: 'Successfully updated the data'})
})

router.get('/bulk', async (req , res) => {
    const filterName = req.query.filter || ""
    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filterName
            }
        }, {
            lastName: {
                "$regex": filterName
            }
        }]
    })


    res.status(200).json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })

})

export default router
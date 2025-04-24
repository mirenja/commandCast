import mongoose from 'mongoose'
import Schema from  'mongoose'

const userSchema = new mongoose.Schema({
    id : {type: Schema.Types.UUID, required: true, unique: true},
    name:  { type: String, required: true ,unique: true},
    email : { type: String, required: true ,unique: true},
    password : { type: String, required: true ,unique: true},
    role : { type: String, default: 'user' },
    },
    { timestamps: true })


export const User = mongoose.model('User', userSchema)
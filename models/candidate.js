const mongoose = require('mongoose');
const { type } = require('node:os');
const { stringify } = require('node:querystring');
// const bcrypt = require('bcrypt')
//create person schema

const candidateSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',    //reference
                required: true
            },
            votedAt:{
                type: Date,
                default: Date.now()
            }
        }
    ],
    voteCount:{
        type: Number,
        default:0
    }
})


const Candidate = mongoose.model('candidate', candidateSchema);
module.exports = Candidate;
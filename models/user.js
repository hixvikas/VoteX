    const mongoose = require('mongoose');
    const { type } = require('node:os');
    const { stringify } = require('node:querystring');
    const bcrypt = require('bcrypt')
    //create person schema

    const userSchema = new mongoose.Schema({
        name:{
            type: String,
            required: true
        },
        age:{
            type: Number,
            required: true
        },
        email:{
            type: String
        },
        mobile:{
            type: String
        },
        address:{
            type: String,
            required: true
        },
        aadharCardNumber:{
            type: Number,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        role:{
            type: String,
            enum: ['voter','admin'],
            default: 'voter'
        },
        isVoted:{
            type: Boolean,
            default: false
        }
    })

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
    } catch (error) {
        throw error;
    }
});

userSchema.methods.comparePassword = async function(candidatePassword){
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch; 
    } catch (error) {
        throw error;
    }
}

    const User = mongoose.model('User', userSchema);
    module.exports = User;
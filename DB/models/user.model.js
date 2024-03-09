import mongoose from "mongoose";
import bcrypt from "bcrypt";

import { systemRoles } from "../../src/utils/system_roles.js";

//============================== create the user schema ==============================//
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        minlength: [2, 'too short user name'],
        maxlength: [20, 'too short user name'],
        lowercase: true
    },
    email: {
        type: String,
        unique: [true, 'email is required'],
        trim: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
    },
    phonNumbers: [{
        type: String,
        required: true,
        unique: true
    }],
    age: {
        type: Number,
        min: 18,
        max: 80
    },
    address: [{
        street: String,
        city: String,
        homeName: String,
    }],
    role: {
        type: String,
        enum: [systemRoles.ADMIN, systemRoles.DELIVER_ROLE, systemRoles.SUPER, systemRoles.USER],
        default: systemRoles.USER
    },
    Active: {
        type: Boolean,
        default: true,
    },
    EmailVerified: {
        type: Boolean,
        default: false,
    },
    loggedIn: {
        type: Boolean,
        default: false,
    },
    wishlist: [{
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    }],
    isDeleted: {
        type: Boolean,
        default: false
    },
    resetPassword: {
        type: Boolean,
        default: false
    },
    changePasswordTime: Date,

}, { timestamps: true })

// hash password pre save
userSchema.pre('save', function () {
    if (this.password) this.password = bcrypt.hashSync(this.password, +process.env.SALT_ROUNDS)
})


userSchema.pre('findOneAndUpdate', function () {
    if (this._update.password) this._update.password = bcrypt.hashSync(this._update.password, +process.env.SALT_ROUNDS)
})

export default mongoose.models.User || mongoose.model('User', userSchema)


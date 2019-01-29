'use strict'

let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// create schema
let userSchema = new Schema({
	email: String,
	emailConfirmed: Boolean,
	pass: String,
	firstName: String,
	lastName: String,
	phone: String,
	bio: String,
	pictureUrl: String
});

userSchema.methods.toJSON = function() {
	let obj = this.toObject();
	let json = {
		id: obj._id,
		email: obj.email,
		firstName: obj.firstName,
		lastName: obj.lastName,
		phone: obj.phone,
		bio: obj.bio,
		pictureUrl: obj.pictureUrl
	}
	return json;
}

// create a model from schema
let User = mongoose.model('user', userSchema, 'user');

module.exports = User;

const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 5},
    name:{type: String}
});

module.exports = User = mongoose.model("user", userSchema);
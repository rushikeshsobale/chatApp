const mongoose = require("mongoose");

const newSchema = new mongoose.Schema({
    email: String,
    password:String,
})

const user = mongoose.model("user", newSchema);
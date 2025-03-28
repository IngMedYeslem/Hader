const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }] // 🔹 Référence vers la collection Role
});

const User = mongoose.model("User", userSchema);
module.exports = User;



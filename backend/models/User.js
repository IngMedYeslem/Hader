const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: String,
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }], // 🔹 Référence vers la collection Role
  isApproved: { type: Boolean, default: false }, // 🔹 Statut de validation pour les boutiques
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  linkedShopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" }, // 🔹 Liaison avec une boutique
  expoPushToken: { type: String } // 🔹 Token Expo pour notifications push
});

const User = mongoose.model("User", userSchema);
module.exports = User;



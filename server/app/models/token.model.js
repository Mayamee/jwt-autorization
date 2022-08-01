import pkg from "mongoose";
const { Schema, model } = pkg;

const TokenShema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  refreshToken: { type: String, required: true },
});

export default model("Token", TokenShema);

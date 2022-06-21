import mongoose from "mongoose";

let schema = mongoose.Schema({
    account: String,
    fullName: String,
    domain: String,
    port: String,
    displayName: String,
    userName: String,
    userId: String,
    password: String,
    passwords: String,
    wss: String,
    uri: String,
    sipServer: String
});

export default mongoose.model("account", schema);

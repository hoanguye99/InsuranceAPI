import mongoose from "mongoose";

let schema = mongoose.Schema({
    conversationId: String,
    fromCustomer: String,
    toCustomer: String,
    content: String,
    type: String, // IMAGE, TEXT,...
    image: String,
    createdDate: Date
});

export default mongoose.model("conversations", schema);

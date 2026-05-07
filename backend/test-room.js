const mongoose = require("mongoose");
const Room = require("./models/Room");

mongoose.connect("mongodb://localhost:27017/gamified-productivity-tool")
  .then(async () => {
    try {
      const newRoom = new Room({
        name: "TestRoom",
        code: "TES-" + Math.floor(100 + Math.random() * 900),
        isPrivate: false,
        topic: "Test",
        members: []
      });
      const room = await newRoom.save();
      console.log("Success:", room);
    } catch (err) {
      console.error("Error saving room:", err);
    }
    mongoose.disconnect();
  })
  .catch(err => console.error("MongoDB connection error:", err));

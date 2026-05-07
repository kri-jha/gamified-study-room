const mongoose = require("mongoose");
const Room = require("./models/Room");

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/gamified-productivity-tool")
  .then(async () => {
    try {
      const rooms = await Room.find({});
      console.log(`Total rooms: ${rooms.length}`);
      rooms.forEach(r => console.log(`${r.name} - ${r.code}`));
    } catch (err) {
      console.error(err);
    }
    mongoose.disconnect();
  });

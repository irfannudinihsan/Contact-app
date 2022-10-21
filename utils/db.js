const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/dataku", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});



//menambah 1 data

// const contact1 = new Contact({
//   nama: "nudin",
//   nomor: "085831008476",
//   email: "nudin@gmail.com",
// });

// contact1.save().then((contact) => console.log(contact));

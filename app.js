const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");

const { body, validationResult, check } = require("express-validator");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

//call express
const app = express();
const port = 3000;

//setup method override
app.use(methodOverride("_method"));

//setup ejs
app.set("view engine", "ejs"); //mengunakan ejs
app.use(expressLayouts); //third party middleware
app.use(express.static("public")); //built in middleware
app.use(express.urlencoded({ extended: true })); //built in middleware

//konfigutasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

//halaman home
app.get("/", (req, res) => {
  const contentHome = [
    {
      titleContenttHome: "Contact App",
      contentContentHome: "Aplikasi Kelola Kontak Anda",
    }
  ];

  res.render("index", {
    layout: "layouts/main-layout",
    nama: "irfan",
    title: "halaman Home",
    contentHome : contentHome,
  });
  console.log("ini halaman home");
});

//halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "halaman about",
  });
});

//halaman contact
app.get("/contact", async (req, res) => {
  const contacts = await Contact.find();

  res.render("contact", {
    title: "halaman contact",
    layout: "layouts/main-layout",
    contacts,
    msg: req.flash("msg"),
  });
});

//form tambah data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "tambah contact",
  });
});

//proses tambah data contact
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (duplikat) {
        throw new Error("kontak sudah digunakan");
      }
      return true;
    }),
    check("nomor", "no hp tak valid").isMobilePhone("id-ID"),
    check("email", "email gak valid").isEmail(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        req.flash("msg", "data kontak berhasil ditambahkan");
        res.redirect("/contact");
      });
    }
  }
);

//edit
//edit contact
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });
  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "edit contact",
    contact: contact,
  });
});

// proses ubah data update
app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("kontak sudah digunakan");
      }
      return true;
    }),
    check("email", "email gak valid").isEmail(),
    check("nomor", "no hp tak valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "form ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body },
        {
          $set: {
            nama: req.body.nama,
            nomor: req.body.nomor,
            email: req.body.email,
          },
        }
      ).then((result) => {
        req.flash("msg", "data kontak berhasil diubah");
        res.redirect("/contact");
      });
    }
  }
);

app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "data kontak berhasil dihapus");
    res.redirect("/contact");
  });
});

//detail
app.get("/contact/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "halaman Detail Contact",
    contact: contact,
  });
});

app.listen(port, () => {
  console.log(`mongo contact app | listen at http://localhost:${port}`);
});

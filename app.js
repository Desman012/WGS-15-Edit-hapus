// memanggil module express
const express = require("express");

// memanggil local mmodule function
const func = require("./function");

// memanggil module express-validator untuk validasi data
const { body, check, validationResult } = require("express-validator");

// memanggil modul morgan
const morgan = require("morgan");

// memanggil module expressLayouts dengan require
const expressLayouts = require("express-ejs-layouts");

// membuat variable untuk menampung function express
const app = express();

// membuat variable untuk port
const port = 3000;

// memakai fungsi view engine dengan ejs
app.set("view engine", "ejs");

//memanggil file ejs-layout.ejs
app.set("layout", "layout/ejs-layout.ejs");

// menggunakan express-layout
app.use(expressLayouts);

// memakai module morgan
app.use(morgan("dev"));

//menjadikan folder 'public' menjadi public
app.use(express.static("views/public"));

//memakai fungsi urlencoded untuk mengubah format
app.use(express.urlencoded({ extended: true }));

//menerima request dari client
app.get("/", (req, res) => {
  // membuat nilai object ke index dengan ejs
  res.render("index", { nama: "desman", title: "Halaman index" });
});

// menerima request about
app.get("/about", express.static(__dirname + "/about.ejs"), (req, res) => {
  res.render("about", { title: "Halaman About" });
});

//menerima request contact
app.get("/contact", (req, res) => {
  //menjadikan function show menjadi varible contacts
  const contacts = func.show();
  //   menampilkan file contact dan memasukan variable cont ke contact dengan ejs
  res.render("contact", { contacts, title: "Halaman Content" });
});

//menerima request contact
app.get("/add", (req, res) => {
  //   menampilkan file contact dan memasukan variable cont ke contact dengan ejs
  res.render("add", { title: "Halaman add" });
});

app.post(
  "/added",
  [
    body("nama").custom((value) => {
      const dupe = func.detail(value);
      if (dupe) {
        throw new Error("Data already exists");
      }
      return true;
    }),
    // mengecek format data dengan validator
    check("nama", "format name is wrong").isAlpha("en-US", { ignore: " " }).isLength({ min: 3 }).withMessage("minimal length name is 3"),
    check("email", "email not valid").isEmail(),
    check("mobile", "mobile phone not valid").isMobilePhone("id-ID").isLength({ max: 12 }).withMessage("phone number max length 12"),
  ],

  (req, res) => {
    // menangkap hasil validator jika terjadi salah format data
    const errors = validationResult(req);

    // jika data salah format
    if (!errors.isEmpty()) {
      // memanggil file add dan memasukan variable error
      res.render("add", { errors: errors.array(), title: "halaman add" });
      // menampilkan nilai variable error ke terminal
      console.log(errors.array());

      // jika tidak terjadi error
    } else {
      // memanggil fungsi untuk menyimpan data ke json
      console.log(errors.array());
      func.savedata(req.body.nama, req.body.email, req.body.mobile)
      // mengalihkan ke file contact
      res.redirect("contact");
    }
  }
);

app.post("/delete", (req, res) => {
  func.deleted(req.body.dlt);
  res.redirect("contact");
});

app.get("/edit/:nama", (req, res) => {
  // memanggil fungsi detail dan memasukkan ke variable getDetail
  const getDetail = func.detail(req.params.nama);
  console.log("test", getDetail);
  const params = req.params.nama;

  if(!getDetail){
    res.redirect('/error')
  }

  // menampilkan file detail, dan memasuk variable getDetail dan title
  res.render("edit", { getDetail, title: "Halaman Edit", params });
});

app.post(
  "/update/:nama",
  [
    body("nama").custom((value, {req}) => {
      const dupe = func.detail(value);
      if (value == dupe && value != req.params.nama) {
        throw new Error("Data already exists");
      }
      return true;
    }),
    // mengecek format data dengan validator
    check("nama", "format name is wrong").isAlpha("en-US", { ignore: " " }).isLength({ min: 3 }).withMessage("minimal length name is 3"),
    check("email", "email not valid").isEmail(),
    check("mobile", "mobile phone not valid").isMobilePhone("id-ID").isLength({ max: 12 }).withMessage("phone number max length 12"),
  ],

  (req, res) => {
    // menangkap hasil validator jika terjadi salah format data
    const errors = validationResult(req);
    const params = req.params.nama;

    getDetail = {
      name: req.body.nama,
      email: req.body.email,
      tlp: req.body.mobile,
    };
    // jika data salah format

    if (!errors.isEmpty()) {
      // memanggil file add dan memasukan variable error
      res.render("edit", { errors: errors.array(), title: "halaman edit", getDetail, params });
      // menampilkan nilai variable error ke terminal
      console.log(errors.array());

      // jika tidak terjadi error
    } else {
      func.update(req.body.nama, req.body.email, req.body.mobile, req.params.nama);
      // mengalihkan ke file contact
      res.redirect("/contact");
    }
  }
);

// use untuk pemanggilan path apapun
app.use("/", (req, res) => {
  //menyetting status html menjadi 404 (not found)
  res.status(404);
  // menuliskan di web browser 'Page not found'
  res.send("Page not found 404");
});

// membaca port
app.listen(port, () => {
  // memunculkan tulisan diterminal
  console.log(`Example app listening on port ${port}`);
});

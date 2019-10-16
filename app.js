//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const app = express();

// Connection URL to Database
const url = 'mongodb://localhost:27017';
mongoose.connect(url + '/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemSchema = new mongoose.Schema({
  task: {
    type: String,
    required: [true, "why no task!"]
  }
});

const Item = mongoose.model('Item', itemSchema);
const WorkItem = mongoose.model('WorkItem', itemSchema);


Item.estimatedDocumentCount((err, num) => {
  console.log("number of docs is : " + num);
  if (num === 0) {
    Item.insertMany([{
      task: "Buy Food"
    }, {
      task: "Cook Food"
    }, {
      task: "Eat Food"
    }], (err, docs) => console.log("inserted !!!"));
  } else {
    console.log("already default !!!");
  }
});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {

  const day = date.getDate();

  Item.find(function (err, docs) {
    res.render("list", {
      listTitle: day,
      newListItems: docs
    });

  });

  //res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  console.log("list : " + req.body.list);
  if (req.body.list === "Work") {

    WorkItem.insertMany([{
      task: item
    }], (err, docs) => res.redirect("/work"));
  } else {
    // items.push(item);

    Item.insertMany([{
      task: item
    }], (err, docs) => res.redirect("/"));
    //res.redirect("/");
  }
});

app.get("/:route", (req, res) => {
res.send(req.params);
});



// app.get("/work", function (req, res) {

//   WorkItem.find(function (err, docs) {
//     res.render("list", {
//       listTitle: "Work List",
//       newListItems: docs.map(e => e.task)
//     });

//   });
// });

// app.get("/about", function (req, res) {
//   res.render("about");
// });

app.post("/delete", function (req, res) {
  console.log(req.body);
  Item.deleteOne({
    _id : req.body.item
  }, (err, docs) => {
    if (err) {
      console.log(err);
    } else {
      console.log("succefuly deleted !");
    }
    res.redirect("/");
  });
});



app.listen(3000, function () {
  console.log("Server started on port 3000");
});
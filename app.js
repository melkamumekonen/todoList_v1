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
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const Item = mongoose.model('Item', itemSchema);
const List = mongoose.model("List", listSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


app.get("/", function (req, res) {
  const day = date.getDate();

  Item.find(function (err, docs) {
    res.render("list", {
      listTitle: "Today",
      newListItems: docs
    });
  });
});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  console.log("list : " + req.body.list);

  List.findOne({
    name: req.body.list
  }, (err, doc) => {
    if (err) {
      console.log("error find!!!!");
    } else {
      if (!doc) {
        Item.estimatedDocumentCount((err, num) => {
          console.log("number of docs is : " + num);
          if (num === 0) {
            Item.insertMany([{
              task: "Buy Food"
            }, {
              task: "Cook Food"
            }, {
              task: "Eat Food"
            }], (err, docs) => {
              console.log("inserted !!!");
              res.redirect("/");
            });
          } else {
            console.log("already default !!!");
            Item.insertMany([{
              task: item
            }], (err, docs) => {
              console.log("inserted !!!");
              res.redirect("/");
            });
          }
        });
      } else {
        console.log("found item for updating!!!!");
        const newIt = new Item({
          task: item
        });
        doc.updateOne({
          $push: {
            items: newIt
          }
        }, (err, docs) => {
          console.log("updated successfuly!!!")
          res.redirect("/" + doc.name);

        });
      }
    }
  });
});
app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/:route", (req, res) => {
  const costumListName = req.params.route;
  console.log("route is : " + req.params.route);
  List.findOne({
    name: costumListName
  }, (err, doc) => {
    console.log("doc is : " + doc);
    if (err) {
      console.log("error finding document!!");
    } else {
      if (!doc) {
        console.log("not found!!!");
        const list = new List({
          name: costumListName,
          items: []
        });
        list.save().then(() => {
          res.redirect("/" + costumListName);
        });
      } else {
        console.log("found!!!!" + doc);
        res.render("list", {
          listTitle: doc.name,
          newListItems: doc.items
        });


      }
    }
  });
});

app.post("/delete", function (req, res) {
  console.log("delete params : " + JSON.stringify(req.body));
  const list = req.body.listName;
  if (list === "Today") {
    Item.deleteOne({
      _id: req.body.item
    }, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        console.log("succefuly deleted !");
      }

      Item.estimatedDocumentCount((err, num) => {
        console.log("number of docs is : " + num);
        if (num === 0) {
          Item.insertMany([{
            task: "Buy Food"
          }, {
            task: "Cook Food"
          }, {
            task: "Eat Food"
          }], (err, docs) => {
            console.log("inserted !!!");
            res.redirect("/");
          });
        } else {
          console.log("already default !!!");
          res.redirect("/");
        }
      });
    });
  } else {

    List.findOneAndUpdate({
        name: list
      }, {
        $pull: {
          items: {
            _id: req.body.item
          }
        }
      }, (err, docs) => {
        if (!err)
          res.redirect("/" + list);
      }

    );
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

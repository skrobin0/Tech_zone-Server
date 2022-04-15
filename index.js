const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { query } = require("express");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//Middleware----

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkvef.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

console.log(uri);

async function run() {
  try {
    await client.connect();
    //   console.log("con to db");
    const database = client.db("TechZoneShop");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("orders");
    const adminCollection = database.collection("admins");
    const reviewCollection = database.collection("review");

    // Get Products data
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const page = req.query.page;
      const size = parseInt(req.query.size);

      let products;
      const count = await cursor.count();

      if (page) {
        products = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        products = await cursor.toArray();
      }

      res.send({
        count,
        products,
      });
    });

    // Use post to get data by keys
    app.post("/products/byKeys", async (req, res) => {
      const keys = req.body;
      const query = { key: { $in: keys } };
      const products = await productCollection.find(query).toArray();
      res.json(products);
    });

    // Add client orders place
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    //User order
    app.get("/orders/:email", async (req, res) => {
      const result = await orderCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
      // console.log(req.params.email);
    });

    //Delete User order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    //Get all users register order
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
      console.log(result);
    });

    //  make admin
    // app.put("/admins", async (req, res) => {
    //   const admin = req.body;
    //   console.log("put", admin);
    //   const filter = { email: admin.email };
    //   const result = await adminCollection.find(filter).toArray();
    //   if (result) {
    //     const documents = await adminCollection.updateOne(filter, {
    //       $set: { role: "admin" },
    //     });
    //     res.json(documents);
    //   }
    // });

    app.post("/admins", async (req, res) => {
      console.log("req.body");
      const result = await adminCollection.insertOne(req.body);
      res.send(result);
      console.log(result);
    });

    //admin verification
    app.get("/admins/:email", async (req, res) => {
      const result = await adminCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });

    //Get single Product cart
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log("hit the id", id);
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.json();
    });

    //Get register order
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
      console.log(result);
    });

    //Delete All order{admin}
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    //Manage Services
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.json(result);
    });

    //Post watches data
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log("hit post api", product);
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });

    //post review
    app.post("/review", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    //Get review
    app.get("/review", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Tech-Zone-Server running server");
});

app.listen(port, () => {
  console.log("Tech-Zone-Server running server port", port);
});

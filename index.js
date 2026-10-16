const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

app.get("/", (req, res) => {
  res.send("smart server running ");
});

async function run() {
  try {
    const database = client.db("smart_deals_db");
    const productCollations = database.collection("products");
    const bidCollections = database.collection("bid_data");
    const userCollections = database.collection("users");

    app.get("/products", async (req, res) => {
      console.log(req.query.email);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productCollations.find(query);

      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/latest-products", async (req, res) => {
      const cursor = productCollations.find().sort({ created_at: 1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollations.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollations.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const UpdateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: { products: UpdateProduct.products, Price: UpdateProduct.Price },
      };
      const option = {};
      const result = await productCollations.updateOne(query, update, option);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollations.deleteOne(query);
      res.send(result);
    });

    //bid related
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      // console.log("New Bid Data:", newBid);
      const result = await bidCollections.insertOne(newBid);
      res.send(result);
    });

    app.get("/productsBids/:productID", async (req, res) => {
      try {
        const productID = req.params.productID;
        const query = { product: productID };

        const result = await bidCollections
          .find(query)
          .collation({ locale: "en", numericOrdering: true })
          .sort({ bid_price: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Failed to fetch bids:", error);
        res.status(500).send({ message: "Failed to fetch bids" });
      }
    });

    app.get("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidCollections.findOne(query);
      res.send(result);
    });

    app.get("/bids", async (req, res) => {
      try {
        const email = req.query.email;
        const query = {};

        if (email) {
          query.buyer_email = email;
        }

        const result = await bidCollections
          .find(query)
          .sort({ bid_price: -1 })
          .toArray();

        res.send(result);
      } catch (error) {
        console.error("Failed to fetch bids:", error);
        res.status(500).send({ message: "Failed to fetch bids" });
      }
    });

    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidCollections.insertOne(newBid);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidCollections.deleteOne(query);
      res.send(result);
    });

    // user related

    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = newUser.eamil;
      const query = { email: email };
      const existing = userCollections.findOne(query);

      if (existing) {
        res.send({ message: "eamil already existing" });
      } else {
        const result = await userCollections.insertOne(newUser);
        res.send(result);
      }
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB! with ping-1");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, (res, req) => {
  console.log(`smart server running on port: ${port}`);
});

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(
  "REDACTED_MONGODB_URI",
);

app.get("/", (req, res) => {
  res.send("smart server running ");
});

async function run() {
  try {
    const database = client.db("smart_deals_db");
    const productCollations = database.collection("products");

    app.get("/products", async (req, res) => {
      const cursor = productCollations.find();
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

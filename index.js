const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("re Cell server running");
});

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gghczmk.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// collections
const categoriesCollection = client.db("reCell").collection("categories");
const productsCollection = client.db("reCell").collection("products");

// products category

app.get("/categories", async (req, res) => {
  try {
    const result = await categoriesCollection.find({}).toArray();
    res.send({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(port, () => {
  console.log(`server running on ${port}`);
});

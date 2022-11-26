const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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
const usersCollection = client.db("reCell").collection("users");
const bookingsCollection = client.db("reCell").collection("bookings");
const advertiesCollection = client.db("reCell").collection("advertises");

// get all users
app.get("/users", async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.send(users);
  } catch (error) {
    console.error(error);
  }
});

// user post to db
app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const query = { userEmail: user.userEmail };
    const alreadyAUser = await usersCollection.findOne(query);
    if (alreadyAUser) {
      return;
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  } catch (error) {
    console.error(error);
  }
});

// seller role get
app.get("/users/seller/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: email };
    const user = await usersCollection.findOne(query);
    res.send({ isSeller: user?.role === "Seller" });
  } catch (error) {
    console.error(error.message);
  }
});

//  admin role get
app.get("/users/admin/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const query = { userEmail: email };
    const user = await usersCollection.findOne(query);
    res.send({ isAdmin: user?.role === "Admin" });
  } catch (error) {
    console.error(error.message);
  }
});

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

// individual category products
app.get("/categories/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { categoryId: id };
    const result = await productsCollection.find(query).toArray();
    res.send({
      status: "success",
      data: result,
    });
  } catch (error) {
    console.error(error.message);
  }
});

// product post by seller

app.post("/products", async (req, res) => {
  try {
    const productData = req.body;
    const result = await productsCollection.insertOne(productData);
    res.send(result);
  } catch (error) {
    console.error(error.message);
  }
});

// get products by email

app.get("/products", async (req, res) => {
  try {
    const email = req.query.email;
    const query = { sellerEmail: email };
    const result = await productsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error(error.message);
  }
});

// delete product
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const allFilter = { productId: id };

    const productResult = await productsCollection.deleteOne(filter);
    const bookingResult = await bookingsCollection.deleteOne(allFilter);
    const advertiseResult = await advertiesCollection.deleteOne(allFilter);
    res.send({ productResult, bookingResult, advertiseResult });
  } catch (error) {
    console.error(error.message);
  }
});
// individual products
app.get("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await productsCollection.findOne(query);
    res.send({
      status: "success",
      data: result,
    });
  } catch (error) {}
});

// products bookings by user
app.post("/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    console.log(bookingData);
    const result = await bookingsCollection.insertOne(bookingData);
    res.send({
      status: "success",
      data: result,
      message: `Your booking on ${bookingData?.productName} is successfull`,
    });
  } catch (error) {
    console.error(error.message);
  }
});

// get booking by email
app.get("/bookings", async (req, res) => {
  const email = req.query.email;
  const query = { buyerEmail: email };
  const result = await bookingsCollection.find(query).toArray();
  res.send(result);
});
// advertise post
app.post("/advertises", async (req, res) => {
  const advertiseProduct = req.body;
  const query = { productName: advertiseProduct.productName };
  const alreadyAdvertised = await advertiesCollection.findOne(query);
  if (alreadyAdvertised) {
    return res.send({ alreadyAdvertised, message: "Already Advertised" });
  }
  const result = await advertiesCollection.insertOne(advertiseProduct);
  res.send(result);
});
// adverties get
app.get("/advertises", async (req, res) => {
  try {
    const result = await advertiesCollection
      .find({})
      .sort({ postedDate: -1 })
      .toArray();
    res.send(result);
  } catch (error) {
    console.error(error.message);
  }
});
app.listen(port, () => {
  console.log(`server running on ${port}`);
});

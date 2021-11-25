const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.muk27.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const run = async () => {
  try{
    await client.connect();
    
    const database = client.db("bi-bike-online");
    const bikeCollection = database.collection("bikes");
    const userCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");
    const orderCollection = database.collection("orders");
    const addtocartCollection = database.collection("addtocart");

    // await bikeCollection.insertOne({})

    // load all bikes
    app.get('/bikes', async (req, res)=> {
        const result = await bikeCollection.find({}).toArray();
        res.json(result)
    });
    // delete a bike
    app.delete('/bikes/:id', async (req, res)=> {
      const id = req.params.id;
      const query = {_id : ObjectId(id)}
        const result = await bikeCollection.deleteOne(query);
        res.json(result)
    });


    // load a single bike by id
    app.get('/details/:id', async (req, res) => {
      const id = req.params.id;
      const bikeId = {_id : ObjectId(id)};
      const result = await bikeCollection.findOne(bikeId);
      res.json(result)
    });

    // add a product by admin
    app.post("/add-bike", async (req, res) => {
      const bike = req.body;
      const result = await bikeCollection.insertOne(bike);
      res.json(result);
    });

    // load my added bikes
    app.get("/my-added/:email", async (req, res) => {
      const email = req.params.email;
      const filter = {author : email};
      const result = await bikeCollection.find(filter).sort({_id: -1}).toArray();
      res.json(result);
    })

    // get all reviews 
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).sort({_id:-1}).toArray();
      res.json(result);
    });

    // post a review
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    })

    // place order
    app.post("/place-order", async (req, res) => {
      const order = (req.body);
      const result = await orderCollection.insertOne(order);
      res.json(result)
    });

    // store user email password register
    app.post("/users", async (req, res) => {
      const userInfo =req.body;
      console.log(userInfo)
      if(userInfo.email){
        const newUser = {
          name:userInfo.displayName,
          email:userInfo.email,
          photo:userInfo.photoURL,
          isVeryfied: userInfo.emailVerified,
          accountCreat : userInfo.createdAt
        }
        const result = await userCollection.insertOne(newUser);
        res.json(result)
      }
    });

    // save user who register by google
    app.put("/users", async (req, res)=> {
      const userInfo = req.body;
      if(userInfo.email){
        const newUser = {
          name:userInfo.displayName,
          email:userInfo.email,
          photo:userInfo.photoURL,
          isVeryfied: userInfo.emailVerified,
          accountCreat : userInfo.createdAt
        }
        const filter = {email:userInfo.email};
        const option = {upsert : true};
        const updatedUser = {$set : newUser};
        const result = await userCollection.updateOne(filter, updatedUser, option);
        res.json(result)
      }
    });

    // load users
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email : email};
      const result = await userCollection.findOne(query);
      res.json(result);
    });
    // make admin
    app.post("/users/admin", async (req, res) => {
      const email = req.body;
      console.log(email.adminRequestEmail)
      const query = {email : email.adminRequestEmail};
      const updated = {$set : {userRole : "admin"}}
      const result = await userCollection.updateOne(query, updated);
      res.json(result);
    });

    // load orders
    app.get("/orders", async (req, res) => {
      const result = await orderCollection.find({}).sort({_id:-1}).toArray();
      res.json(result);
    });

    // load individuals orders
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = {email:email}
      const result = await orderCollection.find(query).sort({_id:-1}).toArray();
      res.json(result);
    });

    // delete a order
    app.delete("/delete-order/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const result = await orderCollection.deleteOne(query);
      res.json(result)
    });

    // update order status
    app.put("/status-update", async (req, res) => {
      const {reqStatus, orderStatusId }=req.body;
      const filter = {_id: ObjectId(orderStatusId)};
      const updatedStatus = {$set : {status : reqStatus}};
      const result = await orderCollection.updateOne(filter, updatedStatus)
      res.json(result)
    });


    // save add to cart 
    app.post("/addtocart", async(req, res) => {
      const bike = req.body;
      const result = await addtocartCollection.insertOne(bike)
      res.json(result)
    });

    


  }
  finally{
    // await client.close();
  }
}

run().catch(console.dir);

app.get('/', (req, res)=> {
  console.log("Bi-bike surver is working perfectly!")
  res.send("Cycle Server running")
})


app.listen(port, ()=>{
  console.log("Bi-bike server is running now!!!", port)
})
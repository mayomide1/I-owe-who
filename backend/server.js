require("dotenv").config();
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const Person = require("./person.js")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/people", async (req, res) => {
    try{
    const person = await Person.find()
    res.status(200).json(person)
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

app.post("/people", async (req, res) => {
    try{
    const person = await Person.create({
        name: req.body.name,
        amount: 0,
        notifications: []
    })
    res.status(200).json(person)
}catch(error){
    res.status(500).json({error: error.message})
}
})

app.put("/people/:id", async (req, res) => {
    try{
    const {name, amount} = req.body

       const person = await Person.findById(req.params.id)

       if(!person) { 
        res.status(400).json({message: "No user found!"})
       }

    if (name !== undefined) person.name = name
    if (amount !== undefined) person.amount = amount

    await person.save()
       
    res.status(200).json(person)
       
    }catch(error){
        res.status(500).json({error: error.message})
    }
})


app.delete("/people/:id", async (req, res) => {
    try{  
        const person = await Person.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "User Deleted"})

    }catch(error){
        res.status(400).json({error: error.message})
    }
})

PORT = process.env.PORT || 5000

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("error:", err.message);
    process.exit(1);
  });
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

function calculateBalance(notifications) {
    return notifications.reduce((sum, n) => {
        const value = Number(n.amount) || 0;
        if (n.label === "received") return sum + value;
        if (n.label === "sent")     return sum - value;
        return sum;
    }, 0);
}

app.get("/people/:id", async (req, res) => {
    try{
    const id = req.params.id
    const person = await Person.findById(id)
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

app.delete("/people/:id", async (req, res) => {
    try{  
        const person = await Person.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "User Deleted"})

    }catch(error){
        res.status(400).json({error: error.message})
    }
})

app.get("/people/:id/notifications", async (req, res) => {
  try {
    const id = req.params.id;
    const person = await Person.findById(id);
    if (!person) {
      return res.status(404).json({ message: "No user found!" });
    }
    res.status(200).json(person);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/people/:id/notifications", async (req, res) => {
    try{
    const {amount, note, label} = req.body
    const id = req.params.id
    const person = await Person.findById(id)

       if(!person) { 
        return res.status(400).json({message: "No user found!"})
       }

        person.notifications.push({
            amount: amount.trim(),
            note: note.trim(),
            label: label.toLowerCase(),
            date: new Date().toLocaleDateString('en-CA'),
        })

    person.amount = calculateBalance(person.notifications);

    await person.save()
       
    res.status(200).json(person)
       
    }catch(error){
        res.status(500).json({error: error.message})
    }
})

app.delete("/people/:personId/notifications/:notificationId", async (req, res) => {
    try {
        const { personId, notificationId } = req.params;

        const person = await Person.findById(personId);
        if (!person) {
            return res.status(404).json({ message: "No user found!" });
        }

        const notif = person.notifications.id(notificationId);
        if (!notif) {
            return res.status(404).json({ message: "Notification not found!" });
        }

        notif.deleteOne();

        person.amount = calculateBalance(person.notifications);
        await person.save();

        res.status(200).json(person);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.put("/people/:id", async (req, res) => {
    try{
    const {amount, note, label} = req.body
    const id = req.params.id
       const person = await Person.findById(id)

       if(!person) { 
        res.status(400).json({message: "No user found!"})
       }

    if (id !== undefined){
        person.notifications = {
            id: new Date(),
            amount: amount,
            note: note,
            label: label,
            date: new Date().toLocaleDateString('en-CA'),
        }
    }

    await person.save()
       
    res.status(200).json(person)
       
    }catch(error){
        res.status(500).json({error: error.message})
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
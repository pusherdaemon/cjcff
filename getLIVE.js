const { MongoClient, ObjectID } = require('mongodb');
const fs                        = require('fs');
const config                    = require('./config/config.json');
const unique                    = require('array-unique');

async function connectDB() {
    const uri = `mongodb+srv://${config.username.split('@')[0]}:${config.username.split('@')[1]}@cluster0.ugpyd.mongodb.net/${config.username.split('@')[0]}?retryWrites=true&w=majority`,
       client = new MongoClient(uri, { useUnifiedTopology: true }, { useNewUrlParser: true });

    await client.connect()

    return client
}

async function getLIVE(){
    const client = await connectDB()
    const gcollection = await client.db(config.username).collection("ccnGEN");


    let result = await gcollection.find({status: true}).toArray()

    result.forEach(element => {
        console.log(`${element.bin}|${element.month}|${element.year}`)
    })
}

getLIVE()


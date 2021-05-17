const { MongoClient, ObjectID } = require('mongodb');
const fs                        = require('fs');
const config                    = require('../config/config.json');
const unique                    = require('../node_modules/array-unique');

async function connectDB() {
    const uri = `mongodb+srv://${config.username.split('@')[0]}:${config.username.split('@')[1]}@cluster0.ugpyd.mongodb.net/${config.username.split('@')[0]}?retryWrites=true&w=majority`,
       client = new MongoClient(uri, { useUnifiedTopology: true }, { useNewUrlParser: true });

    await client.connect()

    return client
}

async function getOneCCN(){
    const client = await connectDB()
    const gcollection = await client.db(config.username).collection("ccnGEN");

    var value = await gcollection.findOneAndUpdate ({status: 'fresh'}, {$set:{status: 'process'}}) 

    await client.close()

    return value.value
}

async function insertResultCCN(value, result){
    const client = await connectDB()
    const gcollection = await client.db(config.username).collection("ccnGEN");

    await gcollection.findOneAndUpdate ({status: 'process', bin: `${value.bin}`}, {$set:{status: result}}) 

    await client.close()
}

async function insertOne(data) {
    const client = await connectDB()
    const hcollection = await client.db(`${config.username.split('@')[0]}`).collection("Hashing");
    await hcollection.insertOne({
        hashData: data
    })
    await client.close()
}

module.exports = {
    getOneCCN: getOneCCN,

    insertResultCCN: insertResultCCN,

    insertOne: insertOne,
}

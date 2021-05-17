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

async function insertValue(path){
    const client = await connectDB()
    const gcollection = await client.db(config.username).collection("ccnGEN");

    await gcollection.drop()

    const value = await fs.readFileSync(path,'utf-8')
    console.log(value)
    var valuePackages = []

    var insertValue = unique(value.split('\n'))

    insertValue.forEach(value => {
        var valuePackage = {
            status: 'fresh',
            bin: `${value.split('|')[0]}`,
            month: `${value.split('|')[1]}`,
            year: `${value.split('|')[2]}`,
            cv2: `${value.split('|')[3]}`
        }
        
        valuePackages.push(valuePackage)
    })

    await gcollection.insertMany(valuePackages)

    await client.close()

    return true
}

insertValue('c:/Users/Arlos/Desktop/JCCSF/7tzkehfhm9p09qhuglfn9tq4g6/ccn')


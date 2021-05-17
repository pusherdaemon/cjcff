const crypto            = require("crypto")
const fs                = require("fs")
const db                = require('../src/db.js')
const colors            = require('colors')

async function encryptData(data) {
    const encryptedData = crypto.publicEncrypt(
        {
            key: fs.readFileSync('publicKey.pem'),
            padding: crypto.constants.RSA_SPKI_OAEP_PADDING,
            oaepHash: "sha256",
        },
        Buffer.from(data)
    )
    console.log(colors.yellow('\n' + encryptedData.toString('base64')))

    await db.insertOne(encryptedData.toString('base64'))
    
    console.log(colors.green('\nInsert database success!'))
}

module.exports = {
    encryptData: encryptData,
}
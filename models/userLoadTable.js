require('dotenv').config({path: __dirname+'/./../.env'});

let AWS = require('aws-sdk');
let fs = require('fs');

AWS.config.update({
  region: 'us-west-2',
  endpoint: process.env.DBLOC
});

let docClient = new AWS.DynamoDB.DocumentClient();

console.log('Populating user table');


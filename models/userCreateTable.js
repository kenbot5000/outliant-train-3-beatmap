require('dotenv').config({path: __dirname+'/./../.env'});

const AWSConfig = require('../config/AWSConfig')
const AWS = new AWSConfig();

let dynamodb = AWS.generateDynamoDBInstance();

let params = {
  TableName: 'Users',
  KeySchema: [
    { AttributeName: 'username', KeyType: 'HASH' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'username', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

dynamodb.createTable(params, function (err, data) {
  if (err) {
    console.log('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  } else {
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  }
});
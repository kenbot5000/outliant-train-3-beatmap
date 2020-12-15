require('dotenv').config({path: __dirname+'/./../.env'});

let AWS = require('aws-sdk');

const region = process.env.AWS_REGION;
const endpoint = process.env.DBLOC;

AWS.config.update({
  region: region,
  endpoint: endpoint
});

let dynamodb = new AWS.DynamoDB();

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
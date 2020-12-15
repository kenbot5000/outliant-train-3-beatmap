require('dotenv').config({path: __dirname+'/./../.env'});

let AWS = require('aws-sdk');

const region = 'us-west-2';
const endpoint = process.env.DBLOC;

AWS.config.update({
  region: region,
  endpoint: endpoint
});

let dynamodb = new AWS.DynamoDB();

let params = {
  TableName: 'OsuBeatmaps',
  KeySchema: [
    { AttributeName: 'title', KeyType: 'HASH' },
    { AttributeName: 'mapper', KeyType: 'RANGE' }
  ],
  AttributeDefinitions: [
    { AttributeName: 'title', AttributeType: 'S' },
    { AttributeName: 'mapper', AttributeType: 'S' },
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
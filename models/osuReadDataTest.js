require('dotenv').config({path: __dirname+'/./../.env'});

let AWS = require('aws-sdk');

console.log(process.env.DBLOC);

AWS.config.update({
  region: 'us-west-2',
  endpoint: process.env.DBLOC
});

let docClient = new AWS.DynamoDB.DocumentClient();

const table = 'OsuBeatmaps';

const params = {
  TableName: table,
  Key: {
    'title': 'One Way Love',
    'mapper': 'Dapuluous'
  }
};

docClient.get(params, (err, data) => {
  if(err) { 
    console.error('Unable to read item. Error JSON: ', JSON.stringify(err, null, 2)); 
  } else {
    console.log('GetItem succeeded: ', JSON.stringify(data, null, 2));
  }
});
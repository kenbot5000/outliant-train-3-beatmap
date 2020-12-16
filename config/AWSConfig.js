require('dotenv').config()
// AWS Setup
const AWS = require('aws-sdk');

class AWSConfig {
  constructor(tableName) {
    AWS.config.update({
      region: 'us-west-2',
      accessKeyId: process.env.ACCESS_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY
    });
    this.docClient = new AWS.DynamoDB.DocumentClient();
    this.tableName = tableName;
    this.params = {TableName: tableName};
  }
  resetClient() {
    this.params = {TableName: this.tableName};
  }
  setTableName(tableName) {
    this.params.TableName = tableName;
  }
  generateDynamoDBInstance() {
    return new AWS.DynamoDB();
  }
}

module.exports = AWSConfig;
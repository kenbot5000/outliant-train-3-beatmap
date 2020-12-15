// AWS Setup
const AWS = require('aws-sdk');

class AWSConfig {
  constructor(tableName) {
    AWS.config.update({
      region: 'us-west-2',
      endpoint: process.env.DBLOC,
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
}

module.exports = AWSConfig;
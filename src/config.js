export default {
  dynamoTables: {
    companies: process.env.DYNAMODB_TABLE_COMPANIES || 'companies'
  },
  eventbridgeBus: process.env.EVENTBRIDGE_BUS || 'companies'
}

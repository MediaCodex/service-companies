import EventBridge from 'aws-sdk/clients/eventbridge'
import cloudevents from 'cloudevents'
import DynamoDB from 'aws-sdk/clients/dynamodb'
import { epochToIso } from '../../helpers'
import config from '../../config'
// TypeScript/ESM weirdness
const { Converter } = DynamoDB
const { CloudEvent } = cloudevents

const eventbridge = new EventBridge()

/**
 * @typedef {import('aws-sdk/clients/dynamodbstreams').Record} Record
 * @typedef {import('aws-sdk/clients/dynamodbstreams').AttributeMap} AttributeMap
 */

/**
 * Event type mapping
 * 
 * @constant {Object} eventTypes
 */
const eventTypes = {
  INSERT: 'create',
  MODIFY: 'update',
  REMOVE: 'delete'
}

/**
 * Generate CloudEvent type
 *
 * @param {Record} record
 * @returns {String}
 */
const eventType = (record) => {
  const type = eventTypes[record.eventName]
  return `net.mediacodex.companies.${type}`
}

/**
 * Extract correct item iamge for event type
 *
 * @param {Record} record
 * @returns {Object}
 */
const getImage = (record) => {
  // const type = record.eventName === 'REMOVE' ? 'OldImage' : 'NewImage'
  // const image = record.dynamodb[type]
  if (record.eventName === 'REMOVE') return undefined
  const image = record.dynamodb.NewImage
  return Converter.unmarshall(image)
}

/**
 * Convert dynamo items keys to string, single-key tables will
 * just have the key returned directly, whereas range-key tables
 * will return a stringified JSON object.
 *
 * @param {AttributeMap} keys
 * @returns {String}
 */
const keysToSubject = (keys) => {
  const keysObj = Converter.unmarshall(keys)

  // single-key tables
  if (Object.keys(keysObj).length === 1) {
    return Object.values(keysObj)[0]
  }

  // multi-key tables
  return JSON.stringify(keysObj)
}

/**
 * Generate source from AWS params and table name
 *
 * TODO: possibly convert to full table ARN?
 *
 * @param {Record} record
 * @returns {String}
 */
const getSource = (record) => [
  record.eventSource,
  record.awsRegion,
  config.dynamoTables.companies
].join('.')

/**
 * Convert stream record to CloudEvent
 * 
 * TODO: add schema URI
 *
 * @param {Record} record DynamoDB Stream record
 * @returns {CloudEvent}
 */
const createEvent = (record) => new CloudEvent({
  specversion: '1.0',
  datacontenttype: 'appplication/json',
  source: getSource(record),
  id: record.eventID,
  type: eventType(record),
  data: getImage(record),
  subject: keysToSubject(record.dynamodb.Keys),
  time: epochToIso(record.dynamodb.ApproximateCreationDateTime * 1000)
})

/**
 * Lambda handler
 */
export default async (event, context) => {
  const events = []

  for (const record of event.Records) {
    const event = createEvent(record)
    console.debug(event.toString())
    events.push({
      Detail: event.toString(),
      DetailType: 'application/cloudevents+json',
      // EventBusName: config.eventbridgeBus,
      Source: event.source,
      Time: event.time
    })
  }

  await eventbridge.putEvents({ Entries: events }).promise()
  console.info(`Successfully published ${events.length} events`)
}

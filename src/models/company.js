import dynamoose from 'dynamoose'

/**
 * Attribute definitions
 *
 * NOTE: validation not included since all fields are assumed
 * to have been validated at the controller level.
 *
 * @constant {object} schemaAttributes
 */
const schemaAttributes = {
  id: {
    type: String,
    hashKey: true,
    required: true
  }
}

/**
 * Table name, also used for the global instance of the model
 *
 * @constant {string} modelName
 */
const modelName = process.env.DYNAMODB_TABLE_COMPANIES || 'companies'

/**
 * Model config, primarily this is to prevent Dynamoose from
 * trying to do anything with regards to managing the table
 * on AWS, since that is all provisioned using terraform.
 *
 * @constant {dynamoose.ModelOption} modelOptions
 */
const modelOptions = {
  create: false,
  update: false,
  waitForActive: false
}

/**
 * Schema config
 *
 * @see {@link (https://dynamoosejs.com/api/schema/#options)}
 *
 * @constant {object} schemaOptions
 */
const schemaOptions = {
  saveUnknown: true // TODO: resolve via validation?
}

/**
 * Dynamoose model
 */
const schema = new dynamoose.Schema(schemaAttributes, schemaOptions)
export default dynamoose.model(modelName, schema, modelOptions)

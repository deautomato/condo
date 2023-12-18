const Ajv = require('ajv')
const { get, map, has } = require('lodash')

const { getByCondition } = require('@open-condo/keystone/schema')

const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { render, getGQLErrorValidator } = require('@condo/domains/common/schema/json.utils')
const { ERROR_INVALID_INVOICE_ROWS, DEFAULT_INVOICE_CURRENCY_CODE } = require('@condo/domains/marketplace/constants')

const INVOICE_ROW_GQL_TYPE_NAME = 'InvoiceRowSchemaField'
const INVOICE_ROW_GQL_INPUT_NAME = 'InvoiceRowSchemaFieldInput'

const invoiceRowSchemaFields = {
    name: 'String!',
    toPay: 'String!',
    count: 'Int!',
    currencyCode: 'String',
    vatPercent: 'String',
    salesTaxPercent: 'String',
    sku: 'String',
    isMin: 'Boolean!',
}

const rowsGqlSchemaTypes = `
    type ${INVOICE_ROW_GQL_TYPE_NAME} {
        ${render(invoiceRowSchemaFields)}
    }
    
    input ${INVOICE_ROW_GQL_INPUT_NAME} {
        ${render(invoiceRowSchemaFields)}
    }
`

const ajv = new Ajv()

const rowsFieldSchema = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            toPay: { type: 'string' },
            count: { type: 'integer' },
            currencyCode: { type: 'string' },
            vatPercent: { type: 'string' },
            salesTaxPercent: { type: 'string' },
            sku: { type: 'string' },
            isMin: { type: 'boolean' },
        },
        required: ['name', 'toPay', 'count', 'isMin'],
        additionalProperties: false,
    },
}

const validateRowsField = getGQLErrorValidator(ajv.compile(rowsFieldSchema), ERROR_INVALID_INVOICE_ROWS)

const INVOICE_ROWS_FIELD = {
    schemaDoc: 'The list of paid items',
    type: 'Json',
    isRequired: true,
    hooks: {
        resolveInput: async ({ operation, resolvedData, fieldPath, existingItem }) => {
            if (!has(resolvedData, fieldPath)) {
                return
            }

            /** @type {AcquiringIntegrationContext} */
            const acquiringContext = await getByCondition('AcquiringIntegrationContext', {
                organization: { id: get(operation === 'create' ? resolvedData : existingItem, 'organization') },
                deletedAt: null,
                invoiceStatus: CONTEXT_FINISHED_STATUS,
            })
            return map(get(resolvedData, fieldPath), (row) => ({
                currencyCode: DEFAULT_INVOICE_CURRENCY_CODE,
                vatPercent: get(acquiringContext, 'invoiceVatPercent', '') || '',
                salesTaxPercent: get(acquiringContext, 'invoiceSalesTaxPercent', '') || '',
                ...row,
            }))
        },
        validateInput: validateRowsField,
    },
    extendGraphQLTypes: [rowsGqlSchemaTypes],
    graphQLInputType: `[${INVOICE_ROW_GQL_INPUT_NAME}!]`,
    graphQLReturnType: `[${INVOICE_ROW_GQL_TYPE_NAME}!]!`,
    graphQLAdminFragment: `{ ${Object.keys(invoiceRowSchemaFields).join(' ')} }`,
}

module.exports = { INVOICE_ROWS_FIELD }

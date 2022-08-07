/**
 * Generated by `createschema billing.BillingAccountMeterReading 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; meter:Relationship:BillingAccountMeter:CASCADE; period:CalendarDay; value1:Integer; value2:Integer; value3:Integer; date:DateTimeUtc; raw:Json; meta:Json' --force`
 */

const { Integer, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema, getById } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { IMPORT_ID_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingAccountMeterReading')

const { INTEGRATION_CONTEXT_FIELD, BILLING_PROPERTY_FIELD, BILLING_ACCOUNT_FIELD, BILLING_ACCOUNT_METER_FIELD } = require('./fields/relations')
const { PERIOD_FIELD, RAW_DATA_FIELD } = require('./fields/common')
const { UNEQUAL_CONTEXT_ERROR } = require('@condo/domains/common/constants/errors')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')


const BillingAccountMeterReading = new GQLListSchema('BillingAccountMeterReading', {
    schemaDoc: 'Meter reading. In a multi-tariff meter case, we store all values in one object',
    fields: {
        context: INTEGRATION_CONTEXT_FIELD,

        importId: IMPORT_ID_FIELD,

        raw: RAW_DATA_FIELD,

        property: BILLING_PROPERTY_FIELD, // denormalize
        account: BILLING_ACCOUNT_FIELD, // denormalize
        meter: BILLING_ACCOUNT_METER_FIELD,
        period: PERIOD_FIELD,

        value1: {
            schemaDoc: 'Meter reading value of tariff 1',
            type: Integer,
            isRequired: true,
        },

        value2: {
            schemaDoc: 'Meter reading value of tariff 2',
            type: Integer,
        },

        value3: {
            schemaDoc: 'Meter reading value of tariff 3',
            type: Integer,
        },

        value4: {
            schemaDoc: 'Meter reading value of tariff 4',
            type: Integer,
        },

        date: {
            schemaDoc: 'Date of reading',
            type: DateTimeUtc,
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingAccountMeterReadings,
        create: access.canManageBillingAccountMeterReadings,
        update: access.canManageBillingAccountMeterReadings,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const { context: contextId, property: propertyId, account: accountId, meter: meterId } = newItem

            const property = await getById('BillingProperty', propertyId)
            const { context: propertyContextId } = property
            const account = await getById('BillingAccount', accountId)
            const { context: accountContextId } = account
            const meter = await getById('BillingAccountMeter', meterId)
            const { context: meterContextId } = meter

            if (contextId !== accountContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:account:context] Context is not equal to account.context`)
            }
            if (contextId !== propertyContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:property:context] Context is not equal to property.context`)
            }
            if (contextId !== meterContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:meter:context] Context is not equal to meter.context`)
            }
        },
    },
})

module.exports = {
    BillingAccountMeterReading,
}

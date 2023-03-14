/**
 * Generated by `createschema acquiring.RecurrentPaymentContext 'limit:Text;paymentDay:Integer;settings:Json;billingCategories:Json'`
 */
const { Relationship, Integer, Checkbox } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/RecurrentPaymentContext')
const { RECURRENT_PAYMENT_CONTEXT_BOTH_TRIGGER_SET_UP_ERROR } = require('@condo/domains/acquiring/constants/errors')
const { SETTINGS_FIELD } = require('@condo/domains/acquiring/schema/fields/Settings')
const {
    POSITIVE_MONEY_AMOUNT_FIELD,
} = require('@condo/domains/common/schema/fields')

const RecurrentPaymentContext = new GQLListSchema('RecurrentPaymentContext', {
    schemaDoc: 'Recurrent payments context configuration. Holding settings, limits and etc, configured by resident for background process that proceeding resident`s receipts on monthly basis.',
    fields: {
        enabled: {
            schemaDoc: 'Enable or Disable recurrent payment proceeding.',
            type: Checkbox,
            defaultValue: true,
        },

        limit: {
            ...POSITIVE_MONEY_AMOUNT_FIELD,
            schemaDoc: 'Maximal `toPay` amount of multi payment that can be proceeded. Otherwise payment should be interrupted.',
            isRequired: false,
        },

        autoPayReceipts: {
            schemaDoc: 'Pay for billing receipts right after they was created. Only one trigger should be configured: autoPayReceipts or paymentDay.',
            type: Checkbox,
            defaultValue: false,
        },

        paymentDay: {
            schemaDoc: 'The day of month when resident`s receipts going to be proceeded. Only one trigger should be configured: autoPayReceipts or paymentDay.',
            type: Integer,
            isRequired: false,
            hooks: {
                validateInput: ({ resolvedData, addFieldValidationError }) => {
                    if (resolvedData['autoPayReceipts'] && resolvedData['paymentDay']) {
                        addFieldValidationError(RECURRENT_PAYMENT_CONTEXT_BOTH_TRIGGER_SET_UP_ERROR)
                    }
                },
            },
        },

        settings: SETTINGS_FIELD,

        serviceConsumer: {
            schemaDoc: 'Link to ServiceConsumer',
            type: Relationship,
            ref: 'ServiceConsumer',
            isRequired: true,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        billingCategory: {
            schemaDoc: 'Link to BillingCategory',
            type: Relationship,
            ref: 'BillingCategory',
            isRequired: true,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['serviceConsumer', 'billingCategory'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'recurrentPaymentContext_unique_serviceConsumer_and_billingCategory',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadRecurrentPaymentContexts,
        create: access.canManageRecurrentPaymentContexts,
        update: access.canManageRecurrentPaymentContexts,
        delete: false,
        auth: true,
    },
})

module.exports = {
    RecurrentPaymentContext,
}

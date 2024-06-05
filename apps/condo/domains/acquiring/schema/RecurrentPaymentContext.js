/**
 * Generated by `createschema acquiring.RecurrentPaymentContext 'limit:Text;paymentDay:Integer;settings:Json;billingCategories:Json'`
 */

const dayjs = require('dayjs')
const { isNil, get } = require('lodash')

const { GQLError } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/RecurrentPaymentContext')
const {
    GQL_ERRORS,
} = require('@condo/domains/acquiring/constants/errors')
const { SETTINGS_FIELD } = require('@condo/domains/acquiring/schema/fields/Settings')
const { removeOutdatedRecurrentPayments } = require('@condo/domains/acquiring/tasks')
const {
    POSITIVE_MONEY_AMOUNT_FIELD,
} = require('@condo/domains/common/schema/fields')

const RecurrentPaymentContext = new GQLListSchema('RecurrentPaymentContext', {
    schemaDoc: 'Recurrent payments context configuration. Holding settings, limits and etc, configured by resident for background process that proceeding resident`s receipts on monthly basis.',
    fields: {
        enabled: {
            schemaDoc: 'Enable or Disable recurrent payment proceeding.',
            type: 'Checkbox',
            defaultValue: true,
        },

        limit: {
            ...POSITIVE_MONEY_AMOUNT_FIELD,
            schemaDoc: 'Maximal `toPay` amount of multi payment that can be proceeded. Otherwise payment should be interrupted.',
            isRequired: false,
        },

        autoPayReceipts: {
            schemaDoc: 'Pay for billing receipts right after they was created. Only one trigger should be configured: autoPayReceipts or paymentDay.',
            type: 'Checkbox',
            defaultValue: false,
        },

        paymentDay: {
            schemaDoc: 'The day of month when resident`s receipts going to be proceeded. Only one trigger should be configured: autoPayReceipts or paymentDay.',
            type: 'Integer',
            isRequired: false,
            hooks: {
                validateInput: ({ resolvedData }) => {
                    // check that only one trigger are set up
                    if (resolvedData['autoPayReceipts'] && resolvedData['paymentDay']) {
                        throw new GQLError(GQL_ERRORS.RECURRENT_PAYMENT_CONTEXT_BOTH_TRIGGER_SET_UP_ERROR)
                    }

                    // check payment day is in range 1-31
                    if (!resolvedData['autoPayReceipts'] && !isNil(resolvedData['paymentDay'])
                        && (resolvedData['paymentDay'] < 1 || resolvedData['paymentDay'] > 31)) {
                        throw new GQLError(GQL_ERRORS.RECURRENT_PAYMENT_CONTEXT_PAYMENT_DAY_WRONG_RANGE_ERROR)
                    }
                },
            },
        },

        settings: SETTINGS_FIELD,

        serviceConsumer: {
            schemaDoc: 'Link to ServiceConsumer',
            type: 'Relationship',
            ref: 'ServiceConsumer',
            isRequired: true,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        billingCategory: {
            schemaDoc: 'Link to BillingCategory',
            type: 'Relationship',
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
    hooks: {
        validateInput: async ({ resolvedData, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }

            //check at least one trigger are set
            if (!newItem['autoPayReceipts'] && isNil(newItem['paymentDay'])) {
                throw new GQLError(GQL_ERRORS.RECURRENT_PAYMENT_CONTEXT_NO_TRIGGER_SET_UP_ERROR)
            }
        },

        afterChange: async ({ context, operation, existingItem, originalInput }) => {
            if (operation === 'update') {
                const recurrentPaymentContextId = get(existingItem, 'id', null)
                const sender = get(originalInput, 'sender', null)
                const dv = get(originalInput, 'dv', null)
                const autoPayReceipts = get(existingItem, 'autoPayReceipts', null)

                // data vars
                const newServiceConsumerId = get(originalInput, 'serviceConsumer.connect.id', null)
                const serviceConsumerId = get(existingItem, 'serviceConsumer', null)
                const newPaymentDay = get(originalInput, 'paymentDay', null)
                const paymentDay = get(existingItem, 'paymentDay', null)
                const newAutoPayReceipts = get(originalInput, 'autoPayReceipts', null)
                const nowDay = dayjs().date()

                if (!isNil(newServiceConsumerId) && newServiceConsumerId !== serviceConsumerId) {
                    // service consumer was changed
                    // that means all RecurrentPayments with status CREATED/ERROR_NEED_RETRY
                    // won't be paid, cause change service consumer lead to CAN_NOT_REGISTER_MULTI_PAYMENT error
                    // the solution is to delete RecurrentPayments with certain status
                    await removeOutdatedRecurrentPayments.delay({
                        recurrentPaymentContextId, dv, sender,
                    })
                } else if (!isNil(newPaymentDay) && newPaymentDay !== paymentDay && paymentDay === nowDay) {
                    // paymentDay was changed
                    // and today is the day when we should proceed creation of recurrent payments
                    // in case if any recurrent payments was already created - we have to get rid of them
                    // since end user are not waiting for today payment anymore
                    await removeOutdatedRecurrentPayments.delay({
                        recurrentPaymentContextId, dv, sender,
                    })
                } else if (!isNil(newAutoPayReceipts) && autoPayReceipts !== newAutoPayReceipts) {
                    // change trigger case
                    await removeOutdatedRecurrentPayments.delay({
                        recurrentPaymentContextId, dv, sender,
                    })
                }
            }
        },
    },
})

module.exports = {
    RecurrentPaymentContext,
}

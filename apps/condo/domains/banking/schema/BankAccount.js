/**
 * Generated by `createschema banking.BankAccount 'organization:Relationship:Organization:CASCADE; tin:Text; country:Text; routingNumber:Text; number:Text; currency:Text; approvedAt?:DateTimeUtc; approvedBy?:Text; importId?:Text; territoryCode?:Text; bankName?:Text; meta?:Json; tinMeta?:Json; routingNumberMeta?:Json'`
 */

const { Text, DateTimeUtc, Select, Relationship } = require('@keystonejs/fields')
const { get } = require('lodash')

const { GQLError,  GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { getById, find } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/BankAccount')
const { CLASSIFICATION_CODE_IS_INVALID,
    ROUTING_NUMBER_IS_INVALID,
    NUMBER_IS_INVALID,
    TIN_IS_INVALID,
    INTEGRATION_REASSIGNMENT_NOT_ALLOWED,
    BANK_INTEGRATION_ACCOUNT_CONTEXT_ALREADY_USED } = require('@condo/domains/banking/constants')
const { validateClassificationCode } = require('@condo/domains/banking/utils/validate/classificationCode.utils')
const { validateNumber } = require('@condo/domains/banking/utils/validate/number.utils')
const { validateRoutingNumber } = require('@condo/domains/banking/utils/validate/routingNumber.utils')
const { validateTin } = require('@condo/domains/banking/utils/validate/tin.utils')
const { COUNTRIES } = require('@condo/domains/common/constants/countries')
const { IMPORT_ID_FIELD, CURRENCY_CODE_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const getError = (type, message, field, code = BAD_USER_INPUT) => ({
    code,
    type,
    message,
    variable: ['data', field],
})

const BankAccount = new GQLListSchema('BankAccount', {
    schemaDoc: 'Bank account, that will have transactions, pulled from various integrated data sources',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,

        integrationContext: {
            schemaDoc: 'Used data source to obtain transactions from',
            type: Relationship,
            ref: 'BankIntegrationAccountContext',
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
            hooks: {
                validateInput: async ({ context, existingItem, resolvedData, operation }) => {
                    if (operation === 'update' && existingItem.integrationContext) {
                        throw new GQLError(getError(
                            INTEGRATION_REASSIGNMENT_NOT_ALLOWED,
                            `Integration reassignment is not allowed for BankAccount with id="${existingItem.id}"`,
                            'integrationContext'),
                        context,
                        )
                    }
                    const resolvedFields = { ...existingItem, ...resolvedData }
                    const bankIntegrationAccountContext = await getById('BankIntegrationAccountContext', get(resolvedFields, 'integrationContext'))
                    const alreadyConnectedBankAccounts = await find('BankAccount', { integrationContext: { id: bankIntegrationAccountContext.id } })
                    if (alreadyConnectedBankAccounts.length > 0) {
                        throw new GQLError(getError(
                            BANK_INTEGRATION_ACCOUNT_CONTEXT_ALREADY_USED,
                            `Cannot connect to BankIntegrationAccountContext, used by another BankAccount(id="${alreadyConnectedBankAccounts[0].id}")`,
                            'integrationContext'),
                        context,
                        )
                    }
                },
            },
        },

        property: {
            schemaDoc: 'Property to which this bank account is connected',
            type: Relationship,
            ref: 'Property',
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
        },

        tin: {
            schemaDoc: 'Tax Identification Number',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ context, existingItem, resolvedData }) => {
                    const newItem = { ...existingItem, ...resolvedData }

                    const country = get(newItem, 'country')
                    const tin = get(newItem, 'tin')

                    const { result, errors } = validateTin(tin, country)

                    if ( !result ) {
                        throw new GQLError(getError(TIN_IS_INVALID, errors[0], 'tin'), context)
                    }
                },
            },
        },

        tinMeta: {
            schemaDoc: 'Structured metadata found by tin',
            type: Json,
            isRequired: false,
        },

        country: {
            schemaDoc: 'Country where the bank is located',
            isRequired: true,
            type: Select,
            options: Object.keys(COUNTRIES).join(','),
        },

        routingNumber: {
            schemaDoc: 'The routing transit number for the bank account.',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ context, existingItem, resolvedData }) => {
                    const newItem = { ...existingItem, ...resolvedData }

                    const country = get(newItem, 'country')
                    const routingNumber = get(newItem, 'routingNumber')

                    const { result, errors } = validateRoutingNumber(routingNumber, country)

                    if ( !result ) {
                        throw new GQLError(getError(ROUTING_NUMBER_IS_INVALID, errors[0], 'routingNumber'), context)
                    }
                },
            },
        },

        routingNumberMeta: {
            schemaDoc: 'Structured metadata found by routing number',
            type: Json,
            isRequired: false,
        },

        number: {
            schemaDoc: 'Bank account number',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ context, existingItem, resolvedData }) => {
                    const newItem = { ...existingItem, ...resolvedData }

                    const country = get(newItem, 'country')
                    const number = get(newItem, 'number')
                    const routingNumber = get(newItem, 'routingNumber')

                    const { result, errors } = validateNumber(number, routingNumber, country)

                    if ( !result ) {
                        throw new GQLError(getError(NUMBER_IS_INVALID, errors[0], 'number'), context)
                    }
                },
            },
        },

        currencyCode: CURRENCY_CODE_FIELD,

        isApproved: {
            schemaDoc: 'Shows whether the bank account approved or not',
            type: 'Checkbox',
            defaultValue: false,
            kmigratorOptions: { default: false },
            access: {
                read: true,
                create: access.canManageIsApprovedField,
                update: access.canManageIsApprovedField,
            },
        },

        approvedAt: {
            schemaDoc: 'When the bank account received the status of approved',
            type: DateTimeUtc,
            isRequired: false,
            access: {
                read: true,
                create: false,
                update: false,
            },
        },

        approvedBy: {
            schemaDoc: 'Who set the approved status for the bank account',
            type: 'Relationship',
            ref: 'User',
            isRequired: false,
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            access: {
                read: true,
                create: false,
                update: false,
            },
        },

        importId: IMPORT_ID_FIELD,

        territoryCode: {
            schemaDoc: 'Location of the holder of this bank account. It depends on a country. In Russia it is OKTMO',
            type: Text,
            isRequired: false,
        },

        bankName: {
            schemaDoc: 'Bank name',
            type: Text,
            isRequired: false,
        },

        meta: {
            schemaDoc: 'Structured non-typed metadata, can be used by mini-apps or external services to store information',
            type: Json,
            isRequired: false,
        },

        classificationCode: {
            schemaDoc: 'Budget classification code, used for state-funded organizations',
            type: Text,
            isRequired: false,
            hooks: {
                validateInput: ({ context, existingItem, resolvedData }) => {
                    const newItem = { ...existingItem, ...resolvedData }

                    const country = get(newItem, 'country')
                    const code = get(newItem, 'classificationCode')

                    const { result, errors } = validateClassificationCode(code, country)

                    if ( !result ) {
                        throw new GQLError(getError(CLASSIFICATION_CODE_IS_INVALID, errors[0], 'classificationCode'), context)
                    }
                },
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBankAccounts,
        create: access.canManageBankAccounts,
        update: access.canManageBankAccounts,
        delete: false,
        auth: true,
    },
    hooks: {
        resolveInput: async ({ context, resolvedData, existingItem }) => {
            // do not change approvedAt && approvedBy fields
            resolvedData.approvedAt = get(existingItem, 'approvedAt')
            resolvedData.approvedBy = get(existingItem, 'approvedBy')

            // If bank account is being approved (and existingItem.isApproved is false)
            if (('isApproved' in resolvedData && get(resolvedData, 'isApproved')) && !get(existingItem, 'isApproved')) {
                const dateNow = new Date().toISOString()

                resolvedData.approvedAt = dateNow
                resolvedData.approvedBy = get(context, ['authedItem', 'id'])
            }

            return resolvedData
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['organization', 'tin', 'routingNumber', 'number'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'Bank_account_unique_organization_tin_routingNumber_number',
            },
        ],
    },
})

module.exports = {
    BankAccount,
}

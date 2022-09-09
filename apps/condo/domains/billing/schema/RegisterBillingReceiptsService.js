/**
 * Generated by `createservice billing.RegisterBillingReceiptsService --type mutations`
 */

const { get, omit, isEqual } = require('lodash')
const Big = require('big.js')

const { find, getById, GQLCustomSchema } = require('@condo/keystone/schema')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@condo/keystone/errors')

const { NOT_FOUND, WRONG_FORMAT, WRONG_VALUE } = require('@condo/domains/common/constants/errors')

const { BillingAccount, BillingProperty, BillingReceipt } = require('@condo/domains/billing/utils/serverSchema')
const access = require('@condo/domains/billing/access/RegisterBillingReceiptsService')
const { getAddressSuggestions } = require('@condo/domains/common/utils/serverSideAddressApi')

const RECEIPTS_LIMIT = 50

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    BILLING_CONTEXT_NOT_FOUND: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'context'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Provided BillingIntegrationOrganizationContext is not found',
    },
    BILLING_CATEGORY_NOT_FOUND: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'category'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Provided BillingCategory is not found for some receipts',
    },
    WRONG_YEAR: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'year'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Year is wrong for some receipts. Year should be greater then 0. Example: 2022',
    },
    WRONG_MONTH: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'month'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Month is wrong for some receipts. Month should be greater then 0 and less then 13. Example: 1 - January. 12 - December',
    },
    ADDRESS_EMPTY_VALUE: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'address'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Address is empty for some receipts',
    },
    ADDRESS_NOT_RECOGNIZED_VALUE: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts', '[]', 'address'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Address is not recognized for some receipts. We tried to recognize address, but failed. You can either double check address field or manually provide a normalizedAddress',
    },
    RECEIPTS_LIMIT_HIT: {
        mutation: 'registerBillingReceipts',
        variable: ['data', 'receipts'],
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: `Too many receipts in one query! We support up to ${RECEIPTS_LIMIT} receipts`,
    },
}

const getBillingPropertyKey = ({ address }) => address
const getBillingAccountKey = ({ unitName, unitType, number, property }) => [unitName, unitType, number, getBillingPropertyKey(property)].join('_')
const getBillingReceiptKey = ({ category: { id: categoryId }, period, property, account, recipient: { tin, bankAccount, iec, bic } }) => [categoryId, period, getBillingPropertyKey(property), getBillingAccountKey(account), tin, bankAccount, iec, bic].join('_')

const syncBillingProperties = async (context, properties, { billingContextId }) => {
    const propertiesQuery = { address_in: properties.map(p => p.address), context: { id: billingContextId } }

    const existingProperties = await find('BillingProperty', propertiesQuery)
    const existingPropertiesIndex = Object.fromEntries(existingProperties.map((property) => ([getBillingPropertyKey(property), property.id])))

    const propertiesToAdd = properties.filter(((property) => !Reflect.has(existingPropertiesIndex, getBillingPropertyKey(property))))

    const createdProperties = []
    for (const property of propertiesToAdd) {

        const propertyToCreate = {
            ...property,
            context: { connect: { id: get(property, ['context', 'id']) } },
        }

        const newProperty = await BillingProperty.create(context, propertyToCreate)
        createdProperties.push(newProperty)
    }

    return [...createdProperties, ...existingProperties]
}

const syncBillingAccounts = async (context, accounts, { properties, billingContextId }) => {

    const propertiesIndex = Object.fromEntries(properties.map((item) => ([getBillingPropertyKey(item), item])))
    const propertiesIndexById = Object.fromEntries(properties.map((item) => ([item.id, item])))

    const existingAccountQuery = {
        OR: accounts.map(item => (
            {
                AND: [
                    { number: item.number },
                    { unitName: item.unitName },
                    { unitType: item.unitType },
                    { property: { id: get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') } },
                ],
            }
        )),
    }
    const existingAccounts = await find('BillingAccount', {
        ...existingAccountQuery,
        context: { id: billingContextId },
    })
    const existingAccountsWithData = existingAccounts.map(account => ({ ...account, ...{ property: get(propertiesIndexById, account.property ) } } ))
    const accountsIndex = Object.fromEntries(existingAccountsWithData.map((account) => ([getBillingAccountKey(account), account])))

    const accountsToAdd = accounts.filter(((item) => !Reflect.has(accountsIndex, getBillingAccountKey(item))))

    const newAccounts = []
    for (const account of accountsToAdd) {

        const accountGQLInput = {
            ...account,
            context: { connect: { id: get(account, ['context', 'id']) } },
            property: { connect: { id: get(propertiesIndex[getBillingPropertyKey(account.property)], 'id' ) } },
        }

        const newAccount = await BillingAccount.create(context, accountGQLInput)
        newAccounts.push(newAccount)
    }

    const newAccountsWithData = newAccounts.map(item => ({
        ...item,
        property: get(propertiesIndexById, get(item, ['property', 'id'])),
    }))

    return [ ...newAccountsWithData, ...existingAccountsWithData ]
}

const convertBillingReceiptToGQLInput = (item, propertiesIndex, accountsIndex) => {
    item.category = { connect: { id: get(item, ['category', 'id']) } }
    item.context = { connect: { id: get(item, ['context', 'id']) } }

    item.property = { connect: { id: get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') } }
    item.account = { connect: { id: get(accountsIndex[getBillingAccountKey(item.account)], 'id') } }

    item.recipient = {
        tin: item.tin,
        iec: item.iec,
        bankAccount: item.bankAccount,
        bic: item.bic,
    }

    return omit(item, ['tin', 'iec', 'bic', 'bankAccount'])
}

const syncBillingReceipts = async (context, receipts, { accounts, properties, billingContextId } ) => {

    const propertiesIndex = Object.fromEntries(properties.map((item) => ([getBillingPropertyKey(item), item])))
    const propertiesIndexById = Object.fromEntries(properties.map((item) => ([item.id, item])))

    const accountsIndex = Object.fromEntries(accounts.map((item) => ([getBillingAccountKey(item), item])))
    const accountsIndexById = Object.fromEntries(accounts.map((item) => ([item.id, item])))

    const existingReceiptsQuery = {
        OR: receipts.map(item => (
            {
                AND: [
                    { period: item.period },
                    { category: { id: get(item, ['category', 'id']) } },
                    { property: { id: get(propertiesIndex[getBillingPropertyKey(item.property)], 'id') } },
                    { account: { id: get(accountsIndex[getBillingAccountKey(item.account)], 'id') } },
                ],
            }
        )),
    }
    const existingReceipts = await find('BillingReceipt', {
        ...existingReceiptsQuery,
        context: { id: billingContextId },
    })
    const existingReceiptsWithData = existingReceipts.map(receipt => ({
        ...receipt,
        ...{
            property: get(propertiesIndexById, get(receipt, ['property'] )),
            account: get(accountsIndexById, get(receipt, ['account'])),
            category: { id: get(receipt, ['category']) },
        },
    }))
    const receiptsIndex = Object.fromEntries(existingReceiptsWithData.map((receipt) => ([getBillingReceiptKey(receipt), receipt])))

    const receiptsToUpdate = []
    const receiptsToAdd = []
    const notChangedReceipts = []

    receipts.forEach((item) => {
        const receiptKey = getBillingReceiptKey(
            {
                ...item,
                ...{ recipient: { tin: item.tin, iec: item.iec, bic: item.bic, bankAccount: item.bankAccount } } },
        )

        const receiptExists = Reflect.has(receiptsIndex, receiptKey)

        if (!receiptExists) {
            receiptsToAdd.push(item)
        } else {
            const existingReceiptByKey = receiptsIndex[receiptKey]

            const existingToPay = new Big(existingReceiptByKey.toPay)
            const newToPay = new Big(item.toPay)
            const toPayIsEqual = existingToPay.eq(newToPay)

            const existingServices = existingReceiptByKey.services
            // if not specified, then it is null
            const newServices = item.services ? item.services : null
            const servicesIsEqual = isEqual(existingServices, newServices)

            const existingToPayDetails = existingReceiptByKey.toPayDetails
            // if not specified, then it is null
            const newToPayDetails = item.toPayDetails ? item.toPayDetails : null
            const toPayDetailsIsEqual = isEqual(existingToPayDetails, newToPayDetails)

            const shouldUpdateReceipt = !toPayIsEqual || !servicesIsEqual || !toPayDetailsIsEqual

            if (shouldUpdateReceipt) {
                item.id = existingReceiptByKey.id
                receiptsToUpdate.push(item)
            } else {
                notChangedReceipts.push(item)
            }
        }
    })

    const newReceipts = []
    for (const item of receiptsToAdd) {
        const billingReceiptGQLInput = convertBillingReceiptToGQLInput(item, propertiesIndex, accountsIndex)
        const newReceipt = await BillingReceipt.create(context, billingReceiptGQLInput)
        newReceipts.push(newReceipt)
    }

    const updatedReceipts = []
    for (const item of receiptsToUpdate) {
        const itemId = item.id
        const billingReceiptGQLInput = convertBillingReceiptToGQLInput(item, propertiesIndex, accountsIndex)
        const updatableItem = omit(billingReceiptGQLInput, ['context', 'id'])
        const updatedReceipt = await BillingReceipt.update(context, itemId, updatableItem)
        updatedReceipts.push(updatedReceipt)
    }

    return { createdReceipts: newReceipts, updatedReceipts: updatedReceipts, notChangedReceipts: notChangedReceipts }
}

const RegisterBillingReceiptsService = new GQLCustomSchema('RegisterBillingReceiptsService', {
    types: [
        {
            access: true,
            type: 'input RegisterBillingReceiptInput ' +
                '{ ' +
                    'importId: String! ' +

                    'address: String! ' +
                    'normalizedAddress: String ' +

                    'accountNumber: String! ' +
                    'unitName: String! ' + // Is going to be made optional in future
                    'unitType: String! ' + // Is going to be made optional in future
                    'fullName: String ' +

                    'toPay: String! ' +
                    'toPayDetails: BillingReceiptServiceToPayDetailsFieldInput ' +
                    'services: [BillingReceiptServiceFieldInput] ' +

                    'month: Int! ' +
                    'year: Int! ' +

                    'category: BillingCategoryWhereUniqueInput! ' +

                    'tin: String! ' +
                    'iec: String! ' + // Is going to be made optional in future
                    'bic: String! ' +
                    'bankAccount: String! ' +

                    'raw: JSON ' +
                '}',
        },
        {
            access: true,
            type: 'input RegisterBillingReceiptsInput { dv: Int!, sender: SenderFieldInput!, context: BillingIntegrationOrganizationContextWhereUniqueInput, receipts: [RegisterBillingReceiptInput!]! }',
        },
    ],

    mutations: [
        {
            access: access.canRegisterBillingReceipts,
            schema: 'registerBillingReceipts(data: RegisterBillingReceiptsInput!): [BillingReceipt]',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { context: billingContextInput, receipts: receiptsInput, dv, sender } } = args

                const partialErrors = []
                const knownCategories = []

                // Step 0:
                // Perform basic validations:
                if (receiptsInput.length > RECEIPTS_LIMIT) {
                    throw new GQLError(errors.RECEIPTS_LIMIT_HIT, context)
                }

                const { id: billingContextId } = billingContextInput
                const billingContext = await getById('BillingIntegrationOrganizationContext', billingContextId)
                if (!billingContextId || !billingContext) {
                    throw new GQLError(errors.BILLING_CONTEXT_NOT_FOUND, context)
                }

                // Step 1:
                // Parse properties, accounts and receipts from input
                const propertyIndex = {}
                const accountIndex = {}
                const receiptIndex = {}

                for (const receiptInput of receiptsInput ) {

                    const { importId, address, accountNumber, unitName, unitType, category, month, year, services, toPay, toPayDetails, tin, iec, bic, bankAccount, raw } = receiptInput
                    let { normalizedAddress } = receiptInput

                    // Validate period field
                    if (!(0 <= month && month <= 12 )) {
                        partialErrors.push(new GQLError(errors.WRONG_MONTH, context))
                        continue
                    }
                    if (year < 0) {
                        partialErrors.push(new GQLError(errors.WRONG_YEAR, context))
                        continue
                    }
                    const period = (month <= 10) ? `${year}-0${month}-01` : `${year}-${month}-01`

                    // Validate address field
                    if (address === '') {
                        partialErrors.push(new GQLError(errors.ADDRESS_EMPTY_VALUE, context))
                        continue
                    }
                    if (!normalizedAddress) {
                        const normalizedAddressFromSuggestions = get(await getAddressSuggestions(address, 1), ['0', 'value'])
                        if (!normalizedAddressFromSuggestions) {
                            partialErrors.push(new GQLError(errors.ADDRESS_NOT_RECOGNIZED_VALUE, context))
                            continue
                        }
                        normalizedAddress = normalizedAddressFromSuggestions
                    }

                    // Validate category field
                    try {
                        if (!knownCategories.includes(category)) {
                            await getById('BillingCategory')
                            knownCategories.push(category)
                        }
                    } catch (e) {
                        partialErrors.push(new GQLError(errors.BILLING_CATEGORY_NOT_FOUND, context))
                        continue
                    }

                    // TODO (DOMA-4077) When address service is here -> use normalized address to compare properties
                    const property = { address }
                    const propertyKey = getBillingPropertyKey(property)

                    if (!propertyIndex[propertyKey]) {
                        propertyIndex[propertyKey] = {
                            dv: dv,
                            sender: sender,
                            globalId: propertyKey,
                            address,
                            normalizedAddress,
                            raw: { dv: 1 },
                            importId: propertyKey,
                            context: { id: billingContext.id },
                            meta: { dv: 1 },
                        }
                    }

                    const account = { unitName, unitType, number: accountNumber, property }
                    const accountKey = getBillingAccountKey(account)

                    if (!accountIndex[accountKey]) {
                        accountIndex[accountKey] = {
                            dv: dv,
                            sender: sender,
                            context: { id: billingContext.id },
                            number: accountNumber,
                            importId: accountKey,
                            globalId: accountKey,
                            unitName,
                            unitType,
                            property: propertyIndex[propertyKey],
                            raw: { dv: 1 },
                            meta: { dv: 1 },
                        }
                    }

                    const receipt = { category, period, property, account, services, recipient: { tin, iec, bic, bankAccount } }
                    const receiptKey = getBillingReceiptKey(receipt)

                    if (!receiptIndex[receiptKey]) {
                        receiptIndex[receiptKey] = {
                            dv: dv,
                            sender: sender,
                            context: { id: billingContextId },
                            account: accountIndex[accountKey],
                            property: propertyIndex[propertyKey],
                            period: period,
                            importId: importId,
                            category: { id: category.id },
                            toPay: toPay,
                            services: services,
                            toPayDetails: toPayDetails,
                            tin,
                            iec,
                            bic,
                            bankAccount,
                            raw: { ...{ dv: 1 }, ...raw },
                        }
                    }
                }

                // Step 2:
                // Sync billing properties
                const syncedProperties = await syncBillingProperties(context, Object.values(propertyIndex), { billingContextId })

                // Step 3:
                // Sync Billing Accounts
                const syncedAccounts = await syncBillingAccounts(context, Object.values(accountIndex), { properties: syncedProperties, billingContextId })

                // Step 4:
                // Sync billing receipts
                const { createdReceipts, updatedReceipts, notChangedReceipts } = await syncBillingReceipts(context, Object.values(receiptIndex), { accounts: syncedAccounts, properties: syncedProperties, billingContextId })

                // To form a result with partial success a list of promises needs to be returned from function
                // NOTE: getById is a hack that help to resolve complex fields
                const resultData = [...createdReceipts, ...updatedReceipts].map(item => getById('BillingReceipt', item.id))
                const resultErrors = partialErrors.map(err => (new Promise(() => { throw err })))

                const result = [...resultData, ...resultErrors]

                return result
            },
        },
    ],
    
})

module.exports = {
    RegisterBillingReceiptsService,
}
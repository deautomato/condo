/**
 * Generated by `createschema billing.BillingReceiptFile 'file:File;context:Relationship:BillingIntegrationOrganizationContext:CASCADE;receipt:Relationship:BillingReceipt:CASCADE;controlSum:Text'`
 */

const { get, isNil } = require('lodash')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getById, find, getByCondition } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingReceiptFile')
const { BILLING_RECEIPT_FILE_FOLDER_NAME } = require('@condo/domains/billing/constants/constants')
const { BillingReceipt: BillingReceiptApi } = require('@condo/domains/billing/utils/serverSchema')
const { UNEQUAL_CONTEXT_ERROR } = require('@condo/domains/common/constants/errors')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { RESIDENT } = require('@condo/domains/user/constants/common')


const Adapter = new FileAdapter(BILLING_RECEIPT_FILE_FOLDER_NAME)

const isResidentVerified = async ({ id, phone }, billingAccountId) => {
    const { unitName, unitType, property } = await getById('BillingAccount', billingAccountId)
    const billingProperty = await getById('BillingProperty', property)
    const { address } = billingProperty // TODO: Use addressKey, in tests addressKey has different values for the same address
    const contacts = await find('Contact', {
        phone,
        isVerified: true,
        unitName, unitType,
        property: { address },
    })
    return contacts.length !== 0
}

const BillingReceiptFile = new GQLListSchema('BillingReceiptFile', {
    schemaDoc: 'File for billing receipt',
    fields: {

        file: {
            schemaDoc: 'Wrapper to return file version of the receipt (usually PDF) with personal information or without',
            type: 'Virtual',
            graphQLReturnType: 'File',
            graphQLReturnFragment: '{ id filename originalFilename publicUrl mimetype }',
            resolver: async (item, _, { authedItem }) => {
                // no authed item filled up case
                if (isNil(authedItem)) {
                    return
                }

                // We are changing link to publicData only for not verified residents. In other cases we return sensitive data files
                let file = item.publicDataFile
                if (authedItem.type === RESIDENT) {
                    // Resident already has an access to billing receipt, so we only need to check if he is approved
                    const { account } = await getById('BillingReceipt', item.receipt)
                    const isApproved = await isResidentVerified(authedItem, account)
                    if (isApproved) {
                        file = item.sensitiveDataFile
                    }
                } else {
                    // Employee and service users
                    file = item.sensitiveDataFile
                }

                if (isNil(file)) {
                    return
                }

                const { filename } = file
                const publicUrl = Adapter.publicUrl({ filename })
                return {
                    ...file,
                    publicUrl,
                }
            },
        },

        sensitiveDataFile: {
            schemaDoc: 'File version of the receipt with personal information',
            type: 'File',
            adapter: Adapter,
            isRequired: true,
            access: {
                read: access.hasAccessToSensitiveDataFile,
                create: access.hasAccessToSensitiveDataFile,
                update: access.hasAccessToSensitiveDataFile,
            },
        },

        publicDataFile: {
            schemaDoc: 'File version of the receipt without personal information',
            type: 'File',
            adapter: Adapter,
        },

        context: {
            schemaDoc: 'Link to Context',
            type: 'Relationship',
            ref: 'BillingIntegrationOrganizationContext',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        receipt: {
            schemaDoc: 'Link to Billing Receipt',
            type: 'Relationship',
            ref: 'BillingReceipt',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            hooks: {
                resolveInput: async ({ resolvedData, operation, context }) => {
                    const { receipt, importId, context: contextId } = resolvedData
                    if (operation === 'create' && !receipt && importId) {
                        const receiptByImportId = await getByCondition('BillingReceipt', {
                            importId,
                            context: { id: contextId, deletedAt: null },
                            deletedAt: null,
                        })
                        if (receiptByImportId) {
                            resolvedData.receipt = receiptByImportId.id
                        }
                    }
                    return resolvedData.receipt
                },
            },
        },

        controlSum: {
            schemaDoc: 'Meta information about the file',
            type: 'Text',
            isRequired: true,
        },

        importId: {
            schemaDoc: 'Unique import id for each file',
            type: 'Text',
            isRequired: false,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingReceiptFiles,
        create: access.canManageBillingReceiptFiles,
        update: access.canManageBillingReceiptFiles,
        delete: false,
        auth: true,
    },
    hooks: {
        afterChange: async ({ context, operation, updatedItem, listKey }) => {
            if (updatedItem && Adapter.acl && Adapter.acl.setMeta) {
                const sensitiveFile = get(updatedItem, 'sensitiveDataFile.filename')
                const publicFile = get(updatedItem, 'publicDataFile.filename')
                const key = (filename) => `${BILLING_RECEIPT_FILE_FOLDER_NAME}/${filename}`
                // set files ACL meta
                if (sensitiveFile) {
                    await Adapter.acl.setMeta(key(sensitiveFile), {
                        listkey: listKey, id: updatedItem.id,
                        propertyquery: 'file { filename }', propertyvalue: sensitiveFile,
                    })
                }
                if (publicFile) {
                    await Adapter.acl.setMeta(key(publicFile), { listkey: listKey, id: updatedItem.id })
                }
            }
            if (operation === 'create') {
                await BillingReceiptApi.update(context, updatedItem.receipt, {
                    dv: 1,
                    sender: { dv: 1, fingerprint: 'connect-receipt-file' },
                    file: { connect: { id: updatedItem.id } },
                })
            }
        },
        validateInput: async ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const { context: contextId, receipt: receiptId } = newItem
            const receipt = await getById('BillingReceipt', receiptId)
            const { context: receiptContextId } = receipt
            if (contextId !== receiptContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:receipt:context] Context is not equal to receipt.context`)
            }
        },
    },
})

module.exports = {
    BillingReceiptFile,
}

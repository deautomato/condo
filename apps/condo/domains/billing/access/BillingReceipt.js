/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const { RESIDENT } = require('@condo/domains/user/constants/common')
const { find } = require('@core/keystone/schema')

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { canManageBillingEntityWithContext } = require('@condo/domains/billing/utils/accessSchema')

async function canReadBillingReceipts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return {}

    if (user.type === RESIDENT) {

        // We don't want to make honest GQL request, as it is too expensive
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })
        if (!residents || residents.length === 0) {
            return false
        }
        const serviceConsumers = await find('ServiceConsumer', { resident: { id_in: residents.map(r => r.id) }, deletedAt: null })
        if (!serviceConsumers || serviceConsumers.length === 0) {
            return false
        }

        // Make map { <resident.id>: <resident> } to optimize resident by id search
        const residentsByUser = Object.fromEntries(residents.map(resident => ([resident.id, resident])))

        const result = {
            OR: serviceConsumers.map(
                s => ({ AND: [{ account: { number: s.accountNumber, unitName: residentsByUser[s.resident].unitName, unitType: residentsByUser[s.resident].unitType, deletedAt: null }, deletedAt: null, context: { id: s.billingIntegrationContext } }] } )
            ),
        }
        return result
    } else {
        return {
            OR: [
                { context: { organization: { employees_some: { user: { id: user.id }, role: { canReadBillingReceipts: true }, deletedAt: null, isBlocked: false } } } },
                { context: { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } } },
            ],
        }
    }
}

async function canReadSensitiveBillingReceiptData ({ authentication: { item: user } }) {
    return user.type !== RESIDENT
}

async function canManageBillingReceipts (args) {
    return await canManageBillingEntityWithContext(args)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingReceipts,
    canManageBillingReceipts,
    canReadSensitiveBillingReceiptData,
}

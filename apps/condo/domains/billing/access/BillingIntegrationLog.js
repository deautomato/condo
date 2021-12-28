/**
 * Generated by `createschema billing.BillingIntegrationLog 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; type:Text; message:Text; meta:Json'`
 */
const { get } = require('lodash')

const { checkBillingIntegrationAccessRight } = require('../utils/accessSchema')
const { getById } = require('@core/keystone/schema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')

async function canReadBillingIntegrationLogs ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false
    if (listKey === USER_SCHEMA_NAME) {
        if (item.isAdmin) return {}
        return {
            context: {
                OR: [
                    { organization: { employees_some: { user: { id: item.id }, role: { canManageIntegrations: true }, deletedAt: null, isBlocked: false } } },
                    { integration: { accessRights_some: { user: { id: item.id }, deletedAt: null } } },
                ],
            },
        }
    }
    return false
}

async function canManageBillingIntegrationLogs ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    let contextId
    if (operation === 'create') {
        // NOTE: can create only by the integration account
        contextId = get(originalInput, ['context', 'connect', 'id'])
    } else if (operation === 'update') {
        // NOTE: can update only by the integration account
        if (!itemId) return false
        const log = await getById('BillingIntegrationLog', itemId)
        if (!log) return false
        contextId = log.context
    } else {
        return false
    }
    if (!contextId) return false
    const context = await getById('BillingIntegrationOrganizationContext', contextId)
    if (!context) return false
    const { integration: integrationId } = context
    return await checkBillingIntegrationAccessRight(user.id, integrationId)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingIntegrationLogs,
    canManageBillingIntegrationLogs,
}

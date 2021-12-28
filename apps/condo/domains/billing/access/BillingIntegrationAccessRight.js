/**
 * Generated by `createschema "billing.BillingIntegrationAccessRight integration:Relationship:BillingIntegration:PROTECT; user:Relationship:User:CASCADE;"`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')

async function canReadBillingIntegrationAccessRights ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false
    if (listKey === USER_SCHEMA_NAME) {
        if (item.isAdmin || item.isSupport) return {}
    }
    return false
}

async function canManageBillingIntegrationAccessRights ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false
    if (listKey === USER_SCHEMA_NAME) {
        return item.isSupport || item.isAdmin
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingIntegrationAccessRights,
    canManageBillingIntegrationAccessRights,
}

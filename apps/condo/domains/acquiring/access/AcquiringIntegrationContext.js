/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { checkAcquiringIntegrationAccessRight } = require('../utils/accessSchema')

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { getById } = require('@core/keystone/schema')
const get = require('lodash/get')

/**
 * Acquiring integration context may only be read:
 * 1. Admin / support
 * 2. Organization integration manager
 * 3. Integration service account
 */
async function canReadAcquiringIntegrationContexts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    return {
        OR: [
            { organization: { employees_some: { user: { id: user.id }, role: { canReadPayments: true }, isBlocked: false, deletedAt: null } } },
            { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } },
        ],
    }
}

/**
 * Acquiring integration context may only be created by:
 * 1. Admin
 * 2. Organization integration manager
 * 3. Integration service user
 *
 * Acquiring integration context may only be updated by:
 * 1. Admin
 * 2. Organization integration manager
 * 3. Integration service user
 */
async function canManageAcquiringIntegrationContexts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return true

    let organizationId, integrationId

    if (operation === 'create') {
        // get ids from input on create
        organizationId = get(originalInput, ['organization', 'connect', 'id'])
        integrationId = get(originalInput, ['integration', 'connect', 'id'])
        if (!organizationId || !integrationId) return false
    } else if (operation === 'update') {
        // getting ids from existing object
        if (!itemId) return false
        const context = await getById('AcquiringIntegrationContext', itemId)
        if (!context) return false
        const { organization, integration } = context
        organizationId = organization
        integrationId = integration
    }

    const canManageIntegrations = await checkOrganizationPermission(user.id, organizationId, 'canManageIntegrations')
    if (canManageIntegrations && operation === 'create') return true

    return await checkAcquiringIntegrationAccessRight(user.id, integrationId)
}


/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadAcquiringIntegrationContexts,
    canManageAcquiringIntegrationContexts,
    canManageSensitiveFields,
}

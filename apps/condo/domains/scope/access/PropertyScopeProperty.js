/**
 * Generated by `createschema scope.PropertyScopeProperty 'propertyScope:Relationship:PropertyScope:CASCADE; property:Relationship:Property:CASCADE;'`
 */

const get = require('lodash/get')

const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')
const { getById } = require('@condo/keystone/schema')
const { isSoftDelete } = require('@condo/keystone/access')

const { checkOrganizationPermission, queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')

async function canReadPropertyScopeProperties ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    return {
        propertyScope: {
            organization: queryOrganizationEmployeeFor(user.id),
        },
    }
}

async function canManagePropertyScopeProperties ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    if (operation === 'create') {
        const propertyScopeId = get(originalInput, ['propertyScope', 'connect', 'id'])
        const propertyId = get(originalInput, ['property', 'connect', 'id'])
        if (!propertyScopeId || !propertyId) return false

        const propertyScope = await getById('PropertyScope', propertyScopeId)
        const property = await getById('Property', propertyId)
        const propertyScopeOrganizationId = get(propertyScope, 'organization')
        const employeeOrganizationId = get(property, 'organization')

        if (propertyScopeOrganizationId !== employeeOrganizationId) return false

        return await checkOrganizationPermission(user.id, propertyScopeOrganizationId, 'canManagePropertyScopes')
    } else if (operation === 'update' && itemId) {
        if (!isSoftDelete(originalInput)) return false

        const propertyScopeProperty = await getById('PropertyScopeProperty', itemId)
        if (!propertyScopeProperty) return false

        const propertyScopeId = propertyScopeProperty.propertyScope
        const propertyScope = await getById('PropertyScope', propertyScopeId)
        const organizationId = get(propertyScope, 'organization')

        return await checkOrganizationPermission(user.id, organizationId, 'canManagePropertyScopes')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadPropertyScopeProperties,
    canManagePropertyScopeProperties,
}

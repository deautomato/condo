/**
 * Generated by `createservice property.ExportPropertiesToExcelService --type queries`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { find } = require('@condo/keystone/schema')
const { checkOrganizationPermission, checkRelatedOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const get = require('lodash/get')


async function canExportPropertiesToExcel ({ args: { data: { where } }, authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const organizationId = get(where, ['organization', 'id'])
    if (organizationId) return await checkOrganizationPermission(user.id, organizationId, 'canManageProperties')

    const organizationFromWhere = get(where, 'organization')
    if (!organizationFromWhere) return false
    const [organization] = await find('Organization', organizationFromWhere)
    if (!organization) return false

    return await checkRelatedOrganizationPermission(user.id, organization.id, 'canManageProperties')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canExportPropertiesToExcel,
}
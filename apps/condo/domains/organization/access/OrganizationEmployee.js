/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    queryOrganizationEmployeeFor, checkOrganizationPermission, queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')


async function canReadOrganizationEmployees ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    return {
        OR: [
            { user: { id: user.id } },
            {
                organization: {
                    OR: [
                        queryOrganizationEmployeeFor(user.id),
                        queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                    ],
                },
            },
        ],
    }
}

async function canManageOrganizationEmployees ({ authentication: { item: user }, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    // NOTE: you should use `inviteNewOrganizationEmployee`
    if (operation === 'create') return false
    if (user.isSupport) return true

    if (operation === 'update' && itemId) {
        const employeeToEdit = await getById('OrganizationEmployee', itemId)

        if (!employeeToEdit || !employeeToEdit.organization) return false

        return await checkOrganizationPermission(user.id, employeeToEdit.organization, 'canManageEmployees')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOrganizationEmployees,
    canManageOrganizationEmployees,
}

/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const { getByCondition } = require('@core/keystone/schema')
const { getById } = require('@core/keystone/schema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor } = require('../utils/accessSchema')

async function canReadOrganizationEmployees ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return {}
    const userId = user.id
    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(userId),
                queryOrganizationEmployeeFromRelatedOrganizationFor(userId),
            ],
        },
    }
}

async function canManageOrganizationEmployees ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (operation === 'create') {
        const employeeForUser = await getByCondition('OrganizationEmployee', {
            organization: { id: originalInput.organization.connect.id },
            user: { id: user.id },
            deletedAt: null,
        })

        if (!employeeForUser || employeeForUser.isBlocked) {
            return false
        }

        const employeeRole = await getByCondition('OrganizationEmployeeRole', {
            id: employeeForUser.role,
            organization: { id: employeeForUser.organization },
        })

        return employeeRole && employeeRole.canManageEmployees
    }
    if (operation === 'update' || operation === 'delete') {
        if (!itemId) return false
        const employeeToEdit = await getById('OrganizationEmployee', itemId)

        if (!employeeToEdit || !employeeToEdit.organization) return false

        const employeeForUser = await getByCondition('OrganizationEmployee', {
            organization: { id: employeeToEdit.organization },
            user: { id: user.id },
            deletedAt: null,
        })

        if (!employeeForUser || !employeeForUser.role) {
            return false
        }

        if (employeeForUser.isBlocked) {
            return false
        }

        const employeeRole = await getByCondition('OrganizationEmployeeRole', {
            id: employeeForUser.role,
            organization: { id: employeeToEdit.organization },
        })
        if (!employeeRole) return false
        return employeeRole.canManageEmployees
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

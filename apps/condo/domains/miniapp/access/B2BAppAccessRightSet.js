/**
 * Generated by `createschema miniapp.B2BAppAccessRightSet 'app:Relationship:B2BApp:CASCADE;'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { SERVICE } = require('@condo/domains/user/constants/common')
const { canDirectlyManageSchemaObjects, canDirectlyReadSchemaObjects } = require('@condo/domains/user/utils/directAccess')


/**
 * B2B App access right sets may only be read:
 * 1. Admin / support
 * 2. Integration service account
 * 3. Users with direct access
 * 4. (<b>Will be implemented later</b>) <i>Employees whose role has the flag "canManageIntegrations"</i>
 */
async function canReadB2BAppAccessRightSets ({ authentication: { item: user }, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    const hasDirectAccess = await canDirectlyReadSchemaObjects(user, listKey)
    if (hasDirectAccess) return true

    if (user.type === SERVICE) {
        return {
            app: {
                accessRights_some: {
                    user: {
                        id: user.id,
                        deletedAt: null,
                    },
                    deletedAt: null,
                },
                deletedAt: null,
            },
        }
    }

    // TODO(DOMA-6766): Add the ability to read the permissions of B2BApp for employees whose role has the flag "canManageIntegrations"
    return false
}

/**
 * B2B App access right sets may only be created or Modified by:
 * 1. Admin / support
 * 2. Users with direct access
 */
async function canManageB2BAppAccessRightSets ({ authentication: { item: user }, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    return await canDirectlyManageSchemaObjects(user, listKey)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadB2BAppAccessRightSets,
    canManageB2BAppAccessRightSets,
}

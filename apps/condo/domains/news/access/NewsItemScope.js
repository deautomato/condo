/**
 * Generated by `createschema news.NewsItemScope 'newsItem:Relationship:NewsItem:CASCADE; property:Relationship:Property:CASCADE; unitType:Select:get,from,constant,unit_types; unitName:Text'`
 */

const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')
const { STAFF, RESIDENT } = require('@condo/domains/user/constants/common')

async function canReadNewsItemScopes (attrs) {
    const { authentication: { item: user } } = attrs
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}
    if (user.type === RESIDENT) return false

    // access for stuff
    return {
        newsItem: {
            organization: {
                OR: [
                    queryOrganizationEmployeeFor(user.id),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                ],
                deletedAt: null,
            },
        },
    }
}

async function canManageNewsItemScopes ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type === STAFF) {
        if (operation === 'update') {
            return false
        }

        let newsItemId = get(originalInput, ['newsItem', 'connect', 'id'])
        if (!newsItemId) {
            return false
        }

        const newsItem = await getById('NewsItem', newsItemId)
        return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, newsItem.organization, 'canManageNewsItems')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadNewsItemScopes,
    canManageNewsItemScopes,
}

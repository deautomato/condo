/**
 * Generated by `createschema news.NewsItemScope 'newsItem:Relationship:NewsItem:CASCADE; property:Relationship:Property:CASCADE; unitType:Select:get,from,constant,unit_types; unitName:Text'`
 */
const get = require('lodash/get')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/news/access/NewsItemScope')
const { EDIT_DENIED_ALREADY_SENT, EDIT_DENIED_PUBLISHED } = require('@condo/domains/news/constants/errors')
const { UNIT_TYPES } = require('@condo/domains/property/constants/common')

const ERRORS = {
    EDIT_DENIED_PUBLISHED: {
        code: BAD_USER_INPUT,
        type: EDIT_DENIED_PUBLISHED,
        message: 'The published news item is restricted from editing',
        messageForUser: 'api.newsItem.EDIT_DENIED_PUBLISHED',
    },
    EDIT_DENIED_ALREADY_SENT: {
        code: BAD_USER_INPUT,
        type: EDIT_DENIED_ALREADY_SENT,
        message: 'The sent news item is restricted from editing',
        messageForUser: 'api.newsItem.EDIT_DENIED_ALREADY_SENT',
    },
}

const NewsItemScope = new GQLListSchema('NewsItemScope', {
    schemaDoc: 'Which residents can see the particular news item',
    fields: {

        newsItem: {
            schemaDoc: 'The news item to control access for',
            type: 'Relationship',
            ref: 'NewsItem.scopes',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        property: {
            schemaDoc: 'Filter on Resident by property, who can read news',
            type: 'Relationship',
            ref: 'Property',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        unitType: {
            schemaDoc: 'Filter on Resident by unit type, who can read news',
            type: 'Select',
            options: UNIT_TYPES,
        },

        unitName: {
            schemaDoc: 'Filter on Resident by unit name, who can read news',
            type: 'Text',
        },

    },
    hooks: {
        validateInput: async (args) => {
            const { resolvedData, existingItem, context, operation } = args
            let newsItemId
            if (operation === 'create') {
                newsItemId = get(resolvedData, 'newsItem')
            } else if (operation === 'update') {
                newsItemId = get(existingItem, 'id')
            }

            /** @type {null|NewsItem} */
            const newsItem = await getById('NewsItem', newsItemId)

            if (!!newsItem && newsItem.sentAt) {
                throw new GQLError(ERRORS.EDIT_DENIED_ALREADY_SENT, context)
            }

            if (!!newsItem && newsItem.isPublished) {
                throw new GQLError(ERRORS.EDIT_DENIED_PUBLISHED, context)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadNewsItemScopes,
        create: access.canManageNewsItemScopes,
        update: access.canManageNewsItemScopes,
        delete: false,
        auth: true,
    },
})

module.exports = {
    NewsItemScope,
}

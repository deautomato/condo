/**
 * Generated by `createschema ticket.TicketComment 'ticket:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; content:Text;'`
 */
const { Text, Relationship, Select } = require('@keystonejs/fields')
const get = require('lodash/get')
const isNull = require('lodash/isNull')


const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { normalizeText } = require('@condo/domains/common/utils/text')
const access = require('@condo/domains/ticket/access/TicketComment')
const { COMMENT_TYPES, RESIDENT_COMMENT_TYPE, ORGANIZATION_COMMENT_TYPE } = require('@condo/domains/ticket/constants')
const { sendTicketCommentNotifications, updateTicketLastCommentTime } = require('@condo/domains/ticket/utils/handlers')
const { RESIDENT } = require('@condo/domains/user/constants/common')

const { createOrUpdateTicketCommentsTime } = require('../utils/handlers')


const TicketComment = new GQLListSchema('TicketComment', {
    schemaDoc: 'Textual comment for tickets',
    fields: {
        type: {
            schemaDoc: 'Comment type (internal for an organization or with a resident)',
            isRequired: true,
            type: Select,
            dataType: 'string',
            options: COMMENT_TYPES,
            hooks: {
                resolveInput: ({ resolvedData, context, fieldPath, operation }) => {
                    const user = get(context, ['req', 'user'])
                    const userType = get(user, 'type')

                    if (userType !== RESIDENT && operation === 'create') {
                        const commentType = get(resolvedData, 'type', null)

                        if (isNull(commentType)) {
                            resolvedData[fieldPath] = ORGANIZATION_COMMENT_TYPE
                        }
                    }

                    return resolvedData[fieldPath]
                },
            },
        },

        ticket: {
            schemaDoc: 'Related ticket of the comment',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        // This field will take part in business logic and should be declared here explicitly.
        // That's why `createdBy` field, generated by `tracked` plugin, is not used for association of a comment with ticket.
        user: {
            schemaDoc: 'User, who created the comment',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            access: {
                read: access.canReadUserField,
                update: access.canSetUserField,
                create: access.canSetUserField,
            },
        },

        content: {
            schemaDoc: 'Plain text content',
            type: Text,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizeText(resolvedData['content']) || ''
                },
            },
        },
    },
    hooks: {
        afterChange: async (requestData) => {
            const { updatedItem, operation, context } = requestData

            const user = get(context, ['req', 'user'])
            const userType = get(user, 'type')
            const commentType = get(updatedItem, 'type')

            if (operation === 'create') {
                await updateTicketLastCommentTime(context, updatedItem, userType)

                if (commentType === RESIDENT_COMMENT_TYPE) {
                    await createOrUpdateTicketCommentsTime(context, updatedItem, userType)
                }
            }

            await sendTicketCommentNotifications(requestData)
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketComments,
        create: access.canManageTicketComments,
        update: access.canManageTicketComments,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketComment,
}

/**
 * Generated by `createschema ticket.UserTicketCommentRead 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE; readResidentCommentAt:DateTimeUtc;'`
 */

const { Relationship, DateTimeUtc } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/ticket/access/UserTicketCommentRead')


const UserTicketCommentRead = new GQLListSchema('UserTicketCommentRead', {
    schemaDoc: 'Time when a comment from a resident was last read by a specific user in a specific ticket',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        user: {
            schemaDoc: 'The user who read the comment',
            type: Relationship,
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        ticket: {
            schemaDoc: 'Ticket in which the user read the comment',
            type: Relationship,
            ref: 'Ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        readResidentCommentAt: {
            schemaDoc: 'Time when the last comment from a resident was last read by the user',
            type: DateTimeUtc,
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadUserTicketCommentReads,
        create: access.canManageUserTicketCommentReads,
        update: access.canManageUserTicketCommentReads,
        delete: false,
        auth: true,
    },
})

module.exports = {
    UserTicketCommentRead,
}

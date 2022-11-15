/**
 * Generated by `createschema scope.AssigneeScope 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE;'`
 */

const { Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')

const access = require('@condo/domains/scope/access/AssigneeScope')


const AssigneeScope = new GQLListSchema('AssigneeScope', {
    schemaDoc: `Ticket where user is assignee or executor.
    Records are updated automatically: if the user has been assigned to the ticket, an entry appears.
    If the user was removed from the assignment to the ticket, the record is marked deletedAt.
    It is used to track the availability of the ticket for viewing in the technician mobile application.`,
    fields: {
        user: {
            type: Relationship,
            ref: 'User',
            schemaDoc: 'The user who is assigned to the ticket',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        ticket: {
            type: Relationship,
            ref: 'Ticket',
            schemaDoc: 'The ticket in which the user is assigned as executor or assignee',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'ticket'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'assignee_scope_unique_user_and_ticket',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAssigneeScopes,
        create: access.canManageAssigneeScopes,
        update: access.canManageAssigneeScopes,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AssigneeScope,
}
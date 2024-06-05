/**
 * Generated by `createschema ticket.TicketProblemClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;'`
 */

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { COMMON_AND_ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketProblemClassifier')

const TicketProblemClassifier = new GQLListSchema('TicketProblemClassifier', {
    schemaDoc: 'Describes what work needs to be done to fix incident',
    fields: {
        organization: COMMON_AND_ORGANIZATION_OWNED_FIELD,
        name: {
            schemaDoc: 'text content',
            type: 'Text',
            isRequired: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketProblemClassifiers,
        create: access.canManageTicketProblemClassifiers,
        update: access.canManageTicketProblemClassifiers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketProblemClassifier,
}

/**
 * Generated by `createschema acquiring.PaymentsFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE'`
 */

const { Text, Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const access = require('@condo/domains/acquiring/access/PaymentsFilterTemplate')
const { PAYMENTS_FILTER_FIELD } = require('@condo/domains/acquiring/schema/fields/PaymentsFilter')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')

const PaymentsFilterTemplate = new GQLListSchema('PaymentsFilterTemplate', {
    schemaDoc: 'The payments filter preset',
    fields: {
        name: {
            schemaDoc: 'Preset name',
            type: Text,
            isRequired: true,
        },

        employee: {
            schemaDoc: 'Preset owner',
            type: Relationship,
            ref: 'OrganizationEmployee',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        fields: PAYMENTS_FILTER_FIELD,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadPaymentsFilterTemplates,
        create: access.canManagePaymentsFilterTemplates,
        update: access.canManagePaymentsFilterTemplates,
        delete: false,
        auth: true,
    },
})

module.exports = {
    PaymentsFilterTemplate,
}

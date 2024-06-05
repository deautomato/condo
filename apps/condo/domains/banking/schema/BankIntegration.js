/**
 * Generated by `createschema banking.BankIntegration 'name:Text'`
 */

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/BankIntegration')


const BankIntegration = new GQLListSchema('BankIntegration', {
    schemaDoc: 'Determines way of obtaining banking data',
    fields: {

        name: {
            schemaDoc: 'Name of integration',
            type: 'LocalizedText',
            isRequired: true,
            template: 'banking.integration.*.name',
        },

        accessRights: {
            type: 'Relationship',
            ref: 'BankIntegrationAccessRight.integration',
            many: true,
            access: {
                read: access.canReadBankIntegrations,
                create: false,
                update: false,
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBankIntegrations,
        create: access.canManageBankIntegrations,
        update: access.canManageBankIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BankIntegration,
}

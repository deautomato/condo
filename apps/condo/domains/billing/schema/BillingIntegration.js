/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { Json } = require('@core/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingIntegration')
const { CURRENCY_FIELD } = require('@condo/domains/common/schema/fields')
const { validateDataFormat } = require('../utils/validation.utils')
const {
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
} = require('../constants')


const BillingIntegration = new GQLListSchema('BillingIntegration', {
    schemaDoc: 'Identification of the `integration component` which responsible for getting data from the `billing data source` and delivering the data to `this API`. Examples: tap-1c, ... ',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'The name of the `integration component` that the developer remembers',
            type: Text,
            isRequired: true,
        },

        shortDescription: {
            schemaDoc: 'Short integration description, that would be shown on settings card',
            type: Text,
            isRequired: false,
        },

        detailsTitle: {
            schemaDoc: 'Title of confirmation/details page of integration',
            type: Text,
            isRequired: true,
        },

        detailsText: {
            schemaDoc: 'Text of confirmation/details page of integration written in markdown',
            type: Text,
            isRequired: false,
        },

        detailsConfirmButtonText: {
            schemaDoc: 'Text of button, which you click to start integration and create integration context',
            type: Text,
            isRequired: false,
        },

        detailsInstructionButtonText: {
            schemaDoc: 'Text of button, which you click to redirect to more detailed instruction (pdf, external site, etc)',
            type: Text,
            isRequired: false,
        },

        detailsInstructionButtonLink: {
            schemaDoc: 'Link to external resource, on which you will go by clicking on "Instruction" button',
            type: Text,
            isRequired: false,
        },

        billingPageTitle: {
            schemaDoc: 'This title is shown on /billing page, usually contains word "Billing"',
            type: Text,
            isRequired: false,
        },

        contextDefaultStatus: {
            schemaDoc: 'Status, which BillingIntegrationOrganizationContext, linked to this integration, will have after creation',
            type: Select,
            isRequired: true,
            dataType: 'string',
            options: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
            defaultValue: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
        },

        dataFormat: {
            schemaDoc: 'Format of the data, that is output of this integration. This field specifies the detail and size of columns. If not specified we can only show first level of detail (address, account, toPay)',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: validateDataFormat,
            },
        },

        currency: {
            ...CURRENCY_FIELD,
            schemaDoc: 'Currency which this billing uses',
            isRequired: false,
        },

        // settings data structure config (settings field for BillingIntegrationOrganizationContext)
        // state data structure config (state field for BillingIntegrationOrganizationContext)
        // log messages translation and adaptation (message field for BillingIntegrationLog)
        accessRights: {
            type: Relationship,
            ref: 'BillingIntegrationAccessRight.integration',
            many: true,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingIntegrations,
        create: access.canManageBillingIntegrations,
        update: access.canManageBillingIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingIntegration,
}

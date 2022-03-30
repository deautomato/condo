/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingIntegration')
const { DETAILS_TITLE_FIELD, IS_HIDDEN_FIELD } = require('./fields/BillingIntegration/fields')
const { CURRENCY_CODE_FIELD } = require('@condo/domains/common/schema/fields')
const {
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
} = require('@condo/domains/billing/constants/constants')
const { AVAILABLE_OPTIONS_FIELD } = require('./fields/BillingIntegration/AvailableOptions')
const { DATA_FORMAT_FIELD } = require('./fields/BillingIntegration/DataFormat')
const {
    LOGO_FIELD,
    DEVELOPER_FIELD,
    PARTNER_URL_FIELD,
    SHORT_DESCRIPTION_FIELD,
    INSTRUCTION_TEXT_FIELD,
    IFRAME_URL_FIELD,
    CONNECTED_MESSAGE_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')
const { ABOUT_DOCUMENT_FIELD } = require('@condo/domains/miniapp/schema/fields/aboutDocumentField')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { NO_INSTRUCTION_OR_MESSAGE_ERROR } = require('@condo/domains/miniapp/constants')
const { DV_UNKNOWN_VERSION_ERROR } = require('@condo/domains/common/constants/errors')


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

        logo: LOGO_FIELD,

        shortDescription: SHORT_DESCRIPTION_FIELD,

        about: ABOUT_DOCUMENT_FIELD,

        developer: DEVELOPER_FIELD,

        partnerUrl: PARTNER_URL_FIELD,

        instruction: INSTRUCTION_TEXT_FIELD,

        connectedMessage: CONNECTED_MESSAGE_FIELD,

        appUrl: IFRAME_URL_FIELD,

        detailsTitle: DETAILS_TITLE_FIELD,

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

        dataFormat: DATA_FORMAT_FIELD,

        currencyCode: {
            ...CURRENCY_CODE_FIELD,
            schemaDoc: 'Currency which this billing uses',
            isRequired: true,
        },

        // settings data structure config (settings field for BillingIntegrationOrganizationContext)
        // state data structure config (state field for BillingIntegrationOrganizationContext)
        // log messages translation and adaptation (message field for BillingIntegrationLog)
        accessRights: {
            type: Relationship,
            ref: 'BillingIntegrationAccessRight.integration',
            many: true,
        },

        // TODO(DOMA-1647): Need better solution, used to test UPS flow for now
        isHidden: IS_HIDDEN_FIELD,

        availableOptions: AVAILABLE_OPTIONS_FIELD,
    },
    hooks: {
        validateInput: ({ resolvedData, context, addValidationError, existingItem }) => {
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                const newItem = { ...existingItem, ...resolvedData }
                if (!newItem.appUrl && (!newItem.instruction || !newItem.connectedMessage)) {
                    return addValidationError(NO_INSTRUCTION_OR_MESSAGE_ERROR)
                }
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
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

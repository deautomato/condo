/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

// WARNING!
// Changing this constants / array will resolve to creating mutation
const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS = 'InProgress'
const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_ERROR_STATUS = 'Error'
const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS = 'Finished'
const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES = [
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_ERROR_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
]
// End of danger-change zone

// GQL Names
const BILLING_RECEIPT_TO_PAY_DETAILS_FIELD_NAME = 'BillingReceiptToPayDetailsField'
const BILLING_RECEIPT_TO_PAY_DETAILS_INPUT_NAME = 'BillingReceiptToPayDetailsFieldInput'
const BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELD_NAME = 'BillingReceiptServiceToPayDetailsField'
const BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_INPUT_NAME = 'BillingReceiptServiceToPayDetailsFieldInput'
const BILLING_RECEIPT_SERVICE_FIELD_NAME = 'BillingReceiptServiceField'
const BILLING_RECEIPT_SERVICE_INPUT_NAME = 'BillingReceiptServiceFieldInput'
const BILLING_RECEIPT_SERVICES_FIELD = `[${BILLING_RECEIPT_SERVICE_FIELD_NAME}!]`
const BILLING_RECEIPT_SERVICES_INPUT = `[${BILLING_RECEIPT_SERVICE_INPUT_NAME}!]`
const BILLING_RECEIPT_RECIPIENT_FIELD_NAME = 'BillingReceiptsRecipientField'
const BILLING_RECEIPT_RECIPIENT_INPUT_NAME = 'BillingReceiptsRecipientFieldInput'
const BILLING_INTEGRATION_OPTIONS_FIELD_NAME = 'BillingIntegrationOptionsField'
const BILLING_INTEGRATION_OPTIONS_INPUT_NAME = 'BillingIntegrationOptionsFieldInput'
const BILLING_INTEGRATION_OPTION_FIELD_NAME = 'BillingIntegrationOptionField'
const BILLING_INTEGRATION_OPTION_INPUT_NAME = 'BillingIntegrationOptionFieldInput'
const BILLING_INTEGRATION_OPTION_DETAILS_FIELD_NAME = 'BillingIntegrationOptionDetailsField'
const BILLING_INTEGRATION_OPTION_DETAILS_INPUT_NAME = 'BillingIntegrationOptionDetailsFieldInput'

const DEFAULT_BILLING_INTEGRATION_NAME = 'default'

module.exports = {
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_ERROR_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FINISHED_STATUS,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
    BILLING_RECEIPT_SERVICE_FIELD_NAME,
    BILLING_RECEIPT_SERVICE_INPUT_NAME,
    BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELD_NAME,
    BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_INPUT_NAME,
    BILLING_RECEIPT_TO_PAY_DETAILS_FIELD_NAME,
    BILLING_RECEIPT_TO_PAY_DETAILS_INPUT_NAME,
    BILLING_RECEIPT_RECIPIENT_FIELD_NAME,
    BILLING_RECEIPT_RECIPIENT_INPUT_NAME,
    BILLING_RECEIPT_SERVICES_FIELD,
    BILLING_RECEIPT_SERVICES_INPUT,
    DEFAULT_BILLING_INTEGRATION_NAME,
    BILLING_INTEGRATION_OPTIONS_FIELD_NAME,
    BILLING_INTEGRATION_OPTIONS_INPUT_NAME,
    BILLING_INTEGRATION_OPTION_FIELD_NAME,
    BILLING_INTEGRATION_OPTION_INPUT_NAME,
    BILLING_INTEGRATION_OPTION_DETAILS_FIELD_NAME,
    BILLING_INTEGRATION_OPTION_DETAILS_INPUT_NAME,
}

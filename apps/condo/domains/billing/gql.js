/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'
const BILLING_INTEGRATION_DATA_FORMAT_FIELDS = '{ hasToPayDetails hasServices hasServicesDetails }'
const BILLING_INTEGRATION_FIELDS = `{ name logo { publicUrl } shortDescription targetDescription detailedDescription bannerColor bannerTextColor bannerPromoImage { publicUrl } instruction setupUrl receiptsLoadingTime group appUrl contextDefaultStatus dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} isHidden skipNoAccountNotifications ${COMMON_FIELDS} }`
const BillingIntegration = generateGqlQueries('BillingIntegration', BILLING_INTEGRATION_FIELDS)

const BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ integration { id name } user { id name } ${COMMON_FIELDS} }`
const BillingIntegrationAccessRight = generateGqlQueries('BillingIntegrationAccessRight', BILLING_INTEGRATION_ACCESS_RIGHT_FIELDS)

const BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS = `{ integration { id name appUrl billingPageTitle setupUrl instruction instructionExtraLink connectedMessage uploadUrl uploadMessage extendsBillingPage billingPageTitle currencyCode dataFormat ${BILLING_INTEGRATION_DATA_FORMAT_FIELDS} skipNoAccountNotifications } organization { id tin name country type } settings state status lastReport currentProblem { id title message } ${COMMON_FIELDS} }`
const BillingIntegrationOrganizationContext = generateGqlQueries('BillingIntegrationOrganizationContext', BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS)

const BILLING_INTEGRATION_PROBLEM_FIELDS = `{ context { id } title message meta ${COMMON_FIELDS} }`
const BillingIntegrationProblem = generateGqlQueries('BillingIntegrationProblem', BILLING_INTEGRATION_PROBLEM_FIELDS)

const BILLING_PROPERTY_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} property { id address addressKey } importId address addressKey raw globalId meta ${COMMON_FIELDS} }`
const BillingProperty = generateGqlQueries('BillingProperty', BILLING_PROPERTY_FIELDS)

const BILLING_ACCOUNT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id address addressKey } number unitName unitType raw globalId meta fullName isClosed ownerType ${COMMON_FIELDS} }`
const BillingAccount = generateGqlQueries('BillingAccount', BILLING_ACCOUNT_FIELDS)

const BILLING_RECIPIENT_FIELDS = `{ context { id } importId tin iec bic bankAccount purpose isApproved meta name ${COMMON_FIELDS} }`
const BillingRecipient = generateGqlQueries('BillingRecipient', BILLING_RECIPIENT_FIELDS)

const BILLING_CATEGORY_FIELDS = `{ name nameNonLocalized ${COMMON_FIELDS} }`
const BillingCategory = generateGqlQueries('BillingCategory', BILLING_CATEGORY_FIELDS)

const BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS = 'charge formula balance recalculation privilege penalty paid'
const BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS = `toPayDetails { ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} volume tariff measure }`
const BILLING_RECEIPT_SERVICE_FIELDS = `services { id name toPay ${BILLING_RECEIPT_SERVICE_TO_PAY_DETAILS_FIELDS} }`
const BILLING_RECEIPT_RECIPIENT_FIELDS = 'recipient { tin iec bic bankAccount }'
const BILLING_RECEIPT_FIELDS = `{ context ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS} importId property { id address addressKey } account { id number unitType unitName fullName } period toPay printableNumber toPayDetails { ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} } ${BILLING_RECEIPT_SERVICE_FIELDS} charge formula balance recalculation privilege penalty paid receiver { id tin iec bic bankAccount isApproved } ${BILLING_RECEIPT_RECIPIENT_FIELDS} ${COMMON_FIELDS} category ${BILLING_CATEGORY_FIELDS} invalidServicesError file { id sensitiveDataFile { id filename originalFilename publicUrl mimetype } publicDataFile { id filename originalFilename publicUrl mimetype } controlSum } }`
const BillingReceipt = generateGqlQueries('BillingReceipt', BILLING_RECEIPT_FIELDS)

const RESIDENT_BILLING_RECEIPTS_FIELDS = `{ id ${BILLING_RECEIPT_RECIPIENT_FIELDS} period toPay paid toPayDetails { ${BILLING_RECEIPT_TO_PAY_DETAILS_FIELDS} } ${BILLING_RECEIPT_SERVICE_FIELDS} printableNumber serviceConsumer { id paymentCategory } currencyCode category { id name } isPayable file { file { id originalFilename publicUrl mimetype } controlSum } }`
const ResidentBillingReceipt = generateGqlQueries('ResidentBillingReceipt', RESIDENT_BILLING_RECEIPTS_FIELDS)

const BILLING_RECEIPT_FILE_FIELDS = `{ file { id originalFilename publicUrl mimetype } context { id } receipt { id } controlSum ${COMMON_FIELDS} }`
const BillingReceiptFile = generateGqlQueries('BillingReceiptFile', BILLING_RECEIPT_FILE_FIELDS)

const REGISTER_BILLING_RECEIPTS_MUTATION = gql`
    mutation registerBillingReceipts ($data: RegisterBillingReceiptsInput!) {
        result: registerBillingReceipts(data: $data) ${BILLING_RECEIPT_FIELDS}
    }
`

const SEND_NEW_RECEIPT_MESSAGES_TO_RESIDENT_SCOPES_MUTATION = gql`
    mutation sendNewReceiptMessagesToResidentScopes ($data: SendNewReceiptMessagesToResidentScopesInput!) {
        result: sendNewReceiptMessagesToResidentScopes(data: $data) { 
            status 
        }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationProblem,
    BillingProperty,
    BillingAccount,
    BillingReceipt,
    ResidentBillingReceipt,
    RESIDENT_BILLING_RECEIPTS_FIELDS,
    BillingRecipient,
    BillingCategory,
    REGISTER_BILLING_RECEIPTS_MUTATION,

    SEND_NEW_RECEIPT_MESSAGES_TO_RESIDENT_SCOPES_MUTATION,
    BillingReceiptFile,
/* AUTOGENERATE MARKER <EXPORTS> */
}

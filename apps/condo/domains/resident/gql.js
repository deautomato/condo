/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const { ADDRESS_META_SUBFIELDS_QUERY_LIST } = require('@condo/domains/property/schema/fields/AddressMetaField')


const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const RESIDENT_ORGANIZATION_FIELDS = 'id name country tin'
const RESIDENT_PROPERTY_FIELDS = 'id name address'
const ORGANIZATION_FEATURES_FIELDS = 'hasBillingData hasMeters'
const PAYMENT_CATEGORIES_FIELDS = 'id categoryName billingName acquiringName'
const RESIDENT_FIELDS = `{ user { id name locale } organization { id name tin country } residentOrganization { ${RESIDENT_ORGANIZATION_FIELDS} } property { id createdAt deletedAt } residentProperty { ${RESIDENT_PROPERTY_FIELDS} } address addressMeta { ${ADDRESS_META_SUBFIELDS_QUERY_LIST} } unitName unitType ${COMMON_FIELDS} organizationFeatures { ${ORGANIZATION_FEATURES_FIELDS} } paymentCategories { ${PAYMENT_CATEGORIES_FIELDS} } }`
const Resident = generateGqlQueries('Resident', RESIDENT_FIELDS)

const REGISTER_RESIDENT_MUTATION = gql`
    mutation registerResident ($data: RegisterResidentInput!) {
        result: registerResident(data: $data) ${RESIDENT_FIELDS}
    }
`
const SERVICE_CONSUMER_FIELDS = `{ residentBillingAccount { id } residentAcquiringIntegrationContext { id integration { id hostUrl } } paymentCategory resident { id user { id locale } organization { id } unitType unitName deletedAt address } billingAccount { id number } accountNumber ${COMMON_FIELDS} organization { id name tin country } }`
const ServiceConsumer = generateGqlQueries('ServiceConsumer', SERVICE_CONSUMER_FIELDS)

const REGISTER_SERVICE_CONSUMER_MUTATION = gql`
    mutation registerServiceConsumer ($data: RegisterServiceConsumerInput!) {
        obj: registerServiceConsumer(data: $data) ${SERVICE_CONSUMER_FIELDS}
    }
`

const SEND_MESSAGE_TO_RESIDENT_SCOPES_MUTATION = gql`
    mutation sendMessageToResidentScopes ($data: SendMessageToResidentScopesServiceInput!) {
        result: sendMessageToResidentScopes(data: $data) { status }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Resident,
    REGISTER_RESIDENT_MUTATION,
    ServiceConsumer,
    REGISTER_SERVICE_CONSUMER_MUTATION,
    RESIDENT_ORGANIZATION_FIELDS,
    RESIDENT_PROPERTY_FIELDS,
    ORGANIZATION_FEATURES_FIELDS,
    PAYMENT_CATEGORIES_FIELDS,
    SEND_MESSAGE_TO_RESIDENT_SCOPES_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}

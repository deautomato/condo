/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { ADDRESS_META_SUBFIELDS_QUERY_LIST } = require('@condo/domains/property/schema/fields/AddressMetaField')
const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { gql } = require('graphql-tag')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const CONTACT_FIELDS = `{ organization { id name } property { id address addressMeta { ${ADDRESS_META_SUBFIELDS_QUERY_LIST} } } name phone unitName unitType email role { id name } ${COMMON_FIELDS} }`
const Contact = generateGqlQueries('Contact', CONTACT_FIELDS)

const CONTACT_ROLE_FIELDS = `{ name organization { id name } ${COMMON_FIELDS} }`
const ContactRole = generateGqlQueries('ContactRole', CONTACT_ROLE_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

const EXPORT_CONTACTS_TO_EXCEL =  gql`
    query exportContactsToExcel ($data: ExportContactsToExcelInput!) {
        result: exportContactsToExcel(data: $data) { status, linkToFile }
    }
`

const LOAD_CONTACTS = gql`
    query allContacts($where:ContactWhereInput) {
        result: allContacts(where:$where) ${CONTACT_FIELDS}
    }
`

module.exports = {
    Contact,
    EXPORT_CONTACTS_TO_EXCEL,
    ContactRole,
    LOAD_CONTACTS,
/* AUTOGENERATE MARKER <EXPORTS> */
}

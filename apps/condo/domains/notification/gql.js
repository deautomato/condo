/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const gql = require('graphql-tag')

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const MESSAGE_FIELDS = `{ organization { id } user { id email phone } email phone lang type meta status processingMeta deliveredAt ${COMMON_FIELDS} }`
const Message = generateGqlQueries('Message', MESSAGE_FIELDS)

const SEND_MESSAGE = gql`
    mutation sendMessage ($data: SendMessageInput!) {
        result: sendMessage(data: $data) { status id }
    }
`

const RESEND_MESSAGE = gql`
    mutation resendMessage ($data: ResendMessageInput!) {
        result: resendMessage(data: $data) { status id }
    }
`

const DEVICE_REQUIRED_FIELDS = 'deviceId pushToken pushTransport meta owner { id }'
const DEVICE_FIELDS = `{id ${DEVICE_REQUIRED_FIELDS}}`
const DEVICE_FIELDS_WITH_COMMON = `{${DEVICE_REQUIRED_FIELDS} ${COMMON_FIELDS}}`

const Device = generateGqlQueries('Device', DEVICE_FIELDS_WITH_COMMON)

const SYNC_DEVICE_MUTATION = gql`
    mutation syncDevice ($data: SyncDeviceInput!) {
        result: syncDevice(data: $data) ${DEVICE_FIELDS}
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Message,
    SEND_MESSAGE,
    RESEND_MESSAGE,

    Device,
    SYNC_DEVICE_MUTATION,

/* AUTOGENERATE MARKER <EXPORTS> */
}

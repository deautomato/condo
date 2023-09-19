/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 */

const get = require('lodash/get')
const isEmpty = require('lodash/isEmpty')
const omit = require('lodash/omit')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById, find } = require('@open-condo/keystone/schema')

const { checkPermissionInUserOrganizationOrRelatedOrganization, queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { Resident } = require('@condo/domains/resident/utils/serverSchema')
const { CANCELED_STATUS_TYPE } = require('@condo/domains/ticket/constants')
const {
    AVAILABLE_TICKET_FIELDS_FOR_UPDATE_BY_RESIDENT,
    INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_RESIDENT,
    INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_STAFF,
} = require('@condo/domains/ticket/constants/common')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { canDirectlyManageSchemaObjects, canDirectlyReadSchemaObjects } = require('@condo/domains/user/utils/directAccess')

async function canReadTickets ({ authentication: { item: user }, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    const hasDirectAccess = await canDirectlyReadSchemaObjects(user, listKey)
    if (hasDirectAccess) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })

        if (isEmpty(residents)) return false

        return {
            client: { id: user.id },
            canReadByResident: true,
        }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
            deletedAt: null,
        },
    }
}

async function canManageTickets ({ authentication: { item: user }, operation, itemId, originalInput, context, listKey }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const hasDirectAccess = await canDirectlyManageSchemaObjects(user, listKey)
    if (hasDirectAccess) return true

    if (user.type === RESIDENT) {
        const changedInaccessibleFields = Object.keys(originalInput).some(field => INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_RESIDENT.includes(field))
        if (changedInaccessibleFields) return false

        if (operation === 'create') {
            const unitName = get(originalInput, 'unitName', null)
            const propertyId = get(originalInput, ['property', 'connect', 'id'])

            if (!unitName || !propertyId) return false

            const residentsCount = await Resident.count(context, {
                user: { id: user.id },
                property: { id: propertyId, deletedAt: null },
                unitName,
                deletedAt: null,
            })

            return residentsCount > 0
        } else if (operation === 'update') {
            if (!itemId) return false

            const inaccessibleUpdatedFields = omit(originalInput, AVAILABLE_TICKET_FIELDS_FOR_UPDATE_BY_RESIDENT)
            if (!isEmpty(inaccessibleUpdatedFields)) return false

            const ticket = await getById('Ticket', itemId)
            if (!ticket) return false

            const updatedStatusId = get(originalInput, 'status.connect.id')
            if (updatedStatusId) {
                const ticketStatus = await getById('TicketStatus', updatedStatusId)

                if (!ticketStatus) return false
                if (ticketStatus.organization && ticketStatus.organization !== ticket.organization) return false
                if (ticketStatus.type !== CANCELED_STATUS_TYPE) return false
            }

            return ticket.client === user.id
        }
    } else {
        const changedInaccessibleFields = Object.keys(originalInput).some(field => INACCESSIBLE_TICKET_FIELDS_FOR_MANAGE_BY_STAFF.includes(field))
        if (changedInaccessibleFields) return false

        let organizationId

        if (operation === 'create') {
            organizationId = get(originalInput, ['organization', 'connect', 'id'])
        } else if (operation === 'update') {
            if (!itemId) return false
            const ticket = await getById('Ticket', itemId)
            organizationId = get(ticket, 'organization', null)
        }

        const permission = await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageTickets')
        if (!permission) return false

        const propertyId = get(originalInput, ['property', 'connect', 'id'], null)
        if (propertyId) {
            const property = await getById('Property', propertyId)
            if (!property) return false

            return organizationId === get(property, 'organization')
        }

        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTickets,
    canManageTickets,
}
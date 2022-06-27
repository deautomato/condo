/**
 * Generated by `createschema ticket.TicketPropertyHintProperty 'organization:Relationship:Organization:CASCADE;ticketPropertyHint:Relationship:TicketPropertyHint:CASCADE; property:Relationship:Property:SET_NULL;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { TicketPropertyHintProperty as TicketPropertyHintPropertyGQL } from '@condo/domains/ticket/gql'
import { TicketPropertyHintProperty, TicketPropertyHintPropertyUpdateInput, QueryAllTicketPropertyHintPropertiesArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'ticketPropertyHint', 'property']
const RELATIONS = ['organization', 'ticketPropertyHint', 'property']

export interface ITicketPropertyHintPropertyUIState extends TicketPropertyHintProperty {
    id: string
    address: string
}

function convertToUIState (item: TicketPropertyHintProperty): ITicketPropertyHintPropertyUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as ITicketPropertyHintPropertyUIState
}

export interface ITicketPropertyHintPropertyFormState {
    id?: string
    organization?: string
    ticketPropertyHint?: string
    property?: string
}

function convertToUIFormState (state: ITicketPropertyHintPropertyUIState): ITicketPropertyHintPropertyFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as ITicketPropertyHintPropertyFormState
}

function convertToGQLInput (state: ITicketPropertyHintPropertyFormState): TicketPropertyHintPropertyUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
} = generateReactHooks<TicketPropertyHintProperty, TicketPropertyHintPropertyUpdateInput, ITicketPropertyHintPropertyFormState, ITicketPropertyHintPropertyUIState, QueryAllTicketPropertyHintPropertiesArgs>(TicketPropertyHintPropertyGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    useSoftDelete,
    convertToUIFormState,
}

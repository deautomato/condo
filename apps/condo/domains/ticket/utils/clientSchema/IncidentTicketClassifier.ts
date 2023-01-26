/**
 * Generated by `createschema ticket.IncidentTicketClassifier 'incident:Relationship:Incident:CASCADE; classifier:Relationship:TicketClassifier:PROTECT;'`
 */

import {
    IncidentTicketClassifier,
    IncidentTicketClassifierCreateInput,
    IncidentTicketClassifierUpdateInput,
    QueryAllIncidentTicketClassifiersArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { IncidentTicketClassifier as IncidentTicketClassifierGQL } from '@condo/domains/ticket/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
} = generateReactHooks<IncidentTicketClassifier, IncidentTicketClassifierCreateInput, IncidentTicketClassifierUpdateInput, QueryAllIncidentTicketClassifiersArgs>(IncidentTicketClassifierGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
}
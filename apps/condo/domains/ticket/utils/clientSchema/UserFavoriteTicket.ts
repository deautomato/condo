/**
 * Generated by `createschema ticket.UserFavoriteTicket 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE;'`
 */

import {
    UserFavoriteTicket,
    UserFavoriteTicketCreateInput,
    UserFavoriteTicketUpdateInput,
    QueryAllUserFavoriteTicketsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { UserFavoriteTicket as UserFavoriteTicketGQL } from '@condo/domains/ticket/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
} = generateReactHooks<UserFavoriteTicket, UserFavoriteTicketCreateInput, UserFavoriteTicketUpdateInput, QueryAllUserFavoriteTicketsArgs>(UserFavoriteTicketGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useAllObjects,
}

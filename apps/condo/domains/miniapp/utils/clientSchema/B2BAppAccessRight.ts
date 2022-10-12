/**
 * Generated by `createschema miniapp.B2BAppAccessRight 'user:Relationship:User:PROTECT;'`
 */

import {
    B2BAppAccessRight,
    B2BAppAccessRightCreateInput,
    B2BAppAccessRightUpdateInput,
    QueryAllB2BAppAccessRightsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { B2BAppAccessRight as B2BAppAccessRightGQL } from '@condo/domains/miniapp/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<B2BAppAccessRight, B2BAppAccessRightCreateInput, B2BAppAccessRightUpdateInput, QueryAllB2BAppAccessRightsArgs>(B2BAppAccessRightGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}

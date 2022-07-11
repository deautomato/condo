/**
 * Generated by `createschema organization.TokenSet 'user:Relationship:User:SET_NULL; organization:Relationship:Organization:SET_NULL; importRemoteSystem:Text; accessToken:Text; accessTokenExpiresAt:DateTimeUtc; refreshToken:Text; refreshTokenExpiresAt:DateTimeUtc;'`
 */

import {
    TokenSet,
    TokenSetCreateInput,
    TokenSetUpdateInput,
    QueryAllTokenSetsArgs,
} from '@app/condo/schema'
import { generateNewReactHooks } from '@condo/domains/common/utils/codegeneration/new.generate.hooks'
import { TokenSet as TokenSetGQL } from '@condo/domains/organization/gql'

const {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
} = generateNewReactHooks<TokenSet, TokenSetCreateInput, TokenSetUpdateInput, QueryAllTokenSetsArgs>(TokenSetGQL)

export {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
}

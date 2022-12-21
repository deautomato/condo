/**
 * Generated by `createservice user.UserExternalIdentityUserFormCallbackService`
 */
const { isNil } = require('lodash')

const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const access = require('@condo/domains/user/access/UserExternalIdentityUserFormCallbackService')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')

const { UserExternalIdentity } = require('@condo/domains/user/utils/serverSchema')
const { getIdentityIntegration } = require('@condo/domains/user/integration/identity')
const { IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM } = require('@condo/domains/user/constants/errors')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM: {
        mutation: 'userExternalIdentityUserFormCallback',
        variable: ['identityType'],
        code: BAD_USER_INPUT,
        type: IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM,
        message: 'Identity integration does not support login form',
    },
}

const UserExternalIdentityUserFormCallbackService = new GQLCustomSchema('UserExternalIdentityUserFormCallbackService', {
    types: [
        {
            access: true,
            type: 'input UserExternalIdentityUserFormCallbackInput { identityType: IdentityType!, params: JSON! }',
        },
        {
            access: true,
            type: 'type UserExternalIdentityUserFormCallbackOutput { registered: Boolean!, tokenSet: JSON! }',
        },
    ],
    
    mutations: [
        {
            access: access.canUserExternalIdentityUserFormCallback,
            schema: 'userExternalIdentityUserFormCallback(data: UserExternalIdentityUserFormCallbackInput!): UserExternalIdentityUserFormCallbackOutput',
            resolver: async (parent, { data: { identityType, params } }, context) => {
                const integration = getIdentityIntegration(identityType)

                // in some case identityType can not support login form
                if (isNil(integration)) {
                    throw new GQLError(errors.IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM, context)
                }

                // next step is to retrieve integration token set
                const tokenSet = await integration.issueExternalIdentityToken(params)

                // once we have token set - let's retrieve user external identity id
                const id = await integration.getUserExternalIdentityId(tokenSet)

                // let's check that user are registered
                const userIdentityCount = await UserExternalIdentity.count(context, {
                    identityType,
                    identityId: id,
                })
                const registered = userIdentityCount > 0

                return {
                    registered,
                    tokenSet,
                }
            },
        },
    ],
    
})

module.exports = {
    UserExternalIdentityUserFormCallbackService,
}
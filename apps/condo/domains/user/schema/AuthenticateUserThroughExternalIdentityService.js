/**
 * Generated by `createservice user.AuthenticateUserThroughExternalIdentityService`
 */
const { isNil } = require('lodash')

const { GQLCustomSchema, getSchemaCtx } = require('@open-condo/keystone/schema')
const access = require('@condo/domains/user/access/AuthenticateUserThroughExternalIdentityService')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')


const { UserExternalIdentity, User } = require('@condo/domains/user/utils/serverSchema')
const { getIdentityIntegration } = require('@condo/domains/user/integration/identity')
const { IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM, USER_NOT_FOUND } = require('@condo/domains/user/constants/errors')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM: {
        mutation: 'authenticateUserThroughExternalIdentity',
        variable: ['data', 'identityType'],
        code: BAD_USER_INPUT,
        type: IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM,
        message: 'Identity integration does not support login form',
    },
    USER_NOT_FOUND: {
        mutation: 'authenticateUserThroughExternalIdentity',
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND,
        message: 'Unable to find user by provided external identity. Try to register',
        variable: ['data', 'tokenSet'],
        messageForUser: 'api.user.authenticateUserThroughExternalIdentity.USER_NOT_FOUND',
    },
}

const AuthenticateUserThroughExternalIdentityService = new GQLCustomSchema('AuthenticateUserThroughExternalIdentityService', {
    types: [
        {
            access: true,
            type: 'input AuthenticateUserThroughExternalIdentityInput { identityType: IdentityType!, tokenSet: JSON! }',
        },
        {
            access: true,
            type: 'type AuthenticateUserThroughExternalIdentityOutput { item: User!, token: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canAuthenticateUserThroughExternalIdentity,
            schema: 'authenticateUserThroughExternalIdentity(data: AuthenticateUserThroughExternalIdentityInput!): AuthenticateUserThroughExternalIdentityOutput',
            resolver: async (parent, { data: { identityType, tokenSet } }, context) => {
                const integration = getIdentityIntegration(identityType)

                // in some case identityType can not support login form
                if (isNil(integration)) {
                    throw new GQLError(errors.IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM, context)
                }

                const { id } = await integration.getUserInfo(tokenSet)

                const userIdentities = await UserExternalIdentity.getAll(context, {
                    identityType,
                    identityId: id,
                })

                if (userIdentities.length < 1) {
                    throw new GQLError(errors.USER_NOT_FOUND, context)
                }

                const [ identity ] = userIdentities
                const { user: { id: userId } } = identity
                const user = await User.getOne(context, { id: userId })
                const { keystone } = await getSchemaCtx('User')
                const token = await context.startAuthedSession({ item: user, list: keystone.lists['User'] })

                return {
                    item: user,
                    token,
                }
            },
        },
    ],
    
})

module.exports = {
    AuthenticateUserThroughExternalIdentityService,
}
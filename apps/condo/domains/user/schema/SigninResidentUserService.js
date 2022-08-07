/**
 * Generated by `createservice user.SigninResidentUserService`
 */
const { GQLCustomSchema, getById } = require('@condo/keystone/schema')
const { getSchemaCtx } = require('@condo/keystone/schema')
const access = require('@condo/domains/user/access/SigninResidentUserService')
const { ConfirmPhoneAction, User } = require('@condo/domains/user/utils/serverSchema')
const { getRandomString } = require('@condo/keystone/test.utils')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT, INTERNAL_ERROR } } = require('@condo/keystone/errors')
const { TOKEN_NOT_FOUND, UNABLE_TO_CREATE_USER } = require('../constants/errors')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const { RESIDENT } = require('@condo/domains/user/constants/common')

/**
 * List of possible errors, that this custom schema can throw
 * They will be rendered in documentation section in GraphiQL for this custom schema
 */
const errors = {
    UNABLE_TO_FIND_CONFIRM_PHONE_ACTION: {
        mutation: 'signinResidentUser',
        variable: ['data', 'token'],
        code: BAD_USER_INPUT,
        type: TOKEN_NOT_FOUND,
        message: 'Unable to find a non-expired confirm phone action, that corresponds to provided token',
        messageForUser: 'api.user.signinResidentUser.TOKEN_NOT_FOUND',
    },
    UNABLE_TO_CREATE_USER: {
        code: INTERNAL_ERROR,
        type: UNABLE_TO_CREATE_USER,
        mutation: 'signinResidentUser',
        message: 'Something went wrong while trying to create a User record',
        messageForUser: 'api.user.signinResidentUser.UNABLE_TO_CREATE_USER',
    },
}

const SigninResidentUserService = new GQLCustomSchema('SigninResidentUserService', {
    types: [
        {
            access: true,
            type: 'input SigninResidentUserInput { dv: Int!, sender: SenderFieldInput!, token: String! }',
        },
        {
            access: true,
            type: 'type SigninResidentUserOutput { user: User, token: String! }',
        },
    ],

    mutations: [
        {
            access: access.canSigninResidentUser,
            schema: 'signinResidentUser(data: SigninResidentUserInput!): SigninResidentUserOutput',
            doc: {
                summary: 'Authenticates resident user for mobile apps',
                errors,
            },
            resolver: async (parent, args, context) => {
                // TODO(DOMA-3209): check the dv === 1 and sender value
                const { data: { dv, sender, token } } = args
                const userData = {
                    dv: 1,
                    sender,
                    type: RESIDENT,
                    isPhoneVerified: false,
                }
                if (!token) {
                    throw new GQLError(errors.UNABLE_TO_FIND_CONFIRM_PHONE_ACTION, context)
                }
                const action = await ConfirmPhoneAction.getOne(context,
                    {
                        token,
                        expiresAt_gte: new Date().toISOString(),
                        completedAt: null,
                        isPhoneVerified: true,
                    }
                )
                if (!action) {
                    throw new GQLError(errors.UNABLE_TO_FIND_CONFIRM_PHONE_ACTION, context)
                }
                if (action.phone !== normalizePhone(action.phone)) {
                    throw new Error('internal error: wrong phone format from ConfirmPhoneAction')
                }
                // NOTE(pahaz): it's a time based security issue! You need to use update if the user exists to avoid it.
                // But, really, we need to have a valid Confirm Phone Token it's a reason why it's not critical
                let user = await User.getOne(context, { type: RESIDENT, phone: action.phone })
                if (!user) {
                    userData.phone = action.phone
                    userData.isPhoneVerified = action.isPhoneVerified
                    userData.password = getRandomString()
                    user = await User.create(context, userData)
                    if (!user) {
                        throw new GQLError(errors.UNABLE_TO_CREATE_USER, context)
                    }
                }
                await ConfirmPhoneAction.update(context, action.id, { dv: 1, sender, completedAt: new Date().toISOString() })
                const { keystone } = await getSchemaCtx('User')
                const sessionToken = await context.startAuthedSession({ item: user, list: keystone.lists['User'] })
                return {
                    user: await getById('User', user.id),
                    token: sessionToken,
                }
            },
        },
    ],

})

module.exports = {
    SigninResidentUserService,
}

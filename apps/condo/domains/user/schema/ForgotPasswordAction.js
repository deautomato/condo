/**
 * Generated by `createschema user.ForgotPasswordAction 'user:Relationship:User:CASCADE; token:Text; requestedAt:DateTimeUtc; expiresAt:DateTimeUtc; usedAt?:DateTimeUtc;'`
 */

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/user/access/ForgotPasswordAction')

const ForgotPasswordAction = new GQLListSchema('ForgotPasswordAction', {
    schemaDoc: 'Forgot password actions is used for anonymous user password recovery procedure',
    fields: {
        user: {
            schemaDoc: 'Ref to the user. The object will be deleted if the user ceases to exist',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },
        token: {
            schemaDoc: 'Unique token to complete confirmation',
            type: 'Text',
            isRequired: true,
            isUnique: true,
        },
        requestedAt: {
            schemaDoc: 'DateTime when confirm phone action was started',
            type: 'DateTimeUtc',
            isRequired: true,
        },
        expiresAt: {
            schemaDoc: 'When password recovery action becomes invalid',
            type: 'DateTimeUtc',
            isRequired: true,
        },
        usedAt: {
            schemaDoc: 'When password recovery action was completed',
            type: 'DateTimeUtc',
            isRequired: false,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadForgotPasswordAction,
        create: access.canManageForgotPasswordAction,
        update: access.canManageForgotPasswordAction,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ForgotPasswordAction,
}

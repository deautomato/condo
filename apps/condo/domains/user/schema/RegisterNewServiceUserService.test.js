/**
 * Generated by `createservice user.RegisterNewServiceUserService`
 */
const { makeLoggedInAdminClient, makeClient } = require('@condo/keystone/test.utils')

const {
    registerNewServiceUserByTestClient,
    makeLoggedInClient,
    makeClientWithSupportUser, User,
} = require('@condo/domains/user/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationError, catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { EMAIL_ALREADY_REGISTERED_ERROR } = require('@condo/domains/user/constants/errors')
const { GET_MY_USERINFO } = require('@condo/domains/user/gql')
const { SERVICE } = require('@condo/domains/user/constants/common')

describe('RegisterNewServiceUserServiceAccess', () => {
    test('admin can create service user', async () => {
        const client = await makeLoggedInAdminClient()
        const [{ email, password }] = await registerNewServiceUserByTestClient(client)
        const serviceClient = await makeLoggedInClient({ email: email, password: password })
        const { data: { user } } = await serviceClient.query(GET_MY_USERINFO)
        expect(user.id).toEqual(serviceClient.user.id)
        expect(user.type).toEqual(SERVICE)
    })
    test('support can create service user', async () => {
        const client = await makeClientWithSupportUser()
        const [{ email, password }] = await registerNewServiceUserByTestClient(client)
        const serviceClient = await makeLoggedInClient({ email: email, password: password })
        const { data: { user } } = await serviceClient.query(GET_MY_USERINFO)
        expect(user.id).toEqual(serviceClient.user.id)
        expect(user.type).toEqual(SERVICE)
    })
    test('user can not create service user', async () => {
        const client = await makeLoggedInClient()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerNewServiceUserByTestClient(client)
        })
    })
    test('deleted admin can not register service user', async () => {
        const client = await makeClientWithSupportUser()
        const admin = await makeLoggedInAdminClient()
        await User.update(admin, client.user.id, { dv: 1, sender: { dv: 1, fingerprint: 'tests' }, deletedAt: 'true' })
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerNewServiceUserByTestClient(client)
        })
    })
    test('anonymous can not register service user', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationError(async () => {
            await registerNewServiceUserByTestClient(client)
        }, 'result')
    })
})

describe('RegisterNewServiceUserServiceLogic', () => {
    test('can not register service user with existed email', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await registerNewServiceUserByTestClient(admin)
        const email = userAttrs.email
        // TODO(DOMA-3146): use the GQLError util
        await catchErrorFrom(async () => {
            await registerNewServiceUserByTestClient(admin, { email })
        }, ({ errors }) => {
            expect(errors[0].originalError.errors[0].data.messages[0]).toEqual(
                expect.stringContaining(EMAIL_ALREADY_REGISTERED_ERROR))
        })
    })
})
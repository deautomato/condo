/**
 * Generated by `createservice user.ResetUserService --type mutations`
 */

const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')
const { makeClient } = require('@open-condo/keystone/test.utils')
const { catchErrorFrom } = require('@open-condo/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult } = require('@open-condo/keystone/test.utils')

const {
    RecurrentPaymentContext,
    createTestRecurrentPaymentContext,
} = require('@condo/domains/acquiring/utils/testSchema')
const { createTestBillingCategory } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithRegisteredOrganization, OrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { DELETED_USER_NAME } = require('@condo/domains/user/constants')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    registerNewUser,
    resetUserByTestClient,
    makeClientWithSupportUser,
    UserAdmin, UserExternalIdentity,
} = require('@condo/domains/user/utils/testSchema')

const { SBER_ID_IDP_TYPE } = require('../constants/common')
const { createTestUserExternalIdentity } = require('../utils/testSchema')


describe('ResetUserService', () => {
    let support
    let admin

    beforeAll(async () => {
        support = await makeClientWithSupportUser()
        admin = await makeLoggedInAdminClient()
    })

    test('support can reset user', async () => {
        const [user] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }

        await resetUserByTestClient(support, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('two reset users do not violate constrains', async () => {
        const [user] = await registerNewUser(await makeClient())
        const [user2] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }
        await resetUserByTestClient(support, payload)

        const payload2 = {
            user: { id: user2.id },
        }
        await resetUserByTestClient(support, payload2)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()

        const [resetUser2] = await UserAdmin.getAll(admin, { id: user.id })
        expect(resetUser2.id).toEqual(user.id)
        expect(resetUser2.name).toEqual(DELETED_USER_NAME)
        expect(resetUser2.phone).toBeNull()
        expect(resetUser2.email).toBeNull()
    })

    test('support cant reset non existing user', async () => {
        const userId = faker.datatype.uuid()
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(support, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'Could not find User by provided id',
                name: 'GQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'BAD_USER_INPUT',
                    type: 'USER_NOT_FOUND',
                },
            }])
        })
    })

    test('support cant reset admin user', async () => {
        const userId = admin.user.id
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(support, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'You cannot reset admin user',
                name: 'GQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'FORBIDDEN',
                    type: 'CANNOT_RESET_ADMIN_USER',
                },
            }])
        })
    })

    test('user can reset their account', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('user can reset their account with associated UserExternalIdentity', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()

        // create user external identity
        const [identity] = await createTestUserExternalIdentity(admin, {
            user: { connect: { id: client.user.id } },
            identityId: faker.random.alphaNumeric(8),
            identityType: SBER_ID_IDP_TYPE,
            meta: {
                dv: 1, city: faker.address.city(), county: faker.address.county(),
            },
        })

        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)

        const foundIdentity = await UserExternalIdentity.getAll(admin, { id: identity.id })
        expect(foundIdentity).toHaveLength(0)
    })

    test('user can reset their account with deleted UserExternalIdentity', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()

        // create user external identity
        const [identity] = await createTestUserExternalIdentity(admin, {
            user: { connect: { id: client.user.id } },
            identityId: faker.random.alphaNumeric(8),
            identityType: SBER_ID_IDP_TYPE,
            meta: {
                dv: 1, city: faker.address.city(), county: faker.address.county(),
            },
        })

        // remove user external identity
        await UserExternalIdentity.softDelete(client, identity.id)

        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)

        const foundIdentity = await UserExternalIdentity.getAll(admin, { id: identity.id })
        expect(foundIdentity).toHaveLength(0)
    })

    test('user can reset their account with deleted OrganizationEmployee', async () => {
        const client = await makeClientWithRegisteredOrganization()

        // remove one OrganizationEmployee
        const [{ id }] = await OrganizationEmployee.getAll(client)
        await OrganizationEmployee.softDelete(support, id)

        // reset
        await resetUserByTestClient(support, { user: { id: client.user.id } })

        const canAccessObjs = await OrganizationEmployee.getAll(client)
        expect(canAccessObjs).toHaveLength(0)
    })

    test('user can reset their account with associated RecurrentPaymentContext', async () => {
        const client = await makeClientWithServiceConsumer()

        // create recurrent payment context
        const [billingCategory] = (await createTestBillingCategory(admin, { name: `Category ${new Date()}` }))
        const [obj] = await createTestRecurrentPaymentContext(admin, {
            enabled: false,
            limit: '10000',
            autoPayReceipts: false,
            paymentDay: 10,
            settings: { cardId: faker.datatype.uuid() },
            serviceConsumer: { connect: { id: client.serviceConsumer.id } },
            billingCategory: { connect: { id: billingCategory.id } },
        })

        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)

        const contexts = await RecurrentPaymentContext.getAll(admin, { id: obj.id })
        expect(contexts).toHaveLength(0)
    })

    test('user can reset their account with deleted RecurrentPaymentContext', async () => {
        const client = await makeClientWithServiceConsumer()

        // create recurrent payment context
        const [billingCategory] = (await createTestBillingCategory(admin, { name: `Category ${new Date()}` }))
        const [obj] = await createTestRecurrentPaymentContext(admin, {
            enabled: false,
            limit: '10000',
            autoPayReceipts: false,
            paymentDay: 10,
            settings: { cardId: faker.datatype.uuid() },
            serviceConsumer: { connect: { id: client.serviceConsumer.id } },
            billingCategory: { connect: { id: billingCategory.id } },
        })
        await RecurrentPaymentContext.softDelete(client, obj.id)

        const payload = {
            user: { id: client.user.id },
        }

        await resetUserByTestClient(client, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const [resetUser] = await UserAdmin.getAll(admin, { id: client.user.id })
        expect(resetUser.id).toEqual(client.user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)

        const contexts = await RecurrentPaymentContext.getAll(admin, { id: obj.id })
        expect(contexts).toHaveLength(0)
    })

    test('user cant reset another user', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {
            user: { id: client.user.id },
        }

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await resetUserByTestClient(client2, payload)
        })
    })

    test('anonymous cant reset user', async () => {
        const client = await makeClient()
        const userToResetId = faker.datatype.uuid()

        await expectToThrowAuthenticationErrorToResult(async () => {
            await resetUserByTestClient(client, { user: { id: userToResetId } })
        })
    })

    test('user will removed from all organizations after reset', async () => {
        const client = await makeClientWithRegisteredOrganization()
        await resetUserByTestClient(support, { user: { id: client.user.id } })

        const canAccessObjs = await OrganizationEmployee.getAll(client)
        expect(canAccessObjs).toHaveLength(0)
    })

    test('all associated UserExternalEdentity will be removed after reset', async () => {
        const client = await makeClientWithRegisteredOrganization()

        const [identity] = await createTestUserExternalIdentity(admin, {
            user: { connect: { id: client.user.id } },
            identityId: faker.random.alphaNumeric(8),
            identityType: SBER_ID_IDP_TYPE,
            meta: {
                dv: 1, city: faker.address.city(), county: faker.address.county(),
            },
        })

        await resetUserByTestClient(support, { user: { id: client.user.id } })

        const foundIdentity = await UserExternalIdentity.getAll(admin, { id: identity.id })

        expect(foundIdentity).toHaveLength(0)
    })

    test('save user name if saveName true is provided', async () => {
        const [user] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
            saveName: true,
        }

        await resetUserByTestClient(support, payload)

        const [resetUser] = await UserAdmin.getAll(admin, { id: user.id })

        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(user.name)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('clear user name if saveName false is provided or saveName is not provided', async () => {
        const [user1] = await registerNewUser(await makeClient())
        const [user2] = await registerNewUser(await makeClient())

        const payload1 = {
            user: { id: user1.id },
            saveName: false,
        }

        const payload2 = {
            user: { id: user2.id },
        }

        await resetUserByTestClient(support, payload1)
        await resetUserByTestClient(support, payload2)

        const resetUser1 = await UserAdmin.getOne(admin, { id: user1.id })
        const resetUser2 = await UserAdmin.getOne(admin, { id: user2.id })

        expect(resetUser1.name).toEqual(DELETED_USER_NAME)
        expect(resetUser1.phone).toBeNull()
        expect(resetUser1.email).toBeNull()

        expect(resetUser2.name).toEqual(DELETED_USER_NAME)
        expect(resetUser2.phone).toBeNull()
        expect(resetUser2.email).toBeNull()
    })
})

/**
 * Generated by `createschema notification.BlackList 'organization?:Relationship:Organization:SET_NULL; user?:Relationship:User:CASCADE; phone?:Text; email?:Text;'`
 */

const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, waitFor } = require('@core/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { BlackList, createTestBlackList, updateTestBlackList } = require('@condo/domains/notification/utils/testSchema')
const { createTestBillingIntegrationLog } = require('@condo/domains/billing/utils/testSchema')

describe('BlackList', () => {
    describe('accesses', () => {
        describe('create', () => {
            it('support can create BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestBlackList(supportClient)

                expect(blackList.id).toMatch(UUID_RE)
            })

            it('user cannot create BlackList', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBlackList(userClient)
                })
            })

            it('anonymous cannot create BlackList', async () => {
                const anonymousClient = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBlackList(anonymousClient)
                })
            })
        })

        describe('update', () => {
            it('support can update BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                const [updatedBlackList] = await updateTestBlackList(supportClient, blackList.id, {
                    description,
                })

                expect(updatedBlackList.description).toEqual(description)
            })

            it('user cannot update BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                const [blackList] = await createTestBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBlackList(userClient, blackList.id, {
                        description,
                    })
                })
            })

            it('anonymous cannot update BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                const [blackList] = await createTestBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBlackList(anonymousClient, blackList.id, {
                        description,
                    })
                })
            })
        })

        describe('read', () => {
            it('user cannot read BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestBlackList(supportClient)

                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await BlackList.getAll(userClient)
                })
            })

            it('anonymous cannot read BlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                await createTestBlackList(supportClient)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BlackList.getAll(anonymousClient)
                })
            })
        })
    })
})

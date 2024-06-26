/**
 * Generated by `createservice notification._internalSendHashedResidentPhonesService '--type=mutations'`
 */

const { makeClient, expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult } = require('@open-condo/keystone/test.utils')

const { UUID_REGEXP } = require('@condo/domains/common/constants/regexps')
const { _internalSendHashedResidentPhonesByTestClient } = require('@condo/domains/notification/utils/testSchema')
const { createTestUserRightsSet, updateTestUser, makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')

 
describe('_internalSendHashedResidentPhonesService', () => {
    let support
    let anonymous

    beforeAll(async () => {
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
    })

    test('anonymous: can not execute', async () => {
        await expectToThrowAuthenticationErrorToResult(async () => {
            await _internalSendHashedResidentPhonesByTestClient(anonymous)
        })
    })

    test('user without access right set: can not execute', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await _internalSendHashedResidentPhonesByTestClient(userClient)
        })
    })

    test('user with access right set: can execute', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        const [userRightsSet] = await createTestUserRightsSet(support, { canExecute_internalSendHashedResidentPhones: true })
        await updateTestUser(support, userClient.user.id, { rightsSet: { connect: { id: userRightsSet.id } } })

        const [data] = await _internalSendHashedResidentPhonesByTestClient(userClient)

        expect(data.taskId).toMatch(UUID_REGEXP)
    })
})
/**
 * Generated by `createschema onboarding.UserHelpRequestFileFile 'userHelpRequestFile?:Relationship:UserHelpRequestFile:CASCADE;file:File'`
 */

const { makeLoggedInAdminClient, makeClient } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { createTestUserHelpRequest } = require('@condo/domains/onboarding/utils/testSchema')
const { createTestUserHelpRequestFile, UserHelpRequestFile, updateTestUserHelpRequestFile } = require('@condo/domains/onboarding/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')


describe('UserHelpRequestFileFile', () => {
    let admin, support, anonymous, organization, employeeUser, notEmployeeUser, residentClient,
        employeeUserRequest, connectHelpRequestPayload, employeeHelpRequestFile

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        employeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
        notEmployeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()

        const [testOrganization] = await createTestOrganization(admin)
        organization = testOrganization

        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageCallRecords: true,
            canManageTickets: true,
        })
        await createTestOrganizationEmployee(admin, organization, employeeUser.user, role)

        const [helpRequest] = await createTestUserHelpRequest(employeeUser, organization)
        employeeUserRequest = helpRequest

        connectHelpRequestPayload = { userHelpRequest: { connect: { id: employeeUserRequest.id } } }

        const [helpRequestFile] = await createTestUserHelpRequestFile(employeeUser, connectHelpRequestPayload)
        employeeHelpRequestFile = helpRequestFile

        residentClient = await makeClientWithResidentUser()
    })

    describe('Access', () => {
        describe('Create', () => {
            it('admin can', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                expect(helpRequestFile).toBeDefined()
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestUserHelpRequestFile(anonymous)
                })
            })

            it('support can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestUserHelpRequestFile(support, connectHelpRequestPayload)
                })
            })

            it('user: can create without help request connection', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(notEmployeeUser)

                expect(helpRequestFile).toBeDefined()
            })

            it('user: can create with help request connection if he is employee', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(employeeUser, connectHelpRequestPayload)

                expect(helpRequestFile).toBeDefined()
                expect(helpRequestFile.userHelpRequest.id).toEqual(employeeUserRequest.id)
            })

            it('user: can not create with help request connection if he is not employee', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestUserHelpRequestFile(notEmployeeUser, connectHelpRequestPayload)
                })
            })

            it('user with resident type: can not', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestUserHelpRequestFile(residentClient)
                })
            })
        })

        describe('Read', () => {
            it('admin can', async () => {
                const readHelpRequestFile = await UserHelpRequestFile.getOne(admin, { id: employeeHelpRequestFile.id })
                expect(readHelpRequestFile).toBeDefined()
            })

            it('anonymous can not', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await UserHelpRequestFile.getOne(anonymous, { id: employeeHelpRequestFile.id })
                })
            })

            it('support can', async () => {
                const readHelpRequestFile = await UserHelpRequestFile.getOne(support, { id: employeeHelpRequestFile.id })
                expect(readHelpRequestFile).toBeDefined()
            })

            it('user: can read own help request files', async () => {
                const readHelpRequestFile = await UserHelpRequestFile.getOne(employeeUser, { id: employeeHelpRequestFile.id })
                expect(readHelpRequestFile).toBeDefined()
            })

            it('user: can not read not his help request files', async () => {
                const readHelpRequestFile = await UserHelpRequestFile.getOne(notEmployeeUser, { id: employeeHelpRequestFile.id })
                expect(readHelpRequestFile).toBeUndefined()
            })
        })

        describe('Update', () => {
            it('admin can', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)
                const [updatedHelpRequestFile] = await updateTestUserHelpRequestFile(admin, helpRequestFile.id, connectHelpRequestPayload)

                expect(updatedHelpRequestFile.userHelpRequest.id).toEqual(employeeUserRequest.id)
            })

            it('anonymous can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(anonymous, helpRequestFile.id, connectHelpRequestPayload)
                })
            })

            it('support can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(support, helpRequestFile.id, connectHelpRequestPayload)
                })
            })

            it('user: can update his help request file', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(employeeUser)
                const [updatedHelpRequestFile] = await updateTestUserHelpRequestFile(employeeUser, helpRequestFile.id, connectHelpRequestPayload)

                expect(updatedHelpRequestFile.userHelpRequest.id).toEqual(employeeUserRequest.id)
            })

            it('user: can not update not his help request file', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(employeeUser, helpRequestFile.id, connectHelpRequestPayload)
                })
            })

            it('user: can connect help request only one time', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(employeeUser)
                const [updatedHelpRequestFile] = await updateTestUserHelpRequestFile(employeeUser, helpRequestFile.id, connectHelpRequestPayload)

                expect(updatedHelpRequestFile.userHelpRequest.id).toEqual(employeeUserRequest.id)

                const [otherHelpRequest] = await createTestUserHelpRequest(employeeUser, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(support, helpRequestFile.id, {
                        userHelpRequest: { connect: { id: otherHelpRequest.id } },
                    })
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(support, helpRequestFile.id, {
                        userHelpRequest: { disconnectAll: true },
                    })
                })
            })

            it('user with resident type: can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(residentClient, helpRequestFile.id, connectHelpRequestPayload)
                })
            })
        })

        describe('Soft Delete', () => {
            it('admin can', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)
                const [deletedRequestFile] = await updateTestUserHelpRequestFile(admin, helpRequestFile.id, { deletedAt: 'true' })

                expect(deletedRequestFile.deletedAt).toBeDefined()
            })

            it('anonymous can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(anonymous, helpRequestFile.id, { deletedAt: 'true' })
                })
            })

            it('support can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestUserHelpRequestFile(support, helpRequestFile.id, { deletedAt: 'true' })
                })
            })

            it('user: can soft delete his help request file', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(employeeUser)
                const [deletedRequestFile] = await updateTestUserHelpRequestFile(employeeUser, helpRequestFile.id, { deletedAt: 'true' })

                expect(deletedRequestFile.deletedAt).toBeDefined()
            })
        })

        describe('Delete', () => {
            it('admin can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await UserHelpRequestFile.delete(admin, helpRequestFile.id)
                })
            })

            it('anonymous can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await UserHelpRequestFile.delete(anonymous, helpRequestFile.id)
                })
            })

            it('support can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await UserHelpRequestFile.delete(support, helpRequestFile.id)
                })
            })

            it('user: can not', async () => {
                const [helpRequestFile] = await createTestUserHelpRequestFile(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await UserHelpRequestFile.delete(employeeUser, helpRequestFile.id)
                })
            })
        })
    })
})
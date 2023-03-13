/**
 * Generated by `createschema organization.OrganizationNewsItem 'title:Text; body:Text; type:Select:common,emergency; receiversCriteria?:Json; meta?:Json;'`
 */
const faker = require('faker')

const {
    makeLoggedInAdminClient,
    makeClient,
    UUID_RE,
    DATETIME_RE,
    expectToThrowGQLError,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const {
    OrganizationNewsItem,
    createTestOrganizationNewsItem,
    updateTestOrganizationNewsItem,
    createTestOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const {
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const {
    makeClientWithResidentAccessAndProperty,
} = require('@condo/domains/property/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')

let adminClient, supportClient, userClient, anonymousClient, sender

describe('OrganizationNewsItem', () => {
    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymousClient = await makeClient()
        sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                // o r g a n i z a t i o n .... ssssooooo looooong :/
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)

                const [obj, attrs] = await createTestOrganizationNewsItem(adminClient, o10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                expect(obj.organization.id).toMatch(o10n.id)
                expect(obj.title).toEqual(attrs.title)
                expect(obj.body).toEqual(attrs.body)
                expect(obj.type).toEqual(attrs.type)
            })

            test('support can', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(supportClient)

                const [obj, attrs] = await createTestOrganizationNewsItem(supportClient, o10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: supportClient.user.id }))
            })

            test('stuff with permission can', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: true })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                const [obj, attrs] = await createTestOrganizationNewsItem(client, o10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('staff without permission can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: false })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOrganizationNewsItem(client, o10n)
                })
            })

            test('resident can\'t', async () => {
                const client = await makeClientWithResidentAccessAndProperty()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOrganizationNewsItem(client, client.organization)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                    await createTestOrganizationNewsItem(anonymousClient, o10n)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const body = faker.lorem.words(10)

                const [obj, attrs] = await updateTestOrganizationNewsItem(adminClient, objCreated.id, { body })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            })

            test('support can', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const body = faker.lorem.words(10)
                const [obj, attrs] = await updateTestOrganizationNewsItem(supportClient, objCreated.id, { body })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: supportClient.user.id }))
            })

            test('stuff with permission can', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: true })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                const body = faker.lorem.words(10)
                const [obj, attrs] = await updateTestOrganizationNewsItem(client, objCreated.id, { body })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.v).toEqual(2)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('staff without permission can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: false })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    const body = faker.lorem.words(10)
                    await updateTestOrganizationNewsItem(client, objCreated.id, { body })
                })
            })

            test('resident can\'t', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const client = await makeClientWithResidentAccessAndProperty()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    const body = faker.lorem.words(10)
                    const [obj, attrs] = await updateTestOrganizationNewsItem(client, objCreated.id, { body })
                })
            })

            test('anonymous can\'t', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestOrganizationNewsItem(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OrganizationNewsItem.delete(adminClient, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OrganizationNewsItem.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OrganizationNewsItem.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [obj, attrs] = await createTestOrganizationNewsItem(adminClient, o10n)

                const objs = await OrganizationNewsItem.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('stuff can', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestOrganizationNewsItem(adminClient, o10n)
                const [roleWithAccess] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: true })
                const [roleWithoutAccess] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNews: false })

                const clientWithAccess = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(adminClient, o10n, clientWithAccess.user, roleWithAccess)

                const clientWithoutAccess = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(adminClient, o10n, clientWithoutAccess.user, roleWithoutAccess)

                const objs = await OrganizationNewsItem.getAll(clientWithAccess, {}, { sortBy: ['updatedAt_DESC'] })
                const objs2 = await OrganizationNewsItem.getAll(clientWithoutAccess, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: objCreated.id,
                })

                expect(objs2).toHaveLength(1)
                expect(objs2[0]).toMatchObject({
                    id: objCreated.id,
                })
            })

            test('anonymous can\'t', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [obj, attrs] = await createTestOrganizationNewsItem(adminClient, o10n)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await OrganizationNewsItem.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })

            test.todo('TODO (DOMA-5526): eligible resident can')
            test.todo('TODO (DOMA-5526): not eligible resident can\'t')
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const [o10n, o10nAttrs] = await createTestOrganization(adminClient)

            await expectToThrowGQLError(
                async () => await createTestOrganizationNewsItem(adminClient, o10n, { dv: 42 }),
                {
                    'code': 'BAD_USER_INPUT',
                    'type': 'DV_VERSION_MISMATCH',
                    'message': 'Wrong value for data version number',
                    'mutation': 'createOrganizationNewsItem',
                    'variable': ['data', 'dv'],
                },
            )
        })
    })
})

/**
 * Generated by `createschema miniapp.B2CAppBuild 'app:Relationship:B2CApp:PROTECT; version:Text'`
 */

const dayjs = require('dayjs')
const path = require('path')
const { makeLoggedInAdminClient, makeClient, UploadingFile, waitFor } = require('@core/keystone/test.utils')
const conf = require('@core/config')

const {
    B2CApp,
    createTestB2CApp,
    updateTestB2CApp,
    createTestB2CAppAccessRight,
    B2CAppBuild,
    createTestB2CAppBuild,
    updateTestB2CAppBuild,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowValidationFailureError,
} = require('@condo/domains/common/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithServiceUser,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')
const {
    NON_ZIP_FILE_ERROR,
    RESTRICT_BUILD_SELECT_ERROR,
} = require('@condo/domains/miniapp/constants')

describe('B2CAppBuild', () => {
    let admin
    let support
    let app
    let permittedUser
    let user
    let anonymous
    let anotherPermittedUser
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        user = await makeClientWithNewRegisteredAndLoggedInUser()

        permittedUser = await makeClientWithServiceUser()
        const [b2cApp] = await createTestB2CApp(admin)
        app = b2cApp
        await createTestB2CAppAccessRight(admin, permittedUser.user, app)

        anotherPermittedUser = await makeClientWithServiceUser()
        const [secondApp] = await createTestB2CApp(admin)
        await createTestB2CAppAccessRight(admin, anotherPermittedUser.user, secondApp)
    })
    describe('CRUD operations', () => {
        describe('Create', () => {
            test('Admin can', async () => {
                const [build] = await createTestB2CAppBuild(admin, app)
                expect(build).toBeDefined()
                expect(build).toHaveProperty(['app', 'id'], app.id)
            })
            test('Support can', async () => {
                const [build] = await createTestB2CAppBuild(support, app)
                expect(build).toBeDefined()
                expect(build).toHaveProperty(['app', 'id'], app.id)
            })
            describe('User', () => {
                describe('Service user with access rights', () => {
                    test('Can for linked B2C app', async () => {
                        const [build] = await createTestB2CAppBuild(permittedUser, app)
                        expect(build).toBeDefined()
                        expect(build).toHaveProperty(['app', 'id'], app.id)
                    })
                    test('Cannot for other B2C Apps', async () => {
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await createTestB2CAppBuild(anotherPermittedUser, app)
                        })
                    })
                })
                test('Cannot otherwise', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestB2CAppBuild(user, app)
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestB2CAppBuild(anonymous, app)
                })
            })
        })
        describe('Update', () => {
            let build
            beforeEach(async () => {
                [build] = await createTestB2CAppBuild(admin, app)
            })
            test('Admin can update and soft-delete', async () => {
                const version = `${build.version}-beta`
                const [updatedBuild] = await updateTestB2CAppBuild(admin, build.id, { version })
                expect(updatedBuild).toHaveProperty('version', version)
                const [deletedBuild] = await updateTestB2CAppBuild(admin, build.id, { deletedAt: dayjs().toISOString() })
                expect(deletedBuild).toHaveProperty('deletedAt')
                expect(deletedBuild.deletedAt).not.toBeNull()
            })
            test('Support can update and soft-delete', async () => {
                const version = `${build.version}-beta`
                const [updatedBuild] = await updateTestB2CAppBuild(support, build.id, { version })
                expect(updatedBuild).toHaveProperty('version', version)
                const [deletedBuild] = await updateTestB2CAppBuild(support, build.id, { deletedAt: dayjs().toISOString() })
                expect(deletedBuild).toHaveProperty('deletedAt')
                expect(deletedBuild.deletedAt).not.toBeNull()
            })
            describe('User', () => {
                describe('User with access right', () => {
                    test('Can update and soft-delete builds for linked B2C app', async () => {
                        const version = `${build.version}-beta`
                        const [updatedBuild] = await updateTestB2CAppBuild(permittedUser, build.id, { version })
                        expect(updatedBuild).toHaveProperty('version', version)
                        const [deletedBuild] = await updateTestB2CAppBuild(permittedUser, build.id, { deletedAt: dayjs().toISOString() })
                        expect(deletedBuild).toHaveProperty('deletedAt')
                        expect(deletedBuild.deletedAt).not.toBeNull()
                    })
                    test('Cannot update anything for other apps', async () => {
                        await expectToThrowAccessDeniedErrorToObj(async () => {
                            await updateTestB2CAppBuild(anotherPermittedUser, build.id, {})
                        })
                    })
                })
                test('Cannot update otherwise', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestB2CAppBuild(user, build.id, {})
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestB2CAppBuild(anonymous, build.id, {})
                })
            })
        })
        describe('Read', () => {
            let build
            beforeAll(async () => {
                [build] = await createTestB2CAppBuild(admin, app)
            })
            test('Admin can', async () => {
                const anotherAdmin = await makeLoggedInAdminClient()
                const builds = await B2CAppBuild.getAll(anotherAdmin, { id: build.id })
                expect(builds).toBeDefined()
                expect(builds).toHaveLength(1)
                expect(builds[0]).toHaveProperty('id', build.id)
            })
            test('Support can', async () => {
                const builds = await B2CAppBuild.getAll(support, { id: build.id })
                expect(builds).toBeDefined()
                expect(builds).toHaveLength(1)
                expect(builds[0]).toHaveProperty('id', build.id)
            })
            describe('User', () => {
                describe('User with access right',  () => {
                    test('To linked B2B app can', async () => {
                        const builds = await B2CAppBuild.getAll(permittedUser, { id: build.id })
                        expect(builds).toBeDefined()
                        expect(builds).toHaveLength(1)
                        expect(builds[0]).toHaveProperty('id', build.id)
                    })
                    test('To other app - cannot', async () => {
                        const builds = await B2CAppBuild.getAll(anotherPermittedUser, { id: build.id })
                        expect(builds).toBeDefined()
                        expect(builds).toHaveLength(0)
                    })
                })
                test('With type RESIDENT - can', async () => {
                    const resident = await makeClientWithResidentUser()
                    const builds = await B2CAppBuild.getAll(resident, { id: build.id })
                    expect(builds).toBeDefined()
                    expect(builds).toHaveLength(1)
                    expect(builds[0]).toHaveProperty('id', build.id)
                })
                test('Cannot otherwise', async () => {
                    const builds = await B2CAppBuild.getAll(user, { id: build.id })
                    expect(builds).toBeDefined()
                    expect(builds).toHaveLength(0)
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await B2CAppBuild.getAll(anonymous, { id: build.id })
                })
            })
        })
        describe('Delete', () => {
            let build
            let resident
            beforeAll(async () => {
                [build] = await createTestB2CAppBuild(admin, app)
                resident = await makeClientWithResidentUser()
            })
            test('Nobody can', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(admin, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(support, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(permittedUser, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(anotherPermittedUser, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(user, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(resident, build.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2CAppBuild.delete(anonymous, build.id)
                })
            })
        })
    })
    describe('Validations', () => {
        test('Cannot accept non-zip archive file', async () => {
            await expectToThrowValidationFailureError(async () => {
                await createTestB2CAppBuild(admin, app, {
                    data: new UploadingFile(path.resolve(conf.PROJECT_ROOT, 'apps/condo/domains/common/test-assets/dino.png')),
                })
            }, NON_ZIP_FILE_ERROR)
        })
        test('Service account cannot create build linked to non-permitted app or change link to another app', async () => {
            const [secondApp] = await createTestB2CApp(admin)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestB2CAppBuild(permittedUser, secondApp)
            })
        })
        test('Current build of linked app must set to null on build\'s soft-delete',  async () => {
            const [secondApp] = await createTestB2CApp(admin)
            const [build] = await createTestB2CAppBuild(admin, secondApp)
            await updateTestB2CApp(admin, secondApp.id, {
                currentBuild: { connect: { id: build.id } },
            })
            await updateTestB2CAppBuild(admin, build.id, {
                deletedAt: dayjs().toISOString(),
            })
            await waitFor(async () => {
                const [updatedApp] = await B2CApp.getAll(admin, {
                    id: secondApp.id,
                })
                expect(updatedApp).toBeDefined()
                expect(updatedApp).toHaveProperty('currentBuild', null)
            })
        })
        test('Current build cannot cannot be chosen from other apps', async () => {
            const [build] = await createTestB2CAppBuild(admin, app)
            await expectToThrowValidationFailureError(async () => {
                await createTestB2CApp(admin, {
                    currentBuild: { connect: { id: build.id } },
                })
            }, RESTRICT_BUILD_SELECT_ERROR)
            const [secondApp] = await createTestB2CApp(admin)
            await expectToThrowValidationFailureError(async () => {
                await updateTestB2CApp(admin, secondApp.id, {
                    currentBuild: { connect: { id: build.id } },
                })
            }, RESTRICT_BUILD_SELECT_ERROR)
        })
    })
})

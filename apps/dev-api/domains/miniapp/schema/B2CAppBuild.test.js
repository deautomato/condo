/**
 * Generated by `createschema miniapp.B2CAppBuild 'app:Relationship:B2CApp:CASCADE;'`
 */

const path = require('path')

const dayjs = require('dayjs')

const conf = require('@open-condo/config')
const { makeClient, UploadingFile } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowGQLError,
    expectToThrowUniqueConstraintViolationError,
} = require('@open-condo/keystone/test.utils')

const { INVALID_MIMETYPE } = require('@dev-api/domains/common/constants/errors')
const { B2C_APP_BUILD_UNIQUE_VERSION_CONSTRAINT } = require('@dev-api/domains/miniapp/constants/constraints')
const { INVALID_BUILD_VERSION } = require('@dev-api/domains/miniapp/constants/errors')
const {
    B2CAppBuild,
    createTestB2CAppBuild,
    updateTestB2CAppBuild,
    createTestB2CApp,
    generateBuildVersion,
} = require('@dev-api/domains/miniapp/utils/testSchema')
const { makeLoggedInAdminClient, makeLoggedInSupportClient, makeRegisteredAndLoggedInUser } = require('@dev-api/domains/user/utils/testSchema')

const NON_ZIP_ASSET_PATH = path.resolve(conf.PROJECT_ROOT, 'apps/dev-api/domains/miniapp/utils/testSchema/assets/build.rar')

describe('B2CAppBuild', () => {
    let admin
    let support
    let user
    let anotherUser
    let anonymous
    let app
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeLoggedInSupportClient()
        user = await makeRegisteredAndLoggedInUser()
        anotherUser = await makeRegisteredAndLoggedInUser()
        anonymous = await makeClient();
        [app] = await createTestB2CApp(user)
    })
    describe('CRUD', () => {
        describe('Create', () => {
            test('Admin can', async () => {
                const [build] = await createTestB2CAppBuild(admin, app)
                expect(build).toHaveProperty('id')
            })
            test('Support can', async () => {
                const [build] = await createTestB2CAppBuild(support, app)
                expect(build).toHaveProperty('id')
            })
            describe('User', () => {
                test('App creator can', async () => {
                    const [build] = await createTestB2CAppBuild(user, app)
                    expect(build).toHaveProperty('id')
                })
                test('Others cannot', async () => {
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestB2CAppBuild(anotherUser, app)
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestB2CAppBuild(anonymous, app)
                })
            })
        })
        describe('Update/Soft-delete', () => {
            let build
            beforeEach(async () => {
                [build] = await createTestB2CAppBuild(user, app)
            })
            test('Admin can', async () => {
                const [updated] = await updateTestB2CAppBuild(admin, build.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(updated).toHaveProperty('deletedAt')
                expect(updated.deletedAt).not.toBeNull()
            })
            test('Support can', async () => {
                const [updated] = await updateTestB2CAppBuild(support, build.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(updated).toHaveProperty('deletedAt')
                expect(updated.deletedAt).not.toBeNull()
            })
            test('Any user cannot', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2CAppBuild(user, build.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2CAppBuild(anotherUser, build.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestB2CAppBuild(anonymous, build.id, {
                        deletedAt: dayjs().toISOString(),
                    })
                })
            })
        })
        describe('Read', () => {
            let build
            beforeAll(async () => {
                [build] = await createTestB2CAppBuild(user, app)
            })
            test('Admin can', async () => {
                const readBuild = await B2CAppBuild.getOne(admin, { id: build.id })
                expect(readBuild).toHaveProperty('id')
            })
            test('Support can', async () => {
                const readBuild = await B2CAppBuild.getOne(support, { id: build.id })
                expect(readBuild).toHaveProperty('id')
            })
            describe('User', () => {
                test('App creator can', async () => {
                    const readBuild = await B2CAppBuild.getOne(user, { id: build.id })
                    expect(readBuild).toHaveProperty('id')
                })
                test('Others cannot', async () => {
                    const readBuild = await B2CAppBuild.getOne(anotherUser, { id: build.id })
                    expect(readBuild).not.toBeDefined()
                })
            })
            test('Anonymous cannot', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await B2CAppBuild.getOne(anonymous, { id: build.id })
                })
            })
        })
        test('Hard delete is prohibited', async () => {
            const [build] = await createTestB2CAppBuild(user, app)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await B2CAppBuild.delete(admin, build.id)
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await B2CAppBuild.delete(support, build.id)
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await B2CAppBuild.delete(user, build.id)
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await B2CAppBuild.delete(anotherUser, build.id)
            })
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await B2CAppBuild.delete(anonymous, build.id)
            })
        })
    })
    describe('Validations', () => {
        describe('version', () => {
            describe('Must have semver format', () => {
                const invalidCases = ['1', '2.3', 'my cool version', 'lollipop']
                test.each(invalidCases)('%p', async (version) => {
                    await expectToThrowGQLError(async () => {
                        await createTestB2CAppBuild(user, app, {
                            version,
                        })
                    }, {
                        code: 'BAD_USER_INPUT',
                        type: INVALID_BUILD_VERSION,
                    })
                })
            })
        })
        describe('data', () => {
            test('Must be a zip-archive', async () => {
                await expectToThrowGQLError(async () => {
                    await createTestB2CAppBuild(user, app, {
                        data: new UploadingFile(NON_ZIP_ASSET_PATH),
                    })
                }, {
                    code: 'BAD_USER_INPUT',
                    type: INVALID_MIMETYPE,
                })
            })
        })
    })
    describe('Constraints', () => {
        test('Cannot create another build with already existing version', async () => {
            const version = generateBuildVersion()
            const [build] = await createTestB2CAppBuild(support, app, { version })
            expect(build).toHaveProperty('version', version)

            await expectToThrowUniqueConstraintViolationError(async () => {
                await createTestB2CAppBuild(support, app, { version })
            }, B2C_APP_BUILD_UNIQUE_VERSION_CONSTRAINT)

            const [anotherApp] = await createTestB2CApp(anotherUser)
            const [anotherBuild] = await createTestB2CAppBuild(anotherUser, anotherApp, { version })
            expect(anotherBuild).toHaveProperty('version', version)
        })
    })
})
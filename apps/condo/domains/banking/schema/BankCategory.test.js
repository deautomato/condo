/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 */

const { makeLoggedInAdminClient, makeClient, expectToThrowGQLError, expectValuesOfCommonFields } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { BankCategory, createTestBankCategory, updateTestBankCategory } = require('@condo/domains/banking/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')


let admin
let user
let anonymous

describe('BankCategory', () => {
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        user = await makeClientWithNewRegisteredAndLoggedInUser()
        anonymous = await makeClient()
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [obj, attrs] = await createTestBankCategory(admin)

                expectValuesOfCommonFields(obj, attrs, admin)
                expect(obj.name).toMatch(attrs.name)
            })

            test('user can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankCategory(user)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankCategory(anonymous)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                const [obj, attrs] = await updateTestBankCategory(admin, objCreated.id)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankCategory(user, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankCategory(anonymous, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestBankCategory(admin)
                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankCategory.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [obj] = await createTestBankCategory(admin)
                const objs = await BankCategory.getAll(admin, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        name: obj.name,
                    }),
                ]))
            })

            test('user can', async () => {
                const [obj] = await createTestBankCategory(admin)
                const objs = await BankCategory.getAll(user, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    name: obj.name,
                })
            })

            test('anonymous can\'t', async () => {
                await createTestBankCategory(admin)
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankCategory.getAll(anonymous, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            await expectToThrowGQLError(async () => {
                await createTestBankCategory(admin, {
                    dv: 2,
                })
            }, {
                'code': 'BAD_USER_INPUT',
                'type': 'DV_VERSION_MISMATCH',
                'message': 'Wrong value for data version number',
                'mutation': 'createBankCategory',
                'messageForUser': '',
                'variable': ['data', 'dv'],
            })
        })
    })
})

/**
 * Generated by `createschema banking.BankTransaction 'account:Relationship:BankAccount:CASCADE; contractorAccount:Relationship:BankContractorAccount:CASCADE; costItem?:Relationship:BankCostItem:SET_NULL; organization:Relationship:Organization:CASCADE; number:Text; date:CalendarDay; amount:Decimal; purpose:Text; dateWithdrawed:CalendarDay; dateReceived:CalendarDay; meta:Json; importId:Text; importRemoteSystem:Text;'`
 */

const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')
const { pick } = require('lodash')

const {
    makeClient,
    makeLoggedInAdminClient,
    expectToThrowValidationFailureError,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowUniqueConstraintViolationError,
    expectValuesOfCommonFields,
} = require('@open-condo/keystone/test.utils')


const {
    BankTransaction,
    BankIntegration,
    createTestBankAccount,
    createTestBankContractorAccount,
    createTestBankTransaction,
    updateTestBankTransaction,
    createTestBankIntegrationAccountContext,
} = require('@condo/domains/banking/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee, createTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')

const { BANK_INTEGRATION_IDS } = require('../constants')
const { createTestBankCategory, createTestBankCostItem, createTestBankIntegrationOrganizationContext, createTestBankIntegrationAccessRight } = require('../utils/testSchema')

let admin
let support
let serviceClient
let anonymous
let bankIntegration
let SBBOLBankIntegration

describe('BankTransaction', () => {
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        bankIntegration = await BankIntegration.getOne(admin, { id: BANK_INTEGRATION_IDS['1CClientBankExchange'] })
        SBBOLBankIntegration = await BankIntegration.getOne(admin, { id: BANK_INTEGRATION_IDS.SBBOL })
        serviceClient = await makeClientWithServiceUser()
        await createTestBankIntegrationAccessRight(admin, SBBOLBankIntegration, serviceClient.user)
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(support, organization)
                const [obj, attrs] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                expectValuesOfCommonFields(obj, attrs, admin)
                expect(obj.number).toEqual(attrs.number)
                expect(obj.date).toEqual(attrs.date)
                expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
                expect(obj.currencyCode).toEqual(attrs.currencyCode)
                expect(obj.purpose).toEqual(attrs.purpose)
                expect(obj.importId).toEqual(attrs.importId)
                expect(obj.importRemoteSystem).toEqual(attrs.importRemoteSystem)
                expect(obj.meta).toEqual(attrs.meta)
                expect(obj.integrationContext).toMatchObject(pick(integrationContext, ['id', 'enabled']))
                expect(obj.isOutcome).toEqual(attrs.isOutcome)
            })

            test('service can', async () => {
                const [organization] = await createTestOrganization(admin)
                await createTestBankIntegrationOrganizationContext(admin, SBBOLBankIntegration, organization)
                const [accountContext] = await createTestBankIntegrationAccountContext(serviceClient, SBBOLBankIntegration, organization)
                const [contractorAccount] = await createTestBankContractorAccount(serviceClient, organization)
                const [account] = await createTestBankAccount(serviceClient, organization, { integrationContext: { connect: { id: accountContext.id } } })

                const [obj, attrs] = await createTestBankTransaction(serviceClient, account, contractorAccount, accountContext, organization)

                expectValuesOfCommonFields(obj, attrs, serviceClient)
                expect(obj.number).toEqual(attrs.number)
                expect(obj.date).toEqual(attrs.date)
                expect(parseFloat(obj.amount)).toBeCloseTo(parseFloat(attrs.amount), 2)
                expect(obj.currencyCode).toEqual(attrs.currencyCode)
                expect(obj.purpose).toEqual(attrs.purpose)
                expect(obj.importId).toEqual(attrs.importId)
                expect(obj.importRemoteSystem).toEqual(attrs.importRemoteSystem)
                expect(obj.meta).toEqual(attrs.meta)
                expect(obj.integrationContext).toMatchObject(pick(accountContext, ['id', 'enabled']))
                expect(obj.isOutcome).toEqual(attrs.isOutcome)
            })

            test('support can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(support, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(support, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user can if it is an employee of organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                const [obj, attrs] = await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)

                expectValuesOfCommonFields(obj, attrs, userClient)
            })

            test('user cannot if it is an employee of organization without "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user cannot if it is an employee of another organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, organization)
                })
            })

            test('user can if it is an employee of linked organization with "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)

                const [obj, attrs] = await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, childOrganization)

                expectValuesOfCommonFields(obj, attrs, userClient)
            })

            test('user cannot if it is an employee of linked organization without "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})

                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankTransaction(userClient, account, contractorAccount, integrationContext, childOrganization)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankTransaction(anonymous, account, contractorAccount, integrationContext, organization)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const [obj, attrs] = await updateTestBankTransaction(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('support can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(support, objCreated.id)
                })
            })

            test('user can if it is an employee of organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const [obj, attrs] = await updateTestBankTransaction(userClient, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user cannot if it is an employee of organization without "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('user cannot if it is an employee of another organization with "canManageBankTransactions" permission', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('user can if it is an employee of linked organization with "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                const [obj, attrs] = await updateTestBankTransaction(userClient, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('user cannot if it is an employee of linked organization without "canManageBankTransactions" permission', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: false,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankTransaction(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankTransaction(anonymous, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(userClient, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankTransaction.delete(anonymous, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)
                const objs = await BankTransaction.getAll(admin, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('service can', async () => {
                const [organization] = await createTestOrganization(admin)
                await createTestBankIntegrationOrganizationContext(admin, SBBOLBankIntegration, organization)
                const [integrationContext] = await createTestBankIntegrationAccountContext(serviceClient, SBBOLBankIntegration, organization)
                const [account] = await createTestBankAccount(serviceClient, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(serviceClient, organization)
                const [objCreated] = await createTestBankTransaction(serviceClient, account, contractorAccount, integrationContext, organization)
                const objs = await BankTransaction.getAll(serviceClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('user can if it is an employee of organization', async () => {
                const [organization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('user cannot if it is an employee of another organization', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(0)
            })

            test('user can if it is an employee of linked organization', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization, {
                    canManageBankTransactions: true,
                })
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, childOrganization)
                const [account] = await createTestBankAccount(admin, childOrganization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, childOrganization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, childOrganization)

                const objs = await BankTransaction.getAll(userClient, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject(objCreated)
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
                const [account] = await createTestBankAccount(admin, organization, {
                    integrationContext: { connect: { id: integrationContext.id } },
                })
                const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
                const [objCreated] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankTransaction.getAll(anonymous, { id: objCreated.id }, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(support, organization)
            const [obj] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization)

            expect(obj.dv).toEqual(1)
        })

        it('cannot be connected to BankCostItem with different values of "isOutcome" field', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(admin, organization)
            const [category] = await createTestBankCategory(admin)
            const [costItem1] = await createTestBankCostItem(admin, category, {
                isOutcome: false,
            })

            // Connect to cost item with different `isOutcome`
            await expectToThrowValidationFailureError(async () => {
                await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                    costItem: { connect: { id: costItem1.id } },
                    isOutcome: true,
                })
            }, `Mismatched value of "isOutcome" field of BankTransaction with BankCostItem(id="${costItem1.id}") during create operation`)

            const [transaction] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                costItem: { connect: { id: costItem1.id } },
                isOutcome: false,
            })

            // Update `isOutcome` having existing connection
            await expectToThrowValidationFailureError(async () => {
                await updateTestBankTransaction(admin, transaction.id, {
                    isOutcome: true,
                })
            }, `Mismatched value of "isOutcome" field of BankTransaction(id="${transaction.id}") with BankCostItem(id="${costItem1.id}") during update operation`)

            const [costItem2] = await createTestBankCostItem(admin, category, {
                isOutcome: true,
            })

            // Reconnect to cost item with different `isOutcome`
            await expectToThrowValidationFailureError(async () => {
                await updateTestBankTransaction(admin, transaction.id, {
                    costItem: { disconnect: { id: costItem1.id }, connect: { id: costItem2.id } },
                })
            }, `Mismatched value of "isOutcome" field of BankTransaction(id="${transaction.id}") with BankCostItem(id="${costItem2.id}") during update operation`)
        })
    })
    
    describe('Unique constraints', () => {
        it('cannot be created with same date, number, organization', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

            const date = dayjs(faker.date.recent()).format('YYYY-MM-DD')
            const number = faker.datatype.number().toString()

            const [obj1] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                date,
                number,
            })
            
            expect(obj1).toBeDefined()

            await expectToThrowUniqueConstraintViolationError(async () => {
                await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                    date,
                    number,
                })
            }, 'Bank_transaction_unique_number_date_organization')
        })

        it('cannot be created with same importId, importRemoteSystem, organization', async () => {
            const [organization] = await createTestOrganization(admin)
            const [integrationContext] = await createTestBankIntegrationAccountContext(admin, bankIntegration, organization)
            const [account] = await createTestBankAccount(admin, organization, {
                integrationContext: { connect: { id: integrationContext.id } },
            })
            const [contractorAccount] = await createTestBankContractorAccount(admin, organization)

            const importId = faker.datatype.uuid()
            const importRemoteSystem = faker.lorem.word()

            const [obj1] = await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                importId,
                importRemoteSystem,
            })

            expect(obj1).toBeDefined()

            await expectToThrowUniqueConstraintViolationError(async () => {
                await createTestBankTransaction(admin, account, contractorAccount, integrationContext, organization, {
                    importId,
                    importRemoteSystem,
                })
            }, 'Bank_transaction_unique_importId_importRemoteSystem_organization')
        })
    })
})

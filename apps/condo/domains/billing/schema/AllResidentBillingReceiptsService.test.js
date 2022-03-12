/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const faker = require('faker')

const {
    completeTestPayment,
    createTestAcquiringIntegrationContext,
    createTestAcquiringIntegration,
} = require('@condo/domains/acquiring/utils/testSchema')


const { makeClientWithPropertyAndBilling } = require('@condo/domains/billing/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { addResidentAccess, makeClientWithResidentUser, makeClientWithSupportUser, makeLoggedInClient } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingIntegration, createTestBillingReceipt, updateTestBillingReceipt, ResidentBillingReceipt } = require('../utils/testSchema')
const { registerServiceConsumerByTestClient, updateTestServiceConsumer, registerResidentByTestClient, createTestResident, ServiceConsumer } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithProperty, createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestBillingAccount, createTestBillingProperty, createTestBillingIntegrationOrganizationContext, createTestBillingIntegrationAccessRight } = require('@condo/domains/billing/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')

describe('AllResidentBillingReceipts', () => {

    describe('resident should be able to get all needed fields', () => {
        let mutationResult
        beforeAll(async () => {
            const userClient = await makeClientWithProperty()
            const support = await makeClientWithSupportUser()

            const [integration] = await createTestBillingIntegration(support)
            const [billingContext] = await createTestBillingIntegrationOrganizationContext(userClient, userClient.organization, integration)

            const integrationClient = await makeLoggedInClient()
            await createTestBillingIntegrationAccessRight(support, integration, integrationClient.user)
            const [billingProperty] = await createTestBillingProperty(integrationClient, billingContext, {
                address: userClient.property.address,
            })
            const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(integrationClient, billingContext, billingProperty)

            const residentUser = await makeClientWithResidentUser()
            const [resident] = await registerResidentByTestClient(residentUser, {
                address: userClient.property.address,
                addressMeta: userClient.property.addressMeta,
                unitName: billingAccountAttrs.unitName,
            })
            await registerServiceConsumerByTestClient(residentUser, {
                residentId: resident.id,
                accountNumber: billingAccountAttrs.number,
                organizationId: userClient.organization.id,
            })
            await createTestBillingReceipt(integrationClient, billingContext, billingProperty, billingAccount)
            mutationResult = await ResidentBillingReceipt.getAll(residentUser)
        })

        // TODO(DOMA-1768): add more tests
        test('has all required fields', async () => {
            expect(mutationResult).toBeDefined()
            expect(mutationResult).not.toHaveLength(0)
            mutationResult.forEach(receipt => {
                expect(receipt).toHaveProperty('id')
                expect(receipt.id).not.toBeNull()

                expect(receipt).toHaveProperty('toPay')
                expect(receipt.toPay).not.toBeNull()

                expect(receipt).toHaveProperty('paid')
                expect(receipt.paid).not.toBeNull()

                expect(receipt).toHaveProperty('period')
                expect(receipt.period).not.toBeNull()

                expect(receipt).toHaveProperty('recipient')
                expect(receipt.recipient).not.toBeNull()

                expect(receipt).toHaveProperty('serviceConsumer')
                expect(receipt.serviceConsumer).not.toBeNull()

                expect(receipt).toHaveProperty('serviceConsumer.id')
                expect(receipt.serviceConsumer.id).not.toBeNull()

                expect(receipt).toHaveProperty('currencyCode')
                expect(receipt.currencyCode).not.toBeNull()
            })
        })
    })

    test('user with valid serviceAccount can read BillingReceipt without raw data', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [billingAccount2] = await createTestBillingAccount(adminClient, context, billingProperty)

        await addResidentAccess(userClient.user)

        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, { unitName: billingAccountAttrs.unitName })
        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: userClient.organization.id,
        }

        await registerServiceConsumerByTestClient(userClient, payload)
        const [receipt] = await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount2)

        const objs = await ResidentBillingReceipt.getAll(userClient)
        expect(objs).toHaveLength(1)
        expect(objs[0].raw).toEqual(undefined)
        expect(objs[0].id).toEqual(receipt.id)
    })

    test('user with valid serviceAccount can read BillingReceipt without raw data even if there are other Resident with this service consumer', async () => {
        /**
         * Story: Husband and Wife live in the same flat,
         *        They have the same accountNumber and unitName, but different Residents and serviceConsumers
         *        Both Wife and Husband should be able to read BillingReceipts
         */

        const adminClient = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization)

        const husbandClient = await makeClientWithResidentUser()
        const wifeClient = await makeClientWithResidentUser()

        // Create billing integration and billing entities
        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [billingAccount2] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [receipt] = await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount2)

        const [residentHusband] = await registerResidentByTestClient(husbandClient, {
            address: property.address,
            addressMeta: property.addressMeta,
            unitName: billingAccountAttrs.unitName,
        })
        const [serviceConsumerHusband] = await registerServiceConsumerByTestClient(husbandClient, {
            residentId: residentHusband.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: organization.id,
        })
        // you can't read billingAccount field as resident, so we should get true serviceConsumer here to further check
        const [serviceConsumerHusbandWithAccount] = await ServiceConsumer.getAll(adminClient, { id: serviceConsumerHusband.id })

        const [residentWife] = await registerResidentByTestClient(wifeClient, {
            address: property.address,
            addressMeta: property.addressMeta,
            unitName: billingAccountAttrs.unitName,
        })
        const [serviceConsumerWife] = await registerServiceConsumerByTestClient(wifeClient, {
            residentId: residentWife.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: organization.id,
        })
        // you can't read billingAccount field as resident, so we should get true serviceConsumer here to further check
        const [serviceConsumerWifeWithAccount] = await ServiceConsumer.getAll(adminClient, { id: serviceConsumerWife.id })

        expect(serviceConsumerHusbandWithAccount.billingAccount.id).toEqual(serviceConsumerWifeWithAccount.billingAccount.id)
        expect(serviceConsumerHusbandWithAccount.billingAccount.id).toEqual(billingAccount.id)

        const objsHusband = await ResidentBillingReceipt.getAll(husbandClient, { serviceConsumer: { resident: { id: residentHusband.id } } })
        expect(objsHusband).toHaveLength(1)
        expect(objsHusband[0].raw).toEqual(undefined)
        expect(objsHusband[0].id).toEqual(receipt.id)

        const objsWife = await ResidentBillingReceipt.getAll(wifeClient, { serviceConsumer: { resident: { id: residentWife.id } } })
        expect(objsWife).toHaveLength(1)
        expect(objsWife[0].raw).toEqual(undefined)
        expect(objsWife[0].id).toEqual(receipt.id)
    })

    test('user with valid serviceAccount and with deleted service account can read BillingReceipt without raw data', async () => {
        /**
         * Story: Nikolay deleted the service consumer by accident and registered new
         *        Nikolay should be able to get all receipts!
         */

        const adminClient = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization)

        const client = await makeClientWithResidentUser()

        // Create billing integration and billing entities
        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [billingAccount2] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [receipt] = await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount2)

        const [resident] = await createTestResident(adminClient, client.user, organization, property, {
            unitName: billingAccountAttrs.unitName,
        })
        const [firstServiceConsumer] = await registerServiceConsumerByTestClient(client, {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: organization.id,
        })
        const [updatedServiceConsumer] = await updateTestServiceConsumer(client, firstServiceConsumer.id, { deletedAt: 'true' })
        expect(updatedServiceConsumer.deletedAt).not.toBeNull()

        const objsFirst = await ResidentBillingReceipt.getAll(client, { serviceConsumer: { resident: { id: resident.id } } })
        expect(objsFirst).toHaveLength(0)

        await registerServiceConsumerByTestClient(client, {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: organization.id,
        })

        const objsSecond = await ResidentBillingReceipt.getAll(client, { serviceConsumer: { resident: { id: resident.id } } })
        expect(objsSecond).toHaveLength(1)
        expect(objsSecond[0].raw).toEqual(undefined)
        expect(objsSecond[0].id).toEqual(receipt.id)
    })

    test('user with valid serviceAccount can filter residentBillingReceipts by serviceConsumer', async () => {
        // User has flats in building A and building B
        // Each building has own BillingOrganizationIntegrationContext
        // User is able to get receipts for both of his buildings

        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        // User has two flats in building A:
        const [integrationA] = await createTestBillingIntegration(adminClient)
        const [contextA] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integrationA)
        const [billingPropertyA] = await createTestBillingProperty(adminClient, contextA)
        const [billingAccountA, billingAccountAttrsA] = await createTestBillingAccount(adminClient, contextA, billingPropertyA)
        const [billingAccountA2, billingAccountAttrsA2] = await createTestBillingAccount(adminClient, contextA, billingPropertyA)

        await addResidentAccess(userClient.user)
        const [residentA] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrsA.unitName,
        })

        const serviceConsumerPayloadA = {
            residentId: residentA.id,
            accountNumber: billingAccountAttrsA.number,
            organizationId: userClient.organization.id,
        }
        await registerServiceConsumerByTestClient(userClient, serviceConsumerPayloadA)

        const [residentA2] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrsA2.unitName,
        })

        const serviceConsumerPayloadA2 = {
            residentId: residentA2.id,
            accountNumber: billingAccountAttrsA2.number,
            organizationId: userClient.organization.id,
        }
        await registerServiceConsumerByTestClient(userClient, serviceConsumerPayloadA2)

        await createTestBillingReceipt(adminClient, contextA, billingPropertyA, billingAccountA)
        await createTestBillingReceipt(adminClient, contextA, billingPropertyA, billingAccountA2)

        // User has one flat in building B:
        const [organizationB] = await createTestOrganization(adminClient)
        const [propertyB] = await createTestProperty(adminClient, organizationB)
        const [integrationB] = await createTestBillingIntegration(adminClient)
        const [contextB] = await createTestBillingIntegrationOrganizationContext(adminClient, organizationB, integrationB)
        const [billingPropertyB] = await createTestBillingProperty(adminClient, contextB)
        const [billingAccountB, billingAccountAttrsB] = await createTestBillingAccount(adminClient, contextB, billingPropertyB)

        const [residentB] = await createTestResident(adminClient, userClient.user, organizationB, propertyB, {
            unitName: billingAccountAttrsB.unitName,
        })

        const payloadForServiceConsumerB = {
            residentId: residentB.id,
            accountNumber: billingAccountAttrsB.number,
            organizationId: organizationB.id,
        }
        await registerServiceConsumerByTestClient(userClient, payloadForServiceConsumerB)

        await createTestBillingReceipt(adminClient, contextB, billingPropertyB, billingAccountB)

        // User get two receipts for his building A
        const objsA = await ResidentBillingReceipt.getAll(userClient, { serviceConsumer: { resident: { id: residentA.id } } })
        expect(objsA).toHaveLength(1)

        const objsA2 = await ResidentBillingReceipt.getAll(userClient, { serviceConsumer: { resident: { id: residentA2.id } } })
        expect(objsA2).toHaveLength(1)

        // User get one receipt for his building B
        const objsForResident2 = await ResidentBillingReceipt.getAll(userClient, { serviceConsumer: { resident: { id: residentB.id } } })
        expect(objsForResident2).toHaveLength(1)
    })

    test('user with valid multiple serviceAccounts can read all his BillingReceipts without raw data', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        const [billingAccount2, billingAccountAttrs2] = await createTestBillingAccount(adminClient, context, billingProperty)

        await addResidentAccess(userClient.user)

        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })

        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: userClient.organization.id,
        }
        await registerServiceConsumerByTestClient(userClient, payload)

        const [resident2] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs2.unitName,
        })

        const payload2 = {
            residentId: resident2.id,
            accountNumber: billingAccountAttrs2.number,
            organizationId: userClient.organization.id,
        }
        await registerServiceConsumerByTestClient(userClient, payload2)

        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount2)

        const objs = await ResidentBillingReceipt.getAll(userClient)
        expect(objs).toHaveLength(2)
    })

    test('user with valid serviceAccount can read BillingReceipt without raw data with where query', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)

        await addResidentAccess(userClient.user)

        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })
        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: userClient.organization.id,
        }

        await registerServiceConsumerByTestClient(userClient, payload)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        const [receipt] = await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)

        await updateTestBillingReceipt(adminClient, receipt.id, { toPay: '100.50' })

        const objs = await ResidentBillingReceipt.getAll(userClient, { toPay: '100.50' })
        expect(objs).toHaveLength(1)
        expect(objs[0].raw).toEqual(undefined)
        expect(objs[0].id).toEqual(receipt.id)
    })

    test('user with stolen billing account id and hacky intentions cant read BillingReceipt', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)

        await addResidentAccess(userClient.user)
        const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })
        const payload = {
            residentId: resident.id,
            accountNumber: billingAccountAttrs.number,
            organizationId: userClient.organization.id,
        }
        await registerServiceConsumerByTestClient(userClient, payload)

        const hackerClient = await makeClientWithProperty()
        const [context2] = await createTestBillingIntegrationOrganizationContext(adminClient, hackerClient.organization, integration)
        const [billingProperty2] = await createTestBillingProperty(adminClient, context2)
        const [billingAccount2] = await createTestBillingAccount(adminClient, context2, billingProperty2)

        await addResidentAccess(hackerClient.user)
        const [hackerResident] = await createTestResident(adminClient, hackerClient.user, hackerClient.organization, hackerClient.property, {
            unitName: billingAccount2.unitName,
        })
        const hackerPayload = {
            residentId: hackerResident.id,
            accountNumber: billingAccount2.number,
            organizationId: userClient.organization.id,
        }
        // Hacker is connected to billingAccount2 and tries to get receipts for billingAccount
        await catchErrorFrom(async () => {
            await registerServiceConsumerByTestClient(hackerClient, hackerPayload)
            await ResidentBillingReceipt.getAll(hackerClient, { account: { id: billingAccountAttrs.id } })
        }, (err) => {
            expect(err).toBeDefined()
        })
    })

    test('user without valid serviceAccount cant read BillingReceipt', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount, billingAccountAttrs] = await createTestBillingAccount(adminClient, context, billingProperty)
        await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, {
            unitName: billingAccountAttrs.unitName,
        })
        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await addResidentAccess(userClient.user)

        const objs = await ResidentBillingReceipt.getAll(userClient)
        expect(objs).toHaveLength(0)
    })

    test('user without valid resident cant read BillingReceipt', async () => {
        const userClient = await makeClientWithProperty()
        const adminClient = await makeLoggedInAdminClient()

        const [integration] = await createTestBillingIntegration(adminClient)
        const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, userClient.organization, integration)
        const [billingProperty] = await createTestBillingProperty(adminClient, context)
        const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

        await createTestBillingReceipt(adminClient, context, billingProperty, billingAccount)
        await addResidentAccess(userClient.user)

        const objs = await ResidentBillingReceipt.getAll(userClient)
        expect(objs).toHaveLength(0)
    })

    describe('paid field', () => {
        /**
         * Checks:
         * Simple cases:
         * 1. Case when you have single receipt and single payment
         * 2. Case when you have single receipt and no payments
         *
         * Complex cases:
         * 1. Receipt is paid, then recreated.
         * 2. Receipt is duplicated in single period
         */

        test('Test simple cases', async () => {

            const UNIT_NAME = faker.random.alphaNumeric(8)

            const admin = await makeLoggedInAdminClient()
            const sortReceiptsByToPay = (a, b) => Number(a.toPay) - Number(b.toPay)

            // Prepare billing integration and receipts
            const { organizationClient, integrationClient } = await makeClientWithPropertyAndBilling({ billingAccountAttrs: { unitName: UNIT_NAME } })
            const [ receiptWithSinglePayment ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                organizationClient.billingAccount,
                { toPay: '2000.00' }
            )

            // We create a new billing account since there are currently only one billing receipt is possible for period
            const [ billingAccount2 ] = await createTestBillingAccount(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                {
                    unitName: UNIT_NAME,
                }
            )
            const [ receiptWithNoPayments ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                billingAccount2,
                { toPay: '25000.00' }
            )

            // Prepare acquiring integration
            const [acquiringIntegration] = await createTestAcquiringIntegration(admin, [organizationClient.billingIntegration], {
                canGroupReceipts: true,
            })
            await createTestAcquiringIntegrationContext(organizationClient, organizationClient.organization, acquiringIntegration)

            // Prepare resident entities
            const residentClient = await makeClientWithResidentUser()
            const [ resident ] = await registerResidentByTestClient(residentClient, {
                address: organizationClient.property.address,
                addressMeta: organizationClient.property.addressMeta,
                unitName: UNIT_NAME,
            })

            const [serviceConsumer] = await registerServiceConsumerByTestClient(residentClient, {
                residentId: resident.id,
                accountNumber: organizationClient.billingAccount.number,
                organizationId: organizationClient.organization.id,
            })
            await registerServiceConsumerByTestClient(residentClient, {
                residentId: resident.id,
                accountNumber: billingAccount2.number,
                organizationId: organizationClient.organization.id,
            })

            // Mobile app gets the list of all resident receipts
            const beforePaymentResult = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } },
                {
                    sortBy: ['toPay_ASC'],
                },
            )
            beforePaymentResult.sort(sortReceiptsByToPay)
            // TODO(zuch): DOMA-2004 = Find out why graphql sorting by custom decimal type gives unpredictable results
            expect(beforePaymentResult).toHaveLength(2)
            expect(Number(beforePaymentResult[0].toPay)).toEqual(2000)
            expect(Number(beforePaymentResult[1].toPay)).toEqual(25000)
            const [
                singlePaymentReceiptBeforePayment,
                noPaymentReceiptBeforePayment,
            ] = beforePaymentResult

            // Mobile app tries to pay for the first receipt in one payment
            await completeTestPayment(residentClient, admin, serviceConsumer.id, singlePaymentReceiptBeforePayment.id )

            // Resident gets own receipts and sees that first one is fully paid!
            const afterPaymentResult = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } },
                {
                    sortBy: ['toPay_ASC'],
                },
            )
            afterPaymentResult.sort(sortReceiptsByToPay)
            expect(afterPaymentResult).toHaveLength(2)
            expect(Number(afterPaymentResult[0].toPay)).toEqual(2000)
            expect(Number(afterPaymentResult[1].toPay)).toEqual(25000)
            const [
                singlePaymentReceiptAfterPayment,
                noPaymentReceiptAfterPayments,
            ] = afterPaymentResult

            // Assert with one payment for one receipt
            expect(singlePaymentReceiptAfterPayment.id).toEqual(receiptWithSinglePayment.id)
            expect(singlePaymentReceiptBeforePayment.id).toEqual(receiptWithSinglePayment.id)
            expect(singlePaymentReceiptBeforePayment.paid).toEqual('0.00000000')
            expect(singlePaymentReceiptAfterPayment.paid).toEqual('2000.00000000')
            expect(singlePaymentReceiptAfterPayment.paid).toEqual(singlePaymentReceiptAfterPayment.toPay)

            // Assert with no payments for one receipt
            expect(noPaymentReceiptAfterPayments.id).toEqual(receiptWithNoPayments.id)
            expect(noPaymentReceiptBeforePayment.id).toEqual(receiptWithNoPayments.id)
            expect(noPaymentReceiptBeforePayment.paid).toEqual('0.00000000')
            expect(noPaymentReceiptAfterPayments.paid).toEqual('0.00000000')
            expect(noPaymentReceiptAfterPayments.paid).not.toEqual(noPaymentReceiptAfterPayments.toPay)
        })

        test('Test case when receipt is paid and overwritten by billing integration.', async () => {

            const UNIT_NAME = '22'

            const admin = await makeLoggedInAdminClient()

            // Prepare billing integration and receipts
            const { organizationClient, integrationClient } = await makeClientWithPropertyAndBilling({ billingAccountAttrs: { unitName: UNIT_NAME } })
            const [ receiptWithSinglePayment ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                organizationClient.billingAccount,
                { toPay: '2000.00' }
            )

            // Prepare acquiring integration
            const [ acquiringIntegration ] = await createTestAcquiringIntegration(admin, [organizationClient.billingIntegration], {
                canGroupReceipts: true,
            })
            await createTestAcquiringIntegrationContext(organizationClient, organizationClient.organization, acquiringIntegration)

            // Prepare resident entities
            const residentClient = await makeClientWithResidentUser()
            const [ resident ] = await registerResidentByTestClient(residentClient, {
                address: organizationClient.property.address,
                addressMeta: organizationClient.property.addressMeta,
                unitName: UNIT_NAME,
            })

            const [serviceConsumer] = await registerServiceConsumerByTestClient(residentClient, {
                residentId: resident.id,
                accountNumber: organizationClient.billingAccount.number,
                organizationId: organizationClient.organization.id,
            })

            // Mobile app gets the list of all resident receipts
            const [ singlePaymentReceiptBeforePayment ] = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } }, { sortBy: ['toPay_ASC'] } )

            // Mobile app tries to pay for the first receipt in one payment
            await completeTestPayment(residentClient, admin, serviceConsumer.id, singlePaymentReceiptBeforePayment.id, {}, 'WITHDRAWN')

            // Billing Recreates the receipt
            const [ deletedReceiptWithSinglePayment ] = await updateTestBillingReceipt(
                integrationClient,
                receiptWithSinglePayment.id,
                {
                    deletedAt: 'true',
                }
            )
            const [ newReceiptWithSinglePayment ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                organizationClient.billingAccount,
                {
                    toPay: '2500.00',
                    recipient: receiptWithSinglePayment.recipient,
                }
            )

            // Resident gets own receipts and sees that first one is fully paid!
            const [ singlePaymentReceiptAfterPayment ] = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } }, { sortBy: ['toPay_ASC'] })

            // Assert with one payment for one receipt
            expect(singlePaymentReceiptBeforePayment.id).toEqual(receiptWithSinglePayment.id)
            expect(singlePaymentReceiptBeforePayment.toPay).toEqual('2000.00000000')
            expect(singlePaymentReceiptBeforePayment.paid).toEqual('0.00000000')

            expect(deletedReceiptWithSinglePayment.deletedAt).not.toBeNull()

            expect(singlePaymentReceiptAfterPayment.id).toEqual(newReceiptWithSinglePayment.id)
            expect(singlePaymentReceiptAfterPayment.toPay).toEqual('2500.00000000')
            expect(singlePaymentReceiptAfterPayment.paid).toEqual('2000.00000000') // Since we paid for the old receipt!
        })

        test('Test case when receipt is duplicated in single period in single organization. e.g Housing and Water goes to different recipients', async () => {

            const UNIT_NAME = '22'

            const admin = await makeLoggedInAdminClient()

            // Prepare billing integration and receipts
            const { organizationClient, integrationClient } = await makeClientWithPropertyAndBilling({ billingAccountAttrs: { unitName: UNIT_NAME } })

            const [ receiptForHousing ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                organizationClient.billingAccount,
                { toPay: '2000.00' }
            )
            const [ receiptForWater ] = await createTestBillingReceipt(
                integrationClient,
                organizationClient.billingIntegrationContext,
                organizationClient.billingProperty,
                organizationClient.billingAccount,
                { toPay: '2500.00' }
            )

            // Prepare acquiring integration
            const [ acquiringIntegration ] = await createTestAcquiringIntegration(admin, [organizationClient.billingIntegration], {
                canGroupReceipts: true,
            })
            await createTestAcquiringIntegrationContext(organizationClient, organizationClient.organization, acquiringIntegration)

            // Prepare resident entities
            const residentClient = await makeClientWithResidentUser()
            const [ resident ] = await registerResidentByTestClient(residentClient, {
                address: organizationClient.property.address,
                addressMeta: organizationClient.property.addressMeta,
                unitName: UNIT_NAME,
            })

            const [serviceConsumer] = await registerServiceConsumerByTestClient(residentClient, {
                residentId: resident.id,
                accountNumber: organizationClient.billingAccount.number,
                organizationId: organizationClient.organization.id,
            })

            // Mobile app gets the list of all resident receipts
            const [ receiptForHousingBeforePayment, receiptForWaterBeforePayment ] = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } }, { sortBy: ['toPay_ASC'] } )

            // Mobile app tries to pay for the first receipt in one payment
            await completeTestPayment(residentClient, admin, serviceConsumer.id, receiptForHousingBeforePayment.id)
            await completeTestPayment(residentClient, admin, serviceConsumer.id, receiptForWaterBeforePayment.id)

            // Resident gets own receipts and sees that first one is fully paid!
            const [ receiptForHousingAfterPayment, receiptForWaterAfterPayment ] = await ResidentBillingReceipt.getAll(residentClient, { serviceConsumer: { resident: { id: resident.id } } }, { sortBy: ['toPay_ASC'] })

            // Assert with one payment for one receipt
            expect(receiptForHousingAfterPayment.id).toEqual(receiptForHousing.id)
            expect(receiptForHousingAfterPayment.toPay).toEqual('2000.00000000')
            expect(receiptForHousingBeforePayment.paid).toEqual('0.00000000')
            expect(receiptForHousingAfterPayment.paid).toEqual('2000.00000000')

            expect(receiptForWaterAfterPayment.id).toEqual(receiptForWater.id)
            expect(receiptForWaterAfterPayment.toPay).toEqual('2500.00000000')
            expect(receiptForWaterBeforePayment.paid).toEqual('0.00000000')
            expect(receiptForWaterAfterPayment.paid).toEqual('2500.00000000') // Since we paid for the old receipt!

            expect(receiptForHousing.period).toEqual(receiptForWater.period)
            expect(receiptForHousing.account.id).toEqual(receiptForWater.account.id)
        })
    })
})
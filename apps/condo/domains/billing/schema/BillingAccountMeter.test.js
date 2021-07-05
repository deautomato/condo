/**
 * Generated by `createschema billing.BillingAccountMeter 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; resource:Relationship:BillingMeterResource:PROTECT; raw:Json; meta:Json'`
 */

const { createTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingMeterResource } = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingAccount } = require('@condo/domains/billing/utils/testSchema')
const { createTestBillingProperty } = require('@condo/domains/billing/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { BillingAccountMeter, createTestBillingAccountMeter, updateTestBillingAccountMeter } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObjects, expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('BillingAccountMeter', () => {
    test('admin: create BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [obj] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
        expect(obj.resource.id).toEqual(resource.id)
    })

    test('organization integration manager: create BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [obj] = await createTestBillingAccountMeter(managerUserClient, context, property, billingAccount, resource)

        expect(obj.context.id).toEqual(context.id)
        expect(obj.property.id).toEqual(property.id)
        expect(obj.resource.id).toEqual(resource.id)
    })

    test('user: create BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingAccountMeter(client, context, property, billingAccount, resource)
        })
    })

    test('anonymous: create BillingAccountMeter', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingAccountMeter(client, context, property, billingAccount, resource)
        })
    })

    test('admin: read BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)
        const objs = await BillingAccountMeter.getAll(admin, { id: billingAccountMeter.id })

        expect(objs).toHaveLength(1)
    })

    test('organization integration manager: read BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(managerUserClient, context, property, billingAccount, resource)

        const objs = await BillingAccountMeter.getAll(managerUserClient, { id: billingAccountMeter.id })

        expect(objs).toHaveLength(1)
    })

    test('user: read BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const objs = await BillingAccountMeter.getAll(client, { id: billingAccountMeter.id })
        expect(objs).toHaveLength(0)
    })

    test('anonymous: read BillingAccountMeter', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObjects(async () => {
            await BillingAccountMeter.getAll(client, { id: billingAccountMeter.id })
        })
    })

    test('admin: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)
        const payload = {
            raw: '123',
        }
        const [objUpdated] = await updateTestBillingAccountMeter(admin, billingAccountMeter.id, payload)

        expect(objUpdated.id).toEqual(billingAccountMeter.id)
        expect(objUpdated.raw).toEqual('123')
    })

    test('organization integration manager: update BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(managerUserClient, context, property, billingAccount, resource)
        const payload = {
            raw: '123',
        }
        const [objUpdated] = await updateTestBillingAccountMeter(managerUserClient, billingAccountMeter.id, payload)

        expect(objUpdated.id).toEqual(billingAccountMeter.id)
        expect(objUpdated.raw).toEqual('123')
    })

    test('user: update BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingAccountMeter(client, billingAccountMeter.id, payload)
        })
    })

    test('anonymous: update BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestBillingAccountMeter(client, billingAccountMeter.id, payload)
        })
    })

    test('admin: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(admin, billingAccountMeter.id)
        })
    })

    test('organization integration manager: delete BillingAccountMeter', async () => {
        const admin = await makeLoggedInAdminClient()
        const { organization, integration, managerUserClient } = await makeOrganizationIntegrationManager()
        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [property] = await createTestBillingProperty(managerUserClient, context)
        const [billingAccount] = await createTestBillingAccount(managerUserClient, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(managerUserClient, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(managerUserClient, billingAccountMeter.id)
        })
    })

    test('user: delete BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(client, billingAccountMeter.id)
        })
    })

    test('anonymous: delete BillingAccountMeter', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
        const [property] = await createTestBillingProperty(admin, context)
        const [billingAccount] = await createTestBillingAccount(admin, context, property)
        const [resource] = await createTestBillingMeterResource(admin)
        const [billingAccountMeter] = await createTestBillingAccountMeter(admin, context, property, billingAccount, resource)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await BillingAccountMeter.delete(client, billingAccountMeter.id)
        })
    })
})

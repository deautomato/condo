/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */

const faker = require('faker')
const get = require('lodash/get')
const sample = require('lodash/sample')

const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@core/keystone/test.utils')

const { expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToResult } = require('@condo/domains/common/utils/testSchema')
const { sleep } = require('@condo/domains/common/utils/sleep')

const { registerNewOrganization, makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')

const { buildingMapJson } = require('@condo/domains/property/constants/property')
const { createTestProperty, makeClientWithResidentAccessAndProperty, Property } = require('@condo/domains/property/utils/testSchema')
const { buildFakeAddressAndMeta } = require('@condo/domains/property/utils/testSchema/factories')

const { registerResidentByTestClient, Resident } = require('@condo/domains/resident/utils/testSchema')

const { makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithStaffUser } = require('@condo/domains/user/utils/testSchema')
const { FLAT_UNIT_TYPE, UNIT_TYPES } = require('@condo/domains/property/constants/common')

describe('manageResidentToPropertyAndOrganizationConnections worker task tests', () => {
    it('connects new property with matched address to existing orphan residents (no other props)', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)

        const userClient = await makeClientWithResidentUser()

        await registerResidentByTestClient(userClient, { address: addressMeta.value, addressMeta })

        const organizationClient = await makeClientWithRegisteredOrganization()

        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const propertyData = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyData)

        // NOTE: give worker some time
        await sleep(1000)

        const resident = await Resident.getOne(userClient, { id: userClient.id })

        expect(get(resident, 'organization.id')).toEqual(organizationClient.organization.id)
        expect(get(resident, 'property.id')).toEqual(property.id)
    })

    it('connects new property with matched address to existing residents, ignores deleted and younger props', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        const userClient = await makeClientWithResidentUser()

        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()
        const organizationClient2 = await makeClientWithRegisteredOrganization()

        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyPayload)

        await Property.softDelete(organizationClient1, property1.id)
        await registerResidentByTestClient(userClient, { address: addressMeta.value, addressMeta })

        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)

        // NOTE: give worker some time
        await sleep(1000)

        const resident = await Resident.getOne(userClient, { id: userClient.id })

        expect(resident.organization.id).toEqual(organizationClient.organization.id)
        expect(resident.property.id).toEqual(property.id)

        // add one more property with same address, should not reconnect residents to it
        await createTestProperty(organizationClient2, organizationClient2.organization, propertyPayload)

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: userClient.id })

        expect(resident1.organization.id).toEqual(organizationClient.organization.id)
        expect(resident1.property.id).toEqual(property.id)
    })

    it('connects restored property with matched address to existing residents, ignores deleted and younger props', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        const userClient = await makeClientWithResidentUser()
        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()

        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyPayload)

        const [deletedProperty] = await Property.softDelete(organizationClient, property.id)

        expect(deletedProperty.deletedAt).not.toBeNull()

        const [deletedProperty1] = await Property.softDelete(organizationClient1, property1.id)

        expect(deletedProperty1.deletedAt).not.toBeNull()

        const [resident] = await registerResidentByTestClient(userClient, { address: addressMeta.value, addressMeta })

        expect(resident.organization).toBeNull()
        expect(resident.property).toBeNull()

        const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
        const restoredProperty = await Property.update(organizationClient, property.id, { deletedAt: null, dv: 1, sender })

        expect(restoredProperty.deletedAt).toBeNull()

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: userClient.id })

        expect(get(resident1, 'organization.id')).toEqual(organizationClient.organization.id)
        expect(get(resident1, 'property.id')).toEqual(property.id)
    })

    it('connects restored property with matched address to existing residents (including connected to other props), ignores deleted props', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        const userClient1 = await makeClientWithResidentUser()
        const userClient2 = await makeClientWithResidentUser()
        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()
        const organizationClient2 = await makeClientWithRegisteredOrganization()

        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyPayload)

        const [deletedProperty] = await Property.softDelete(organizationClient, property.id)

        expect(deletedProperty.deletedAt).not.toBeNull()

        // Resident #1 should connect to the only non-deleted property1
        const [resident1] = await registerResidentByTestClient(userClient1, { address: addressMeta.value, addressMeta })

        expect(get(resident1, 'organization.id')).toEqual(organizationClient1.organization.id)
        expect(get(resident1, 'property.id')).toEqual(property1.id)

        const [property2] = await createTestProperty(organizationClient2, organizationClient2.organization, propertyPayload)

        // NOTE: give worker some time
        await sleep(1000)

        const resident1_1 = await Resident.getOne(userClient1, { id: userClient1.id })

        // after property2 registration resident1 still stays connected to property1
        expect(get(resident1_1, 'organization.id')).toEqual(organizationClient1.organization.id)
        expect(get(resident1_1, 'property.id')).toEqual(property1.id)

        const [deletedProperty1] = await Property.softDelete(organizationClient1, property1.id)

        // make sure property1 is softDeleted
        expect(deletedProperty1.deletedAt).not.toBeNull()

        // NOTE: give worker some time
        await sleep(1000)

        const resident1_2 = await Resident.getOne(userClient1, { id: userClient1.id })

        // after property1 deleted resident1 should reconnect to property2
        expect(get(resident1_2, 'organization.id')).toEqual(organizationClient2.organization.id)
        expect(get(resident1_2, 'property.id')).toEqual(property2.id)

        const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
        const restoredProperty1 = await Property.update(organizationClient1, property1.id, { deletedAt: null, dv: 1, sender })

        expect(restoredProperty1.deletedAt).toBeNull()

        // NOTE: give worker some time
        await sleep(1000)

        const resident1_3 = await Resident.getOne(userClient1, { id: userClient1.id })

        // after property1 restored resident1 should reconnect to property1
        expect(get(resident1_3, 'organization.id')).toEqual(organizationClient1.organization.id)
        expect(get(resident1_3, 'property.id')).toEqual(property1.id)

        // Resident #2 should connect to the oldest non-deleted property1
        await registerResidentByTestClient(userClient2, { address: addressMeta.value, addressMeta })

        const resident2 = await Resident.getOne(userClient2, { id: userClient2.id })

        expect(get(resident2, 'organization.id')).toEqual(organizationClient1.organization.id)
        expect(get(resident2, 'property.id')).toEqual(property1.id)

    })

    it('disconnects residents from deleted property with no other matched properties', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const userClient = await makeClientWithResidentUser()
        const organizationClient = await makeClientWithRegisteredOrganization()
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const payload = { address: addressMeta.value, addressMeta }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)

        // NOTE: give worker some time
        await sleep(1000)

        const [resident] = await registerResidentByTestClient(userClient, payload)

        expect(get(resident, 'organization.id')).toEqual(get(organizationClient, 'organization.id'))
        expect(get(resident, 'property.id')).toEqual(get(property, 'id'))

        await Property.softDelete(organizationClient, get(property, 'id'))

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: get(userClient, 'id') })

        expect(resident1.organization).toBeNull()
        expect(resident1.property).toBeNull()
    })

    it('disconnects residents from deleted property with no other matched properties (all deleted)', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const userClient = await makeClientWithResidentUser()
        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyPayload)
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)

        await Property.softDelete(organizationClient1, property1.id)

        // NOTE: give worker some time
        await sleep(1000)

        const payload = { address: addressMeta.value, addressMeta }
        const [resident] = await registerResidentByTestClient(userClient, payload)

        expect(resident.organization.id).toEqual(organizationClient.organization.id)
        expect(resident.property.id).toEqual(property.id)

        await Property.softDelete(organizationClient, property.id)

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: userClient.id })

        expect(resident1.organization).toBeNull()
        expect(resident1.property).toBeNull()
    })

    it('reconnects residents from deleted property to other matched (non-deleted) oldest property', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const userClient = await makeClientWithResidentUser()
        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()
        const organizationClient2 = await makeClientWithRegisteredOrganization()
        const propertyPayload = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyPayload)
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyPayload)

        await createTestProperty(organizationClient2, organizationClient2.organization, propertyPayload)

        const payload = { address: addressMeta.value, addressMeta }
        const [resident] = await registerResidentByTestClient(userClient, payload)

        expect(resident.organization.id).toEqual(organizationClient.organization.id)
        expect(resident.property.id).toEqual(property.id)

        await Property.softDelete(organizationClient, property.id)

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: userClient.id })

        expect(resident1.organization.id).toEqual(organizationClient1.organization.id)
        expect(resident1.property.id).toEqual(property1.id)
    })

    it('disconnects and connects residents from/to property on property address change', async () => {
        const { address, addressMeta } = buildFakeAddressAndMeta(true)
        const { address: address1, addressMeta: addressMeta1 } = buildFakeAddressAndMeta(true)

        const userClient = await makeClientWithResidentUser()
        const userClient1 = await makeClientWithResidentUser()

        await registerResidentByTestClient(userClient, { address: addressMeta.value, addressMeta })
        await registerResidentByTestClient(userClient1, { address: addressMeta1.value, addressMeta: addressMeta1 })

        const organizationClient = await makeClientWithRegisteredOrganization()
        const organizationClient1 = await makeClientWithRegisteredOrganization()

        // remove flat number from address for organization
        const orgAddressMeta = { ...addressMeta, value: address }
        const propertyData = { address, addressMeta: orgAddressMeta, map: buildingMapJson }
        const [property] = await createTestProperty(organizationClient, organizationClient.organization, propertyData)
        const [property1] = await createTestProperty(organizationClient1, organizationClient1.organization, propertyData)

        // NOTE: give worker some time
        await sleep(1000)

        const resident1 = await Resident.getOne(userClient, { id: userClient.id })
        const resident2 = await Resident.getOne(userClient1, { id: userClient1.id })

        expect(get(resident1, 'property.id')).toEqual(property.id)
        expect(get(resident1, 'organization.id')).toEqual(organizationClient.organization.id)
        expect(get(resident2, 'property')).toBeNull()
        expect(get(resident2, 'organization')).toBeNull()

        const orgAddressMeta1 = { ...addressMeta1, value: address1 }
        const propertyData1 = { address: address1, addressMeta: orgAddressMeta1, map: buildingMapJson }
        const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

        await Property.update(organizationClient, property.id, { ...propertyData1, dv: 1, sender })

        // property address update operation takes more time, than property softDelete or create
        // NOTE: give worker some time
        await sleep(1500)

        const resident1_1 = await Resident.getOne(userClient, { id: userClient.id })
        const resident2_1 = await Resident.getOne(userClient1, { id: userClient1.id })

        expect(get(resident1_1, 'property.id')).toEqual(property1.id)
        expect(get(resident1_1, 'organization.id')).toEqual(property1.organization.id)
        expect(get(resident2_1, 'property.id')).toEqual(property.id)
        expect(get(resident2_1, 'organization.id')).toEqual(property.organization.id)
    })

})

describe('RegisterResidentService', () => {
    test('can be executed by user with "resident" type', async () => {
        const userClient = await makeClientWithResidentUser()
        const [obj, attrs] = await registerResidentByTestClient(userClient)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(userClient.user.id)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    test('cannot be executed by user', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerResidentByTestClient(userClient)
        }, 'result')
    })

    test('anonymous: execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationError(async () => {
            await registerResidentByTestClient(client)
        }, 'result')
    })

    test('admin: execute', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const [obj, attrs] = await registerResidentByTestClient(adminClient)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    it('connects property with matched address to resident', async () => {
        const adminClient = await makeLoggedInAdminClient()

        const [organization] = await registerNewOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization, { map: buildingMapJson })

        const payload = {
            address: property.address,
            addressMeta: property.addressMeta,
        }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property.id).toEqual(property.id)
        expect(obj.organization.id).toEqual(organization.id)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    it('does not connects to deleted property with matched address to resident', async () => {
        const adminClient = await makeLoggedInAdminClient()

        const [organization] = await registerNewOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization, { map: buildingMapJson })
        await Property.softDelete(adminClient, property.id)

        const payload = {
            address: property.address,
            addressMeta: property.addressMeta,
        }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)
        await Property.softDelete(adminClient, property.id, { deletedAt: null })

        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property).toEqual(null)
        expect(obj.organization).toEqual(null)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    it('does not connects to old deleted property with matched address', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const { address, addressMeta } = buildFakeAddressAndMeta(false)

        const [organization1] = await registerNewOrganization(adminClient)
        const [organization2] = await registerNewOrganization(adminClient)
        const [property1] = await createTestProperty(adminClient, organization1, { address, addressMeta, map: buildingMapJson })
        const [property2] = await createTestProperty(adminClient, organization2, { address, addressMeta, map: buildingMapJson })

        await Property.softDelete(adminClient, property1.id)

        const payload = { address, addressMeta }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)

        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property.id).toEqual(property2.id)
        expect(obj.organization.id).toEqual(organization2.id)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    it('does not connects to new property with matched address', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const { address, addressMeta } = buildFakeAddressAndMeta(false)

        const [organization1] = await registerNewOrganization(adminClient)
        const [organization2] = await registerNewOrganization(adminClient)
        const [property1] = await createTestProperty(adminClient, organization1, { address, addressMeta, map: buildingMapJson })
        await createTestProperty(adminClient, organization2, { address, addressMeta, map: buildingMapJson })

        const payload = { address, addressMeta }

        const [obj, attrs] = await registerResidentByTestClient(adminClient, payload)

        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(adminClient.user.id)
        expect(obj.property.id).toEqual(property1.id)
        expect(obj.organization.id).toEqual(organization1.id)
        expect(obj.unitType).toEqual(FLAT_UNIT_TYPE)
    })

    test('cannot be executed for staff', async () => {
        const staffClient = await makeClientWithStaffUser()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await registerResidentByTestClient(staffClient)
        })
    })

    it('restore deleted Resident for the same address and unitName (property not exists)', async () => {
        const userClient = await makeClientWithResidentAccessAndProperty()
        const [resident, attrs] = await registerResidentByTestClient(userClient)
        const [softDeletedResident] = await Resident.softDelete(userClient, resident.id)

        const [restoredResident] = await registerResidentByTestClient(userClient, {
            address: attrs.address,
            unitName: attrs.unitName,
        })
        expect(restoredResident.id).toEqual(softDeletedResident.id)
        expect(restoredResident.deletedAt).toBeNull()
        expect(restoredResident.organization).toBeNull()
        expect(restoredResident.property).toBeNull()
    })

    it('restore deleted Resident for the same address and unitName (property exists)', async () => {
        const adminClient = await makeLoggedInAdminClient()
        const userClient = await makeClientWithResidentAccessAndProperty()

        const [resident, attrs] = await registerResidentByTestClient(userClient)
        const [deletedResident] = await Resident.softDelete(userClient, resident.id)
        expect(deletedResident.id).toEqual(resident.id)
        expect(deletedResident.deletedAt).not.toBeNull()
        expect(deletedResident.organization).toEqual(null)
        expect(deletedResident.property).toEqual(null)

        const [organization] = await registerNewOrganization(adminClient)
        const [property] = await createTestProperty(adminClient, organization, {
            address: attrs.address,
            addressMeta: attrs.addressMeta,
            map: buildingMapJson,
        })

        const [restoredResident] = await registerResidentByTestClient(userClient, {
            address: attrs.address,
            addressMeta: attrs.addressMeta,
            unitName: attrs.unitName,
        })
        expect(restoredResident.id).toEqual(resident.id)
        expect(restoredResident.deletedAt).toBeNull()
        expect(restoredResident.organization.id).toEqual(organization.id)
        expect(restoredResident.property.id).toEqual(property.id)
    })

    it('should set unitType field if it was passed', async () => {
        const userClient = await makeClientWithResidentUser()
        const unitType = sample(UNIT_TYPES)
        const [obj, attrs] = await registerResidentByTestClient(userClient, { unitType })

        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.address).toEqual(attrs.address)
        expect(obj.addressMeta).toStrictEqual(attrs.addressMeta)
        expect(obj.user.id).toEqual(userClient.user.id)
        expect(obj.unitType).toEqual(unitType)
    })
})

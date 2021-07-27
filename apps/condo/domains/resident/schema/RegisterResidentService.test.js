/**
 * Generated by `createservice property.RegisterResidentService --type mutations`
 */

const { Resident } = require('../utils/testSchema')
const { buildingMapJson } = require('@condo/domains/property/constants/property')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithResidentUser } = require('../../user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const { expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, createTestUser, makeClientWithStaffUser } = require('@condo/domains/user/utils/testSchema')
const { registerResidentByTestClient } = require('@condo/domains/resident/utils/testSchema')
const { catchErrorFrom } = require('../../common/utils/testSchema')

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
        const [resident] = await Resident.getAll(userClient, { id: obj.id })
        expect(resident.user.id).toEqual(userClient.user.id)
    })

    test('cannot be executed by user', async () => {
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAuthenticationError(async () => {
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
        const [resident] = await Resident.getAll(adminClient, { id: obj.id })
        expect(resident.user.id).toEqual(adminClient.user.id)
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
        const [resident] = await Resident.getAll(adminClient, { id: obj.id })
        expect(resident.user.id).toEqual(adminClient.user.id)
        expect(resident.property.id).toEqual(property.id)
        expect(resident.organization.id).toEqual(organization.id)
    })

    test('cannot be executed for staff', async () => {
        const staffClient = await makeClientWithStaffUser()
        await catchErrorFrom(async () => {
            await registerResidentByTestClient(staffClient)
        }, ({ errors, data }) => {
            expect(errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['result'],
            })
            expect(data).toEqual({ 'result': null })
        })
    })
})
/**
 * Generated by `createservice meter.ExportMeterReadingsService --type queries`
 */
const isObsConfigured = require('@condo/domains/common/utils/testSchema/isObsConfigured')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeClient } = require('@core/keystone/test.utils')
const { createTestMeter, createTestMeterReading, MeterReadingSource, MeterResource, exportMeterReadingsByTestClient } = require('../utils/testSchema')
const { CALL_METER_READING_SOURCE_ID, COLD_WATER_METER_RESOURCE_ID } = require('../constants/constants')
const { makeEmployeeUserClientWithAbilities } = require('@condo/domains/organization/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')

describe('ExportMeterReadingsService', () => {
    describe('Employee with "canManageMeters"', () => {
        it('returns exported meter readings from selected organization', async () => {
            if (isObsConfigured()) {
                const client = await makeEmployeeUserClientWithAbilities({
                    canManageMeters: true,
                })
                const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
                const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })
                const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})
                await createTestMeterReading(client, meter, client.organization, source)

                const [{ status, linkToFile }] = await exportMeterReadingsByTestClient(client, {
                    where: { organization: { id: client.organization.id } },
                    sortBy: 'id_ASC',
                })

                expect(status).toBe('ok')
                expect(linkToFile).not.toHaveLength(0)
            }
        })

        it('throws error when no meter readings are presented for specified organization', async () => {
            if (isObsConfigured()) {
                const client = await makeEmployeeUserClientWithAbilities({
                    canManageMeters: true,
                })
                const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
                await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })
                await createTestMeter(client, client.organization, client.property, resource, {})

                await catchErrorFrom(async () => {
                    await exportMeterReadingsByTestClient(client, {
                        where: { organization: { id: client.organization.id } },
                        sortBy: 'id_ASC',
                    })
                }, ({ errors }) => {
                    expect(errors).toMatchObject([{
                        message: 'Could not found meter readings to export for specified organization',
                        path: ['result'],
                        extensions: {
                            query: 'exportMeterReadings',
                            code: 'BAD_USER_INPUT',
                            type: 'NOTHING_TO_EXPORT',
                            message: 'Could not found meter readings to export for specified organization',
                        },
                    }])
                })
            }
        })
    })

    test('anonymous: cannot get meter readings export', async () => {
        const anonymous = await makeClient()

        const client = await makeEmployeeUserClientWithAbilities({
            canManageMeters: true,
        })
        const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
        const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })
        const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})
        await createTestMeterReading(client, meter, client.organization, source)

        await catchErrorFrom(async () => {
            await exportMeterReadingsByTestClient(anonymous, {
                where: {
                    organization: { id: client.organization.id },
                },
                sortBy: 'id_ASC',

            })
        }, ({ errors }) => {
            expect(errors).toHaveLength(1)
        })
    })

    test('user: cannot get meter readings export', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()

        const client = await makeEmployeeUserClientWithAbilities({
            canManageMeters: true,
        })
        const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
        const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })
        const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})
        await createTestMeterReading(client, meter, client.organization, source)

        await catchErrorFrom(async () => {
            await exportMeterReadingsByTestClient(user, {
                where: {
                    organization: { id: client.organization.id },
                },
                sortBy: 'id_ASC',
            })
        }, async ({ errors }) => {
            expect(errors).toHaveLength(1)
        })
    })

    test('admin: can get meter readings export from selected organization', async () => {
        if (isObsConfigured()) {
            const client = await makeEmployeeUserClientWithAbilities({
                canManageMeters: true,
            })
            const [resource] = await MeterResource.getAll(client, { id: COLD_WATER_METER_RESOURCE_ID })
            const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })
            const [meter] = await createTestMeter(client, client.organization, client.property, resource, {})
            await createTestMeterReading(client, meter, client.organization, source)

            const admin = await makeLoggedInAdminClient()

            const [{ status, linkToFile }] = await exportMeterReadingsByTestClient(admin, {
                where: { organization: { id: client.organization.id } },
                sortBy: 'id_ASC',
            })

            expect(status).toBe('ok')
            expect(linkToFile).not.toHaveLength(0)
        }
    })
})
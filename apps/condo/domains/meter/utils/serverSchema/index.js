/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const get = require('lodash/get')

const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')
const { MeterResource: MeterResourceGQL } = require('@condo/domains/meter/gql')
const { MeterReadingSource: MeterReadingSourceGQL } = require('@condo/domains/meter/gql')
const { Meter: MeterGQL } = require('@condo/domains/meter/gql')
const { MeterReading: MeterReadingGQL } = require('@condo/domains/meter/gql')
const { find } = require('@core/keystone/schema')
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')
const { MeterReadingFilterTemplate: MeterReadingFilterTemplateGQL } = require('@condo/domains/meter/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const MeterResource = generateServerUtils(MeterResourceGQL)
const MeterReadingSource = generateServerUtils(MeterReadingSourceGQL)
const Meter = generateServerUtils(MeterGQL)
const MeterReading = generateServerUtils(MeterReadingGQL)
const MeterReadingFilterTemplate = generateServerUtils(MeterReadingFilterTemplateGQL)
/* AUTOGENERATE MARKER <CONST> */

/**
 * Get all meters, which resident has access to,
 * Mostly used in access, that's why used native keystone utils
 * @param userId - id of user
 * @returns {Array<string>} list of meters ids which are available for resident
 */
const getAvailableResidentMetersIds = async (userId) => {
    const userResidents = await find('Resident', {
        user: { id: userId, deletedAt: null },
        property: { deletedAt: null },
        organization: { deletedAt: null },
        deletedAt: null,
    })
    const residentIds = userResidents.map(resident => resident.id)
    const residentsByIds = Object.assign({}, ...userResidents.map(obj => ({ [obj.id]: obj })))

    const userConsumers = await find('ServiceConsumer', {
        resident: { id_in: residentIds, deletedAt: null },
        organization: { deletedAt: null },
        deletedAt: null,
    })

    const selections = userConsumers.map(serviceConsumer => ({
        property: { id: get(residentsByIds, [serviceConsumer.resident, 'property']) },
        unitName: get(residentsByIds, [serviceConsumer.resident, 'unitName']),
        accountNumber: serviceConsumer.accountNumber,
    }))

    const orStatement = selections.map(selection => ({
        AND: [
            selection,
        ],
    }))

    const availableMeters = await find('Meter', {
        OR: orStatement,
        deletedAt: null,
        isAutomatic: false,
    })

    return availableMeters.map(meter => meter.id)
}

const loadMetersForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const metersLoader = new GqlWithKnexLoadList({
        listKey: 'Meter',
        fields: 'id unitName accountNumber number place',
        singleRelations: [
            ['Property', 'property', 'address'],
            ['MeterResource', 'resource', 'id'],
        ],
        sortBy,
        where,
    })

    return await metersLoader.load()
}


const loadMeterReadingsForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const meterReadingsLoader = new GqlWithKnexLoadList({
        listKey: 'MeterReading',
        fields: 'id date value1 value2 value3 value4 clientName',
        singleRelations: [
            ['Meter', 'meter', 'id'],
            ['MeterReadingSource', 'source', 'id'],
        ],
        sortBy,
        where,
    })

    return await meterReadingsLoader.load()
}

module.exports = {
    MeterResource,
    MeterReadingSource,
    Meter,
    MeterReading,
    getAvailableResidentMetersIds,
    loadMetersForExcelExport,
    loadMeterReadingsForExcelExport,
    MeterReadingFilterTemplate,
/* AUTOGENERATE MARKER <EXPORTS> */
}

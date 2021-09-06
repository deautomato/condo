/**
 * Generated by `createschema meter.MeterResource 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { gql } = require('graphql-tag')
const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const METER_RESOURCE_FIELDS = `{ name measure ${COMMON_FIELDS} }`
const MeterResource = generateGqlQueries('MeterResource', METER_RESOURCE_FIELDS)

const METER_READING_SOURCE_FIELDS = `{ type name ${COMMON_FIELDS} }`
const MeterReadingSource = generateGqlQueries('MeterReadingSource', METER_READING_SOURCE_FIELDS)

const METER_FIELDS = `{ number numberOfTariffs installationDate commissioningDate verificationDate nextVerificationDate controlReadingsDate accountNumber organization { id } property { id } unitName place resource { id } ${COMMON_FIELDS} }`
const Meter = generateGqlQueries('Meter', METER_FIELDS)

const METER_READING_FIELDS = `{ value1 value2 value3 value4 date meter { id unitName number resource { name } place property { address } } organization { id } client { id } clientName clientEmail clientPhone contact { id } source { id name } ${COMMON_FIELDS} }`
const MeterReading = generateGqlQueries('MeterReading', METER_READING_FIELDS)

// TODO(codegen): write return type result!
 
const EXPORT_METER_READINGS = gql`
    query exportMeterReadings ($data: ExportMeterReadingsInput!) {
        result: exportMeterReadings (data: $data) { status, linkToFile }
    }
`

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    MeterResource,
    MeterReadingSource,
    Meter,
    MeterReading,
    EXPORT_METER_READINGS,
/* AUTOGENERATE MARKER <EXPORTS> */
}


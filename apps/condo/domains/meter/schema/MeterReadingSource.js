/**
 * Generated by `createschema meter.MeterReadingSource 'type:Select:call,mobile_app,billing; name:Text;'`
 */

const { LocalizedText } = require('@core/keystone/fields')
const { Select } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/meter/access/MeterReadingSource')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { METER_READING_SOURCE_TYPES } = require('@condo/domains/meter/constants/constants')



const MeterReadingSource = new GQLListSchema('MeterReadingSource', {
    schemaDoc: 'Ticket source. Income call, mobile_app, ...',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        type: {
            type: Select,
            options: METER_READING_SOURCE_TYPES,
            isRequired: true,
        },

        name: {
            type: LocalizedText,
            isRequired: true,
            template: 'meterReadingSource.*.name',
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadMeterReadingSources,
        create: access.canManageMeterReadingSources,
        update: access.canManageMeterReadingSources,
        delete: false,
        auth: false,
    },
})

module.exports = {
    MeterReadingSource,
}

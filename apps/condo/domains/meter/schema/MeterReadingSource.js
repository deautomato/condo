/**
 * Generated by `createschema meter.MeterReadingSource 'organization:Relationship:Organization:CASCADE; type:Select:call,mobile_app,billing; name:Text;'`
 */

const { LocalizedText } = require('@core/keystone/fields')
const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')


const MeterReadingSource = new GQLListSchema('MeterReadingSource', {
    schemaDoc: 'Ticket source. Income call, mobile_app, billing, ...',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        type: {
            type: Select,
            options: 'call, mobile_app, billing',
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
        read: true,
        create: false,
        update: false,
        delete: false,
        auth: false,
    },
})

module.exports = {
    MeterReadingSource,
}

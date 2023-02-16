/**
 * Generated by `createschema address.Address 'source:Text; address:Text; key:Text; meta:Json'`
 */

const { Text } = require('@keystonejs/fields')
const get = require('lodash/get')
const has = require('lodash/has')

const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@address-service/domains/address/access/Address')
const { OVERRIDING_ROOT } = require('@address-service/domains/address/constants')

const Address = new GQLListSchema('Address', {
    schemaDoc: 'A model containing data on the particular building\'s address',
    labelResolver: ({ address }) => address,
    fields: {
        address: {
            schemaDoc: 'The normalized address itself in one string',
            type: Text,
            isRequired: true,
        },

        key: {
            schemaDoc: 'The unique key of the address',
            type: Text,
            isRequired: true,
            isUnique: true,
        },

        meta: {
            schemaDoc: 'Some additional data for building',
            type: Json,
            isRequired: true,
        },

        overrides: {
            schemaDoc: `The list of overrides for address ${OVERRIDING_ROOT} field`,
            adminDoc: `This is a JSON object that must look like {"field":"value"}. Will use to override ${OVERRIDING_ROOT}`,
            type: Json,
            isRequired: false,
            access: {
                create: access.canManageOverrides,
                update: access.canManageOverrides,
            },
            hooks: {
                validateInput: async (data) => {
                    const { resolvedData, addFieldValidationError, existingItem, fieldPath } = data
                    Object.entries(get(resolvedData, fieldPath, {}) || {}).forEach(([path, value]) => {
                        if (!has({ ...existingItem, ...resolvedData }, `${OVERRIDING_ROOT}.${path}`)) {
                            addFieldValidationError(`${OVERRIDING_ROOT} does not contains ${path}`)
                        } else if (get({ ...existingItem, ...resolvedData }, `${OVERRIDING_ROOT}.${path}`) === get(resolvedData, `${fieldPath}.${path}`)) {
                            addFieldValidationError(`You trying to override field ${OVERRIDING_ROOT}.${path} with the same value`)
                        }
                    })
                },
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAddresses,
        create: access.canManageAddresses,
        update: access.canManageAddresses,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Address,
}

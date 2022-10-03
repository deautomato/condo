/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 */

const { Text, Checkbox } = require('@keystonejs/fields')
const get = require('lodash/get')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/scope/access/PropertyScope')
const { deleteRelatedPropertyScopeOrganizationEmployee, deleteRelatedPropertyScopeProperty } = require('@condo/domains/scope/tasks')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { PropertyScope: PropertyScopeApi } = require('@condo/domains/scope/utils/serverSchema')


const PropertyScope = new GQLListSchema('PropertyScope', {
    schemaDoc: 'A set of properties that limits the visibility of the organization\'s objects to the specified employees',
    fields: {

        name: {
            schemaDoc: 'The name of the zone that limits the visibility of employees by properties',
            type: Text,
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        hasAllProperties: {
            schemaDoc: 'True if PropertyScope includes all properties in organization',
            type: Checkbox,
            defaultValue: false,
        },

        hasAllEmployees: {
            schemaDoc: 'True if PropertyScope includes all employees in organization',
            type: Checkbox,
            defaultValue: false,
        },

    },
    hooks: {
        afterChange: async ({ operation, originalInput, updatedItem }) => {
            if (operation === 'update') {
                const deletedPropertyScopeAt = get(originalInput, 'deletedAt')

                if (deletedPropertyScopeAt) {
                    await deleteRelatedPropertyScopeOrganizationEmployee.delay(updatedItem, deletedPropertyScopeAt)
                    await deleteRelatedPropertyScopeProperty.delay(updatedItem, deletedPropertyScopeAt)
                }
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadPropertyScopes,
        create: access.canManagePropertyScopes,
        update: access.canManagePropertyScopes,
        delete: false,
        auth: true,
    },
})

module.exports = {
    PropertyScope,
}
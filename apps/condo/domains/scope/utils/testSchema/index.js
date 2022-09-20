/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const { PropertyScope: PropertyScopeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeOrganizationEmployee: PropertyScopeOrganizationEmployeeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeProperty: PropertyScopePropertyGQL } = require('@condo/domains/scope/gql')
const { SpecializationScope: SpecializationScopeGQL } = require('@condo/domains/scope/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const PropertyScope = generateGQLTestUtils(PropertyScopeGQL)
const PropertyScopeOrganizationEmployee = generateGQLTestUtils(PropertyScopeOrganizationEmployeeGQL)
const PropertyScopeProperty = generateGQLTestUtils(PropertyScopePropertyGQL)
const SpecializationScope = generateGQLTestUtils(SpecializationScopeGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestPropertyScope (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.lorem.word()

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        name,
        isDefault: false,
        ...extraAttrs,
    }
    const obj = await PropertyScope.create(client, attrs)
    return [obj, attrs]
}

async function updateTestPropertyScope (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestPropertyScope logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await PropertyScope.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestPropertyScopeOrganizationEmployee (client, propertyScope, employee, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!propertyScope || !propertyScope.id) throw new Error('no propertyScope.id')
    if (!employee || !employee.id) throw new Error('no employee.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestPropertyScopeOrganizationEmployee logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        propertyScope: { connect: { id: propertyScope.id } },
        employee: { connect: { id: employee.id } },
        ...extraAttrs,
    }
    const obj = await PropertyScopeOrganizationEmployee.create(client, attrs)
    return [obj, attrs]
}

async function updateTestPropertyScopeOrganizationEmployee (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestPropertyScopeOrganizationEmployee logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await PropertyScopeOrganizationEmployee.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestPropertyScopeProperty (client, propertyScope, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!propertyScope || !propertyScope.id) throw new Error('no propertyScope.id')
    if (!property || !property.id) throw new Error('no property.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestPropertyScopeProperty logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        propertyScope: { connect: { id: propertyScope.id } },
        property: { connect: { id: property.id } },
        ...extraAttrs,
    }
    const obj = await PropertyScopeProperty.create(client, attrs)
    return [obj, attrs]
}

async function updateTestPropertyScopeProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestPropertyScopeProperty logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await PropertyScopeProperty.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestSpecializationScope (client, employee, specialization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!employee || !employee.id) throw new Error('no employee.id')
    if (!specialization || !specialization.id) throw new Error('no specialization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestSpecializationScope logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        employee: { connect: { id: employee.id } },
        specialization: { connect: { id: specialization.id } },
        ...extraAttrs,
    }
    const obj = await SpecializationScope.create(client, attrs)
    return [obj, attrs]
}

async function updateTestSpecializationScope (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestSpecializationScope logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await SpecializationScope.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    PropertyScope, createTestPropertyScope, updateTestPropertyScope,
    PropertyScopeOrganizationEmployee, createTestPropertyScopeOrganizationEmployee, updateTestPropertyScopeOrganizationEmployee,
    PropertyScopeProperty, createTestPropertyScopeProperty, updateTestPropertyScopeProperty,
    SpecializationScope, createTestSpecializationScope, updateTestSpecializationScope,
/* AUTOGENERATE MARKER <EXPORTS> */
}

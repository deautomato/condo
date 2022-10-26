/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 */

const {
    makeLoggedInAdminClient,
    makeClient,
    UUID_RE,
    waitFor,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAccessDeniedErrorToObj,
} = require('@condo/keystone/test.utils')

const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const { PropertyScope, createTestPropertyScope, updateTestPropertyScope, createTestPropertyScopeProperty, createTestPropertyScopeOrganizationEmployee, PropertyScopeProperty, PropertyScopeOrganizationEmployee } = require('@condo/domains/scope/utils/testSchema')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const faker = require('faker')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')

describe('PropertyScope', () => {
    describe('accesses', () => {
        describe('admin', () => {
            it('can create PropertyScope', async () => {
                const admin = await makeLoggedInAdminClient()

                const [organization] = await createTestOrganization(admin)
                const [propertyScope] = await createTestPropertyScope(admin, organization)

                expect(propertyScope.id).toMatch(UUID_RE)
            })

            it('can update property scope', async () => {
                const admin = await makeLoggedInAdminClient()

                const [organization] = await createTestOrganization(admin)
                const [propertyScope] = await createTestPropertyScope(admin, organization)

                const name = faker.lorem.word()
                const [updatedPropertyScope] = await updateTestPropertyScope(admin, propertyScope.id, {
                    name,
                })

                expect(updatedPropertyScope.id).toEqual(propertyScope.id)
                expect(updatedPropertyScope.name).toEqual(name)
            })
        })

        describe('employee', async () => {
            it('employee with canManagePropertyScopes ability: can create PropertyScope in his organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManagePropertyScopes: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role)

                const [propertyScope] = await createTestPropertyScope(user, organization)

                expect(propertyScope.id).toMatch(UUID_RE)
            })

            it('employee with canManagePropertyScopes ability: cannot create PropertyScope in not his organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [organization1] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManagePropertyScopes: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestPropertyScope(user, organization1)
                })
            })

            it('employee without canManagePropertyScopes ability: cannot create PropertyScope', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                await createTestOrganizationEmployee(admin, organization, user.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestPropertyScope(user, organization)
                })
            })

            it('employee with canManagePropertyScopes ability: can update PropertyScope in his organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManagePropertyScopes: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role)

                const [propertyScope] = await createTestPropertyScope(user, organization)

                const name = faker.lorem.word()
                const [updatedPropertyScope] = await updateTestPropertyScope(user, propertyScope.id, {
                    name,
                })

                expect(updatedPropertyScope.id).toEqual(propertyScope.id)
                expect(updatedPropertyScope.name).toEqual(name)
            })

            it('employee with canManagePropertyScopes ability: cannot update PropertyScope in not his organization', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [organization1] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManagePropertyScopes: true,
                })
                await createTestOrganizationEmployee(admin, organization, user.user, role)
                const [scope] = await createTestPropertyScope(admin, organization1)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestPropertyScope(user, scope.id)
                })
            })

            it('employee without canManagePropertyScopes ability: cannot update PropertyScope', async () => {
                const admin = await makeLoggedInAdminClient()
                const user = await makeClientWithNewRegisteredAndLoggedInUser()

                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                await createTestOrganizationEmployee(admin, organization, user.user, role)
                const [scope] = await createTestPropertyScope(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestPropertyScope(user, scope.id)
                })
            })
        })

        describe('anonymous', async () => {
            it('cannot create PropertyScope', async () => {
                const admin = await makeLoggedInAdminClient()
                const anonymous = await makeClient()

                const [organization] = await createTestOrganization(admin)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestPropertyScope(anonymous, organization)
                })
            })

            it('cannot update PropertyScope', async () => {
                const admin = await makeLoggedInAdminClient()
                const anonymous = await makeClient()

                const [organization] = await createTestOrganization(admin)
                const [scope] = await await createTestPropertyScope(admin, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestPropertyScope(anonymous, scope.id)
                })
            })
        })
    })

    describe('logic', () => {
        it('delete related PropertyScopeOrganizationEmployee and PropertyScopeProperty objects after delete PropertyScope', async () => {
            const admin = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()

            const [organization] = await createTestOrganization(admin)

            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManagePropertyScopes: true,
            })
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            const [property] = await createTestProperty(admin, organization)

            const [scope] = await createTestPropertyScope(user, organization)
            const [propertyScopeProperty] = await createTestPropertyScopeProperty(user, scope, property)
            const [propertyScopeOrganizationEmployee] = await createTestPropertyScopeOrganizationEmployee(user, scope, employee)

            const readPropertyScopeProperty = await PropertyScopeProperty.getOne(admin, { id: propertyScopeProperty.id })
            expect(readPropertyScopeProperty).toBeDefined()
            const readPropertyScopeOrganizationEmployee = await PropertyScopeOrganizationEmployee.getOne(admin, { id: propertyScopeOrganizationEmployee.id })
            expect(readPropertyScopeOrganizationEmployee).toBeDefined()

            const [updatedScope] = await updateTestPropertyScope(user, scope.id, {
                deletedAt: 'true',
            })
            expect(updatedScope.deletedAt).toBeDefined()

            await waitFor(async () => {
                const deletedPropertyScopeProperty = await PropertyScopeProperty.getOne(admin, { id: propertyScopeProperty.id, deletedAt_not: null })
                const deletedPropertyScopeOrganizationEmployee = await PropertyScopeOrganizationEmployee.getOne(admin, { id: propertyScopeOrganizationEmployee.id, deletedAt_not: null })

                expect(deletedPropertyScopeProperty.deletedAt).toBeDefined()
                expect(deletedPropertyScopeOrganizationEmployee.deletedAt).toBeDefined()
            })
        })

        it('dont delete not related PropertyScopeOrganizationEmployee and PropertyScopeProperty objects after delete PropertyScope', async () => {
            const admin = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()

            const [organization] = await createTestOrganization(admin)

            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManagePropertyScopes: true,
            })
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            const [property] = await createTestProperty(admin, organization)

            const [scope] = await createTestPropertyScope(user, organization)
            const [propertyScopeProperty] = await createTestPropertyScopeProperty(user, scope, property)
            const [propertyScopeOrganizationEmployee] = await createTestPropertyScopeOrganizationEmployee(user, scope, employee)

            await PropertyScopeProperty.getOne(admin, { id: propertyScopeProperty.id })
            await PropertyScopeOrganizationEmployee.getOne(admin, { id: propertyScopeOrganizationEmployee.id })

            const [scope1] = await createTestPropertyScope(user, organization)
            const [updatedScope1] = await updateTestPropertyScope(user, scope1.id, {
                deletedAt: 'true',
            })
            expect(updatedScope1.deletedAt).toBeDefined()

            const deletedPropertyScopeProperty = await PropertyScopeProperty.getOne(admin, { id: propertyScopeProperty.id, deletedAt_not: null })
            const deletedPropertyScopeOrganizationEmployee = await PropertyScopeOrganizationEmployee.getOne(admin, { id: propertyScopeOrganizationEmployee.id, deletedAt_not: null })

            expect(deletedPropertyScopeProperty).toBeUndefined()
            expect(deletedPropertyScopeOrganizationEmployee).toBeUndefined()
        })

        it('create default PropertyScope and PropertyScopeOrganizationEmployee for all employees in organization after register organization', async () => {
            const admin = await makeLoggedInAdminClient()

            const [org] = await registerNewOrganization(admin)

            const defaultPropertyScope = await PropertyScope.getOne(admin, { organization: { id: org.id }, hasAllEmployees: true, hasAllProperties: true })
            expect(defaultPropertyScope).toBeDefined()
        })
    })
})
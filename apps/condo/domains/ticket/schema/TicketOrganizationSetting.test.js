/**
 * Generated by `createschema ticket.TicketOrganizationSetting 'organization:Relationship:Organization:CASCADE; defaultDeadline?:Integer; paidDeadline?:Integer; emergencyDeadline?:Integer; warrantyDeadline?:Integer;'`
 */

const { makeLoggedInAdminClient, makeClient } = require('@condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowValidationFailureError,
} = require('@condo/domains/common/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const {
    TicketOrganizationSetting,
    createTestTicketOrganizationSetting,
    updateTestTicketOrganizationSetting,
} = require('@condo/domains/ticket/utils/testSchema')
const {
    registerNewOrganization,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const {
    TICKET_DEFAULT_DEADLINE_DURATION_FIELDS,
    MIN_TICKET_DEADLINE_DURATION,
    MAX_TICKET_DEADLINE_DURATION,
    DEFAULT_TICKET_DEADLINE_DURATION,
} = require('@condo/domains/ticket/constants/common')

describe('TicketOrganizationSetting', () => {
    describe('CRUD', () => {
        describe('User', () => {
            describe('Employee in organization', () => {
                test('can not create TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, userClient.user, role)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketOrganizationSetting(userClient, organization)
                    })
                })
                test('can not delete TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, userClient.user, role)

                    const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                        organization: { id: organization.id },
                    })

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await TicketOrganizationSetting.delete(userClient, setting.id)
                    })
                })
                test('can update TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, userClient.user, role)

                    const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                        organization: { id: organization.id },
                    })

                    const [updatedSetting] = await updateTestTicketOrganizationSetting(userClient, setting.id, {})

                    expect(updatedSetting.id).toEqual(setting.id)
                    expect(updatedSetting.defaultDeadlineDuration).toEqual(setting.defaultDeadlineDuration)
                    expect(updatedSetting.paidDeadlineDuration).toEqual(setting.paidDeadlineDuration)
                    expect(updatedSetting.emergencyDeadlineDuration).toEqual(setting.emergencyDeadlineDuration)
                    expect(updatedSetting.warrantyDeadlineDuration).toEqual(setting.warrantyDeadlineDuration)
                })
                test('can read TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                    await createTestOrganizationEmployee(admin, organization, userClient.user, role)

                    const [setting] = await TicketOrganizationSetting.getAll(userClient,  {
                        organization: { id: organization.id },
                    })

                    expect(setting.organization.id).toMatch(organization.id)
                    expect(setting.defaultDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                    expect(setting.paidDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                    expect(setting.emergencyDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                    expect(setting.warrantyDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                })
            })
            describe('No employee in organization', () => {
                test('can not create TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestTicketOrganizationSetting(userClient, organization)
                    })
                })
                test('can not delete TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)

                    const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                        organization: { id: organization.id },
                    })

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await TicketOrganizationSetting.delete(userClient, setting.id)
                    })
                })
                test('can not update TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)

                    const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                        organization: { id: organization.id },
                    })

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestTicketOrganizationSetting(userClient, setting.id, {})
                    })
                })
                test('can not read TicketOrganizationSetting', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const [organization] = await registerNewOrganization(admin)

                    const settings = await TicketOrganizationSetting.getAll(userClient,  {
                        organization: { id: organization.id },
                    })

                    expect(settings).toHaveLength(0)
                })
            })
        })
        describe('Admin', () => {
            test('can not  create TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestTicketOrganizationSetting(admin, organization)
                })
            })
            test('can not  delete TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)

                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await TicketOrganizationSetting.delete(admin, setting.id)
                })
            })
            test('can update TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)

                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                const [updatedSetting] = await updateTestTicketOrganizationSetting(admin, setting.id, {})

                expect(updatedSetting.id).toEqual(setting.id)
                expect(updatedSetting.defaultDeadlineDuration).toEqual(setting.defaultDeadlineDuration)
                expect(updatedSetting.paidDeadlineDuration).toEqual(setting.paidDeadlineDuration)
                expect(updatedSetting.emergencyDeadlineDuration).toEqual(setting.emergencyDeadlineDuration)
                expect(updatedSetting.warrantyDeadlineDuration).toEqual(setting.warrantyDeadlineDuration)
            })
            test('can read TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)

                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                expect(setting.organization.id).toMatch(organization.id)
                expect(setting.defaultDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                expect(setting.paidDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                expect(setting.emergencyDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
                expect(setting.warrantyDeadlineDuration).toEqual(DEFAULT_TICKET_DEADLINE_DURATION)
            })
        })
        describe('Anonymous', () => {
            test('can not create TicketOrganizationSetting', async () => {
                const anonymousClient = await makeClient()
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestTicketOrganizationSetting(anonymousClient, organization)
                })
            })
            test('can not delete TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const anonymousClient = await makeClient()
                const [organization] = await registerNewOrganization(admin)

                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await TicketOrganizationSetting.delete(anonymousClient, setting.id)
                })
            })
            test('can not update TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const anonymousClient = await makeClient()
                const [organization] = await registerNewOrganization(admin)

                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestTicketOrganizationSetting(anonymousClient, setting.id, {})
                })
            })
            test('can not read TicketOrganizationSetting', async () => {
                const admin = await makeLoggedInAdminClient()
                const anonymousClient = await makeClient()
                const [organization] = await registerNewOrganization(admin)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await TicketOrganizationSetting.getAll(anonymousClient,  {
                        organization: { id: organization.id },
                    })
                })
            })
        })
    })
    describe('Validations', () => {
        const cases = [...TICKET_DEFAULT_DEADLINE_DURATION_FIELDS]
        test.each(cases)(`value of the %p field must be between values from ${MIN_TICKET_DEADLINE_DURATION} to ${MAX_TICKET_DEADLINE_DURATION} inclusive`, async (fieldPath) => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                organization: { id: organization.id },
            })

            let payload = {
                [fieldPath]: MIN_TICKET_DEADLINE_DURATION,
            }
            const [updatedSetting] = await updateTestTicketOrganizationSetting(admin, setting.id, payload)

            expect(updatedSetting.id).toEqual(setting.id)
            expect(updatedSetting[fieldPath]).toEqual(payload[fieldPath])

            payload = {
                [fieldPath]: MAX_TICKET_DEADLINE_DURATION,
            }
            const [secondUpdatedSetting] = await updateTestTicketOrganizationSetting(admin, setting.id, payload)

            expect(secondUpdatedSetting.id).toEqual(setting.id)
            expect(secondUpdatedSetting[fieldPath]).toEqual(payload[fieldPath])
        })
        describe('validate values', () => {
            test.each(cases)('should validate value "P1D"', async (fieldPath) => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                let payload = {
                    [fieldPath]: 'P1D',
                }
                const [updatedSetting] = await updateTestTicketOrganizationSetting(admin, setting.id, payload)

                expect(updatedSetting.id).toEqual(setting.id)
                expect(updatedSetting[fieldPath]).toEqual(payload[fieldPath])
            })
        })
        describe('invalidate values', () => {
            test.each(cases)('should invalidate value "P1Dinvalidate"', async (fieldPath) => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [setting] = await TicketOrganizationSetting.getAll(admin,  {
                    organization: { id: organization.id },
                })

                let payload = {
                    [fieldPath]: 'P1Dinvalidate',
                }
                await expectToThrowValidationFailureError(
                    async () => {
                        await updateTestTicketOrganizationSetting(admin, setting.id, payload)
                    },
                    'Invalid DateInterval value.'
                )
            })
        })
    })
})

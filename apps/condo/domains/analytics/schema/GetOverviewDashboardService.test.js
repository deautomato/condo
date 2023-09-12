/**
 * Generated by `createservice analytics.GetOverviewDashboardService`
 */
const Big = require('big.js')
const dayjs = require('dayjs')

const {
    makeClient,
    expectToThrowAuthenticationErrorToResult,
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowGQLError,
    expectToThrowGraphQLRequestError,
    setFeatureFlag,
} = require('@open-condo/keystone/test.utils')

const {
    PAYMENT_DONE_STATUS,
    PAYMENT_WITHDRAWN_STATUS,
    PAYMENT_PROCESSING_STATUS,
    MULTIPAYMENT_PROCESSING_STATUS,
} = require('@condo/domains/acquiring/constants/payment')
const {
    makePayerAndPayments,
    updateTestPayment,
    createTestPayment,
    Payment,
    createTestMultiPayment,
    updateTestMultiPayment,
} = require('@condo/domains/acquiring/utils/testSchema')
const { ERRORS } = require('@condo/domains/analytics/schema/GetOverviewDashboardService')
const { getOverviewDashboardByTestClient } = require('@condo/domains/analytics/utils/testSchema')
const { updateTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { ANALYTICS_V3 } = require('@condo/domains/common/constants/featureflags')
const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/miniapp/constants')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const { TICKET_STATUS_TYPES } = require('@condo/domains/ticket/constants')
const { createTestTicket, createTestTicketClassifier } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

const dateFrom = dayjs().toISOString()
const dateTo = dayjs().endOf('day').toISOString()

beforeEach(() => {
    setFeatureFlag(ANALYTICS_V3, true)
})

afterAll(() => {
    setFeatureFlag(ANALYTICS_V3, false)
})

describe('GetOverviewDashboardService', () => {
    let admin
    let organization
    let property
    let organizationAdminUser
    let acquiringContext
    let payments
    let receipts
    let resident
    let ticket
    let residentClient

    beforeAll(async () => {
        const payerAndPayments = await makePayerAndPayments(3)
        admin = payerAndPayments.admin
        acquiringContext = payerAndPayments.acquiringContext
        organization = payerAndPayments.organization
        property = payerAndPayments.property
        payments = payerAndPayments.payments
        receipts = payerAndPayments.billingReceipts
        resident = payerAndPayments.resident
        residentClient = payerAndPayments.client
        organizationAdminUser = await makeClientWithNewRegisteredAndLoggedInUser()
        organizationAdminUser.organization = organization

        const [multiPayment] = await createTestMultiPayment(admin, [payments[1]], residentClient.user, payerAndPayments.acquiringIntegration)
        const [adminRole] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageOrganization: true,
        })
        const [executor] = await createTestOrganizationEmployee(admin, organization, organizationAdminUser.user, adminRole, {
            isAccepted: true, name: organizationAdminUser.user.name,
        })

        await updateTestBillingIntegrationOrganizationContext(admin, payerAndPayments.billingContext.id, {
            status: CONTEXT_FINISHED_STATUS,
        })
        await updateTestPayment(admin, payments[0].id, { status: PAYMENT_DONE_STATUS })
        await updateTestPayment(admin, payments[1].id, {
            status: PAYMENT_PROCESSING_STATUS, explicitFee: '0.0', multiPayment: { connect: { id: multiPayment.id } },
        })
        await updateTestMultiPayment(admin, multiPayment.id, {
            explicitFee: '0.0',
            explicitServiceCharge: '0.0',
            status: MULTIPAYMENT_PROCESSING_STATUS,
        })
        await updateTestPayment(admin, payments[1].id, {
            status: PAYMENT_WITHDRAWN_STATUS, advancedAt: dayjs().toISOString(),
        })

        const [classifier] = await createTestTicketClassifier(admin)
        const [createdTicket] = await createTestTicket(admin, organization, property, {
            executor: { connect: { id: executor.user.id } },
            classifier: { connect: { id: classifier.id } },
        })
        payments = await Payment.getAll(admin, {
            organization: { id: organization.id },
            status_in: [PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS],
        })

        ticket = createdTicket
    })

    describe('Admin', () => {
        it('can query with any organization provided', async () => {
            const [organization] = await createTestOrganization(admin)
            const [data] = await getOverviewDashboardByTestClient(admin, {
                where: { organization: organization.id, dateFrom, dateTo },
                groupBy: { aggregatePeriod: 'day' },
            })

            expect(data).toHaveProperty('overview')
            expect(data.overview).toHaveProperty(['payment', 'payments'])
            expect(data.overview).toHaveProperty(['resident', 'residents'])
            expect(data.overview).toHaveProperty(['receipt', 'receipts'])
            expect(data.overview).toHaveProperty(['ticketByDay', 'tickets'])
            expect(data.overview).toHaveProperty(['ticketByProperty', 'tickets'])
            expect(data.overview).toHaveProperty(['ticketByExecutor', 'tickets'])
            expect(data.overview).toHaveProperty(['ticketByCategory', 'tickets'])
        })
    })

    describe('User', () => {
        it('can query if it has an organization administrator role', async () => {
            const payload = { where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' } }
            const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, payload)

            expect(data.overview).toHaveProperty(['payment', 'payments', '0', 'count'], '2')
            expect(data.overview).toHaveProperty(['payment', 'sum'])
        })

        it('can\'t query if it has no canManageOrganization organization access', async () => {
            const organizationEmployee = await makeClientWithNewRegisteredAndLoggedInUser()
            organizationEmployee.organization = organization
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageOrganization: false,
            })
            await createTestOrganizationEmployee(admin, organization, organizationEmployee.user, role, {
                isAccepted: true, name: organizationEmployee.user.name,
            })

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await getOverviewDashboardByTestClient(organizationEmployee, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })
            })
        })

        it('can\'t query from another organization', async () => {
            const [organization] = await createTestOrganization(admin)

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: {
                        organization: organization.id,
                        dateFrom: dayjs().startOf('month').toISOString(),
                        dateTo: dayjs().toISOString(),
                    },
                    groupBy: { aggregatePeriod: 'week' },
                })
            })
        })
    })

    describe('Resident', () => {
        it('can\'t query OverviewDashboard', async () => {
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await getOverviewDashboardByTestClient(residentClient, {
                    where: {
                        organization: organization.id,
                        dateFrom: dayjs().startOf('month').toISOString(),
                        dateTo: dayjs().toISOString(),
                    },
                    groupBy: { aggregatePeriod: 'week' },
                })
            })
        })
    })

    describe('Anonymous', () => {
        it('can\'t query OverviewDashboard', async () => {
            const client = await makeClient()
            await expectToThrowAuthenticationErrorToResult(async () => {
                await getOverviewDashboardByTestClient(client, {
                    where: {
                        organization: organization.id,
                        dateFrom: dayjs().startOf('month').toISOString(),
                        dateTo: dayjs().toISOString(),
                    },
                    groupBy: { aggregatePeriod: 'week' },
                })
            })
        })
    })

    describe('Aggregation', () => {
        describe('Ticket', () => {
            describe('Grouped by date', () => {
                it('should return tickets aggregated by day', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                    })

                    expect(data.overview.ticketByDay.tickets).toHaveLength(TICKET_STATUS_TYPES.length)
                    expect(data.overview.ticketByDay.tickets.some(e => e.count === 1)).toBeTruthy()
                    expect(data.overview.ticketByDay.tickets.every(e => e.dayGroup === dayjs(dateFrom).format('DD.MM.YYYY'))).toBeTruthy()
                })

                it('should return each day for provided filter', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: {
                            organization: organization.id,
                            dateFrom: dayjs().subtract(7, 'days').toISOString(),
                            dateTo,
                        },
                        groupBy: { aggregatePeriod: 'day' },
                    })

                    const dataWithTicket = data.overview.ticketByDay.tickets.find(e => e.count === 1)

                    expect(dataWithTicket).toBeDefined()
                    expect(data.overview.ticketByDay.tickets).toHaveLength(TICKET_STATUS_TYPES.length * 8)
                    expect(dataWithTicket.dayGroup).toMatch(dayjs().format('DD.MM.YYYY'))
                })

                it('should return tickets aggregated by week', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: {
                            organization: organization.id,
                            dateFrom: dayjs().subtract(7, 'days').toISOString(),
                            dateTo,
                        },
                        groupBy: { aggregatePeriod: 'week' },
                    })

                    expect(data.overview.ticketByDay.tickets).toBeDefined()
                    expect(data.overview.ticketByDay.tickets.some(e => e.count === 1)).toBeTruthy()
                })
            })
            describe('Grouped by property', () => {
                it('should return tickets aggregated by property', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                    })

                    expect(data.overview.ticketByProperty.tickets).toHaveLength(TICKET_STATUS_TYPES.length)
                    expect(data.overview.ticketByProperty.tickets.every(e => e.property === property.address)).toBeTruthy()
                    expect(data.overview.ticketByProperty.tickets.some(e => e.count === 1)).toBeTruthy()
                })
            })
            describe('Grouped by executor', () => {
                it('should return tickets aggregated by executor', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                    })

                    const filteredByExecutor = data.overview.ticketByExecutor.tickets.filter(e => e.executor === organizationAdminUser.user.name)

                    expect(filteredByExecutor).toHaveLength(TICKET_STATUS_TYPES.length)
                    expect(filteredByExecutor.some(e => e.count === 1)).toBeTruthy()
                })
            })
            describe('Grouped by category', () => {
                it('should return tickets aggregated by category classifier', async () => {
                    const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                        where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                    })

                    const filteredByClassifier = data.overview.ticketByCategory.tickets.filter(e => e.categoryClassifier === ticket.classifier.category.name)

                    expect(filteredByClassifier).toHaveLength(TICKET_STATUS_TYPES.length)
                    expect(filteredByClassifier.some(e => e.count === 1)).toBeTruthy()
                })
            })
        })
        describe('Payment', () => {
            it('should return sum for selected period of completed payments', async () => {
                const [payment] = await createTestPayment(admin, organization, null, acquiringContext, {
                    status: PAYMENT_DONE_STATUS,
                    period: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                    advancedAt: dayjs().subtract(1, 'day').endOf('day').toISOString(),
                })

                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                const completedPaymentsSum = payments
                    .reduce((prev, curr) => new Big(prev).plus(curr.amount), 0)

                expect(payments).toHaveLength(2)
                expect(data.overview).toHaveProperty(['payment', 'sum'], completedPaymentsSum.toFixed(2))

                const [selectedPeriodData] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: {
                        organization: organization.id,
                        dateFrom: dayjs().subtract(1, 'day').startOf('day').toISOString(),
                        dateTo: dayjs().subtract(1, 'day').endOf('day').toISOString(),
                    },
                    groupBy: { aggregatePeriod: 'day' },
                })

                expect(selectedPeriodData.overview).toHaveProperty(['payment', 'sum'], Number(payment.amount).toFixed(2))
            })

            it('should return sum for selected period included other periods', async () => {
                const [previousMonthPayment] = await createTestPayment(admin, organization, null, acquiringContext, {
                    status: PAYMENT_DONE_STATUS,
                    period: dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
                    advancedAt: dayjs().toISOString(),
                })

                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                const completedPaymentsSum = [...payments, previousMonthPayment]
                    .reduce((prev, curr) => new Big(prev).plus(curr.amount), 0)

                expect(data.overview).toHaveProperty(['payment', 'sum'], completedPaymentsSum.toFixed(2))
            })

            it('should return total payments grouped by period and createdBy fields', async () => {
                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                const totalPaymentsSum = payments.reduce((prev, curr) => new Big(prev).plus(curr.amount), 0)

                expect(data.overview.payment.payments).toHaveLength(1)
                expect(data.overview).toHaveProperty(['payment', 'payments', '0', 'count'], '2')
                expect(data.overview).toHaveProperty(['payment', 'payments', '0', 'sum'], totalPaymentsSum.toFixed(2))
                expect(data.overview).toHaveProperty(['payment', 'payments', '0', 'createdBy'], admin.user.id)
            })
        })
        describe('Receipt', () => {
            it('should return sum for last month of created receipts', async () => {
                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                const totalReceiptsSum = receipts.reduce((prev, curr) => new Big(prev).plus(curr.charge), 0)

                expect(data.overview).toHaveProperty(['receipt', 'sum'], totalReceiptsSum.toFixed(2))
            })

            it('should return total receipts grouped by month', async () => {
                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                const totalReceiptsSum = receipts.reduce((prev, curr) => new Big(prev).plus(curr.charge), 0)

                expect(data.overview.receipt.receipts).toHaveLength(1)
                expect(data.overview).toHaveProperty(['receipt', 'receipts', '0', 'count'], '3')
                expect(data.overview).toHaveProperty(['receipt', 'receipts', '0', 'dayGroup'], dayjs().startOf('month').format('01.MM.YYYY'))
                expect(data.overview).toHaveProperty(['receipt', 'receipts', '0', 'sum'], totalReceiptsSum.toFixed(2))
            })
        })
        describe('Resident', () => {
            it('should return total residents of organization grouped by it\'s addresses', async () => {
                const [data] = await getOverviewDashboardByTestClient(organizationAdminUser, {
                    where: { organization: organization.id, dateFrom, dateTo }, groupBy: { aggregatePeriod: 'day' },
                })

                expect(data.overview.resident.residents).toHaveLength(1)
                expect(data.overview).toHaveProperty(['resident', 'residents', '0', 'count'], '1')
                expect(data.overview).toHaveProperty(['resident', 'residents', '0', 'address'], resident.address)
            })
        })
    })

    describe('Validations', () => {
        it('cannot query OverviewDashboard without organization feature provided', async () => {
            setFeatureFlag(ANALYTICS_V3, false)
            const [organization] = await createTestOrganization(admin)

            await expectToThrowGQLError(async () => {
                await getOverviewDashboardByTestClient(admin, {
                    where: { organization: organization.id, dateFrom, dateTo },
                    groupBy: { aggregatePeriod: 'day' },
                })
            }, ERRORS.FEATURE_IS_DISABLED, 'result')
        })

        it('cannot query OverviewDashboard with unsupported period type', async () => {
            await expectToThrowGraphQLRequestError(async () => {
                await getOverviewDashboardByTestClient(admin, {
                    where: { organization: organization.id, dateFrom, dateTo },
                    groupBy: { aggregatePeriod: 'year' },
                })
            }, 'got invalid value')
        })
    })
})

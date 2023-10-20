/**
 * Generated by `createservice analytics.GetOverviewDashboardService`
 */

const dayjs = require('dayjs')
const { get, isEmpty } = require('lodash')

const { GQLErrorCode: { FORBIDDEN } } = require('@open-condo/keystone/errors')
const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const { i18n } = require('@open-condo/locales/loader')

const { PAYMENT_WITHDRAWN_STATUS, PAYMENT_DONE_STATUS } = require('@condo/domains/acquiring/constants/payment')
const access = require('@condo/domains/analytics/access/GetOverviewDashboardService')
const { AnalyticsDataProvider } = require('@condo/domains/analytics/utils/services/AnalyticsDataProvider')
const { IncidentDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/incident')
const { PaymentDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/payment')
const { PropertyDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/property')
const { ReceiptDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/receipt')
const { ResidentDataLoader } = require('@condo/domains/analytics/utils/services/dataLoaders/resident')
const {
    TicketDataLoader,
    TicketQualityControlDataLoader,
} = require('@condo/domains/analytics/utils/services/dataLoaders/ticket')
const { OPERATION_FORBIDDEN } = require('@condo/domains/common/constants/errors')

const ERRORS = {
    FEATURE_IS_DISABLED: {
        code: FORBIDDEN,
        type: OPERATION_FORBIDDEN,
        message: 'Your organization do not have access to this feature',
        messageForUser: 'api.analytics.overviewDashboard.FEATURE_IS_DISABLED',
    },
}

const TICKET_REMAPPING_OPTIONS = { ticketCounts: 'tickets' }
const PERIOD_FIELD_DATE_FORMAT = 'YYYY-MM-DD'


const GetOverviewDashboardService = new GQLCustomSchema('GetOverviewDashboardService', {
    types: [
        {
            access: true,
            type: 'enum GetOverviewDashboardAggregatePeriod { day week }',
        },
        {
            access: true,
            type: 'input GetOverviewDashboardGroupByInput { aggregatePeriod: GetOverviewDashboardAggregatePeriod! }',
        },
        {
            access: true,
            type: 'input GetOverviewDashboardWhereInput { organization: String!, dateFrom: String!, dateTo: String!, propertyIds: [ID], executorIds: [ID] }',
        },
        {
            access: true,
            type: 'enum OverviewDashboardEntities { ticketByDay, ticketByProperty, ticketByCategory, ticketByExecutor, ticketQualityControlValue, payment, receipt, resident, property, incident }',
        },
        {
            access: true,
            type: 'input GetOverviewDashboardInput { dv: Int!, sender: JSON!, where: GetOverviewDashboardWhereInput!, groupBy: GetOverviewDashboardGroupByInput!, entities: [OverviewDashboardEntities] }',
        },
        {
            access: true,
            type: 'type TicketOverviewTranslations { key: String!, value: String! }',
        },
        {
            access: true,
            type: 'type TicketOverviewResult { tickets: [TicketGroupedCounter!], translations: [TicketOverviewTranslations] }',
        },
        {
            access: true,
            type: 'type PaymentGroupedCounter { count: String!, sum: String!, createdBy: ID!, dayGroup: String! }',
        },
        {
            access: true,
            type: 'type PaymentOverviewResult { payments: [PaymentGroupedCounter!], sum: String! }',
        },
        {
            access: true,
            type: 'type ReceiptGroupedCounter { count: String!, sum: String!, dayGroup: String! }',
        },
        {
            access: true,
            type: 'type ReceiptOverviewResult { receipts: [ReceiptGroupedCounter!], sum: String! }',
        },
        {
            access: true,
            type: 'type ResidentGroupedCounter { count: String!, address: String! }',
        },
        {
            access: true,
            type: 'type ResidentOverviewResult { residents: [ResidentGroupedCounter!] }',
        },
        {
            access: true,
            type: 'type PropertyOverviewResult { sum: String! }',
        },
        {
            access: true,
            type: 'type IncidentOverviewResult { count: String! }',
        },
        {
            access: true,
            type: 'type OverviewData { ticketByProperty: TicketOverviewResult, ticketByDay: TicketOverviewResult, ticketByCategory: TicketOverviewResult, ticketByExecutor: TicketOverviewResult, ticketQualityControlValue: TicketOverviewResult, payment: PaymentOverviewResult, receipt: ReceiptOverviewResult, resident: ResidentOverviewResult, property: PropertyOverviewResult, incident: IncidentOverviewResult }',
        },
        {
            access: true,
            type: 'type GetOverviewDashboardOutput { overview: OverviewData! }',
        },
    ],

    queries: [
        {
            access: access.canGetOverviewDashboard,
            schema: 'getOverviewDashboard(data: GetOverviewDashboardInput!): GetOverviewDashboardOutput',
            resolver: async (parent, args, context) => {
                const { data: { where, groupBy, entities = [] } } = args

                const ticketNullReplaces = {
                    categoryClassifier: i18n('pages.condo.analytics.TicketAnalyticsPage.NullReplaces.CategoryClassifier'),
                    executor: i18n('pages.condo.analytics.TicketAnalyticsPage.NullReplaces.Executor'),
                    assignee: i18n('pages.condo.analytics.TicketAnalyticsPage.NullReplaces.Assignee'),
                }

                const dateFilter = {
                    AND: [
                        { createdAt_gte: where.dateFrom },
                        { createdAt_lte: where.dateTo },
                    ],
                }
                const ticketWhereFilter = {
                    organization: { id: where.organization },
                    ...dateFilter,
                    deletedAt: null,
                    ...(get(where, 'propertyIds.length', 0) > 0 && { property: { id_in: where.propertyIds } }),
                    ...(get(where, 'executorIds.length', 0) > 0 && { executor: { id_in: where.executorIds } }),
                }

                const dataProvider = new AnalyticsDataProvider({
                    entities: {
                        ticketByProperty: {
                            provider: new TicketDataLoader({ context }),
                            queryOptions: {
                                where: ticketWhereFilter,
                                groupBy: ['property', 'status'],
                                nullReplaces: ticketNullReplaces,
                            },
                            remappingOptions: TICKET_REMAPPING_OPTIONS,
                        },
                        ticketByDay: {
                            provider: new TicketDataLoader({ context }),
                            queryOptions: {
                                where: ticketWhereFilter,
                                groupBy: [groupBy.aggregatePeriod, 'status'],
                                nullReplaces: ticketNullReplaces,
                            },
                            remappingOptions: TICKET_REMAPPING_OPTIONS,
                        },
                        ticketByCategory: {
                            provider: new TicketDataLoader({ context }),
                            queryOptions: {
                                where: ticketWhereFilter,
                                groupBy: ['categoryClassifier', 'status'],
                                nullReplaces: ticketNullReplaces,
                            },
                            remappingOptions: TICKET_REMAPPING_OPTIONS,
                        },
                        ticketByExecutor: {
                            provider: new TicketDataLoader({ context }),
                            queryOptions: {
                                where: ticketWhereFilter,
                                groupBy: ['executor', 'status'],
                                nullReplaces: ticketNullReplaces,
                            },
                            remappingOptions: TICKET_REMAPPING_OPTIONS,
                        },
                        ticketQualityControlValue: {
                            provider: new TicketQualityControlDataLoader({ context }),
                            queryOptions: {
                                where: ticketWhereFilter,
                                groupBy: [groupBy.aggregatePeriod, 'qualityControlComputedValue'],
                            },
                        },
                        property: {
                            provider: new PropertyDataLoader({ context }),
                            queryOptions: {
                                where: {
                                    organization: { id: where.organization },
                                    ...(get(where, 'propertyIds.length', 0) > 0 && { id_in: where.propertyIds }),
                                },
                            },
                        },
                        payment: {
                            provider: new PaymentDataLoader({ context }),
                            queryOptions: {
                                where: {
                                    organization: { id: where.organization },
                                    deletedAt: null,
                                    status_in: [PAYMENT_WITHDRAWN_STATUS, PAYMENT_DONE_STATUS],
                                    AND: [
                                        { period_gte: dayjs(where.dateFrom).startOf('month').format(PERIOD_FIELD_DATE_FORMAT) },
                                        { period_lte: dayjs(where.dateTo).endOf('month').format(PERIOD_FIELD_DATE_FORMAT) },
                                    ],
                                },
                                groupBy: ['month', 'createdBy'],
                                totalFilter: [
                                    { advancedAt_gte: dayjs(where.dateFrom).startOf('day').toISOString() },
                                    { advancedAt_lte: dayjs(where.dateTo).endOf('day').toISOString() },
                                ],
                                extraFilter: {
                                    propertyIds: where.propertyIds,
                                },
                            },
                        },
                        receipt: {
                            provider: new ReceiptDataLoader({ context }),
                            queryOptions: {
                                where: {
                                    organization: { id: where.organization },
                                    deletedAt: null,
                                    AND: [
                                        { period_gte: dayjs(where.dateFrom).startOf('month').format(PERIOD_FIELD_DATE_FORMAT) },
                                        { period_lte: dayjs(where.dateTo).endOf('month').format(PERIOD_FIELD_DATE_FORMAT) },
                                    ],
                                },
                                groupBy: ['month'],
                            },
                        },
                        resident: {
                            provider: new ResidentDataLoader({ context }),
                            queryOptions: {
                                where: {
                                    organization: { id: where.organization },
                                    deletedAt: null,
                                    ...(get(where, 'propertyIds.length', 0) > 0 && { property: { id_in: where.propertyIds } }),
                                },
                                groupBy: ['address'],
                            },
                        },
                        incident: {
                            provider: new IncidentDataLoader({ context }),
                            queryOptions: {
                                where: {
                                    organization: { id: where.organization },
                                    deletedAt: null,
                                    ...(get(where, 'propertyIds.length', 0) > 0 && { property: { id_in: where.propertyIds } }),
                                },
                            },
                        },
                    },
                })

                const overview = isEmpty(entities) ? await dataProvider.loadAll() : await dataProvider.loadSelected(entities)

                return { overview }
            },
        },
    ],
})

module.exports = {
    GetOverviewDashboardService,
    ERRORS,
}

/**
 * Generated by `createservice billing.ExportPaymentsService`
 */

const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/acquiring/access/ExportPaymentsService')
const { normalizeTimeZone } = require('@condo/domains/common/utils/timezone')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const dayjs = require('dayjs')
const { NOTHING_TO_EXPORT } = require('@condo/domains/common/constants/errors')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@core/keystone/errors')
const { createExportFile } = require('@condo/domains/common/utils/createExportFile')
const { exportPayments } = require('@condo/domains/billing/utils/serverSchema')
const { get } = require('lodash')
const { getHeadersTranslations, EXPORT_TYPE_PAYMENTS } = require('@condo/domains/common/utils/exportToExcel')
const { i18n } = require('@condo/domains/common/utils/localesLoader')
const { extractReqLocale } = require('@condo/domains/common/utils/locale')
const conf = require('@core/config')
const { checkDvSender } = require('@condo/domains/common/utils/serverSchema/validators')
const { DV_VERSION_MISMATCH, WRONG_FORMAT } = require('@condo/domains/common/constants/errors')

const DATE_FORMAT = 'DD.MM.YYYY HH:mm'

const errors = {
    DV_VERSION_MISMATCH: {
        // TODO(pahaz): mutation! cahnge
        query: 'exportPaymentsToExcel',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Wrong value for data version number',
    },
    WRONG_SENDER_FORMAT: {
        // TODO(pahaz): mutation! cahnge
        query: 'exportPaymentsToExcel',
        variable: ['data', 'sender'],
        code: BAD_USER_INPUT,
        type: WRONG_FORMAT,
        message: 'Invalid format of "sender" field value. {details}',
        correctExample: '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
    },
    NOTHING_TO_EXPORT: {
        // TODO(pahaz): mutation! cahnge
        query: 'exportPaymentsToExcel',
        code: BAD_USER_INPUT,
        type: NOTHING_TO_EXPORT,
        message: 'No payments found to export',
        messageForUser: 'api.acquiring.exportPaymentsToExcel.NOTHING_TO_EXPORT',
    },
}

const ExportPaymentsService = new GQLCustomSchema('ExportPaymentsService', {
    types: [
        {
            access: true,
            type: 'input ExportPaymentsToExcelInput { dv: Int!, sender: SenderFieldInput!, where: PaymentWhereInput!, sortBy: [SortPaymentsBy!], timeZone: String! }',
        },
        {
            access: true,
            type: 'type ExportPaymentsToExcelOutput { status: String!, linkToFile: String! }',
        },
    ],

    // TODO(pahaz): change to MUTATION!!!
    queries: [
        {
            access: access.canExportPaymentsToExcel,
            schema: 'exportPaymentsToExcel(data: ExportPaymentsToExcelInput!): ExportPaymentsToExcelOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { sender, where, sortBy, timeZone: timeZoneFromUser } = args.data

                checkDvSender(args.data, errors.DV_VERSION_MISMATCH, errors.WRONG_SENDER_FORMAT, context)
                const locale = extractReqLocale(context.req) || conf.DEFAULT_LOCALE

                const timeZone = normalizeTimeZone(timeZoneFromUser) || DEFAULT_ORGANIZATION_TIMEZONE
                const formatDate = (date) => dayjs(date).tz(timeZone).format(DATE_FORMAT)

                const objs = await exportPayments(context, { dv: 1, sender, where, sortBy })

                if (objs.length === 0) {
                    throw new GQLError(errors.NOTHING_TO_EXPORT, context)
                }

                const excelRows = objs.map(obj => {
                    return {
                        date: formatDate(obj.advancedAt),
                        account: obj.accountNumber,
                        address: get(obj, ['receipt', 'property', 'address'], ''),
                        unitName: get(obj, ['receipt', 'account', 'unitName'], ''),
                        type: get(obj, ['context', 'integration', 'name'], ''),
                        transaction: get(obj, ['multiPayment', 'transactionId'], ''),
                        status: i18n('payment.status.' + get(obj, 'status'), { locale }),
                        amount: Number(get(obj, 'amount', '')).toFixed(2),
                    }
                })

                const { url: linkToFile } = await createExportFile({
                    fileName: `payments_${dayjs().format('DD_MM')}.xlsx`,
                    templatePath: './domains/acquiring/templates/PaymentsExportTemplate.xlsx',
                    replaces: {
                        objs: excelRows,
                        i18n: {
                            ...getHeadersTranslations(EXPORT_TYPE_PAYMENTS, locale),
                            sheetName: i18n('menu.Payments', { locale }),
                        },
                    },
                    meta: {
                        listkey: 'Payment',
                        id: objs[0].id,
                    },
                })

                return { status: 'ok', linkToFile }
            },
        },
    ],

})

module.exports = {
    ExportPaymentsService,
}

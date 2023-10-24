/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */
const { Checkbox, Virtual, Select } = require('@keystonejs/fields')
const get = require('lodash/get')

const { LocalizedText } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')


const access = require('@condo/domains/organization/access/OrganizationEmployeeRole')
const { TICKET_VISIBILITY_OPTIONS, ORGANIZATION_TICKET_VISIBILITY } = require('@condo/domains/organization/constants/common')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { COUNTRY_RELATED_STATUS_TRANSITIONS } = require('@condo/domains/ticket/constants/statusTransitions')

const { Organization } = require('../utils/serverSchema')

const OrganizationEmployeeRole = new GQLListSchema('OrganizationEmployeeRole', {
    schemaDoc: 'Employee role name and access permissions',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,

        // There is no `user` reference, because Organization will have a set of pre-defined roles
        // and each employee will be associated with one of the role, not role with user.

        name: {
            type: LocalizedText,
            isRequired: true,
            template: 'employee.role.*.name',
        },
        description: {
            type: LocalizedText,
            isRequired: false,
            template: 'employee.role.*.description',
        },
        statusTransitions: {
            schemaDoc: 'Employee status transitions map',
            type: Virtual,
            graphQLReturnType: 'JSON',
            resolver: async (item, _, context) => {
                const organizationId = get(item, 'organization')
                const [organization] = await Organization.getAll(context, { id: organizationId })

                if (!organization) {
                    throw new Error('No organization found for OrganizationEmployeeRole')
                }

                const organizationCountry = get(organization, 'country', 'en')
                return COUNTRY_RELATED_STATUS_TRANSITIONS[organizationCountry]
            },
        },

        canManageOrganization: { type: Checkbox, defaultValue: false },
        canReadEmployees: { type: Checkbox, defaultValue: true },
        canManageEmployees: { type: Checkbox, defaultValue: false },
        canManageRoles: { type: Checkbox, defaultValue: false },
        canManageIntegrations: { type: Checkbox, defaultValue: false },
        canReadProperties: { type: Checkbox, defaultValue: true },
        canManageProperties: { type: Checkbox, defaultValue: false },
        canReadTickets: { type: Checkbox, defaultValue: true },
        canManageTickets: { type: Checkbox, defaultValue: false },
        canManageMeters: { type: Checkbox, defaultValue: true },
        canManageMeterReadings: { type: Checkbox, defaultValue: true },
        canReadContacts: { type: Checkbox, defaultValue: true },
        canManageContacts: { type: Checkbox, defaultValue: false },
        canManageContactRoles: { type: Checkbox, defaultValue: false },
        canManageTicketComments: { type: Checkbox, defaultValue: true },
        canShareTickets: { type: Checkbox, defaultValue: true },
        canReadBillingReceipts: { type: Checkbox, defaultValue: false },
        canImportBillingReceipts: { type: Checkbox, defaultValue: false },
        canReadPayments: { type: Checkbox, defaultValue: false },
        canInviteNewOrganizationEmployees: { type: Checkbox, defaultValue: false },
        canBeAssignedAsResponsible: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as responsible',
            type: Checkbox,
            defaultValue: true,
        },
        canBeAssignedAsExecutor: {
            schemaDoc: 'Allows employees with this role to be assigned to tickets as executor',
            type: Checkbox,
            defaultValue: true,
        },
        canManageTicketPropertyHints: {
            type: Checkbox,
            defaultValue: false,
        },
        ticketVisibilityType: {
            schemaDoc: `Which tickets the employee sees:
                        1) organization - sees all tickets in the organization.
                        2) property - Sees tickets in PropertyScope that have this employee
                        3) propertyAndSpecialization - Sees tickets by employee specialization + PropertyScope
                        4) assigned - sees only those tickets in which he is the executor or responsible
                        `,
            type: Select,
            dataType: 'string',
            isRequired: true,
            defaultOption: ORGANIZATION_TICKET_VISIBILITY,
            options: TICKET_VISIBILITY_OPTIONS,
        },
        canManagePropertyScopes: { type: Checkbox, defaultValue: false },
        canManageBankAccounts: { type: Checkbox, defaultValue: false },
        canManageBankAccountReportTasks: { type: Checkbox, defaultValue: false },
        canManageBankIntegrationAccountContexts: { type: Checkbox, defaultValue: false },
        canManageBankIntegrationOrganizationContexts: { type: Checkbox, defaultValue: false },
        canManageBankContractorAccounts: { type: Checkbox, defaultValue: false },
        canManageBankTransactions: { type: Checkbox, defaultValue: false },
        canManageBankAccountReports: { type: Checkbox, defaultValue: false },
        canReadIncidents: { type: Checkbox, defaultValue: true },
        canManageIncidents: { type: Checkbox, defaultValue: false },
        canReadNewsItems: { type: Checkbox, defaultValue: false },
        canManageNewsItems: { type: Checkbox, defaultValue: false },
        canManageNewsItemTemplates: { type: Checkbox, defaultValue: false },
        canManageCallRecords: { type: Checkbox, defaultValue: false },
        canDownloadCallRecords: { type: Checkbox, defaultValue: false },
        canManageMobileFeatureConfigs: { type: Checkbox, defaultValue: false },
        canManageB2BApps: { type: Checkbox, defaultValue: false },
        canReadAnalytics: { type: Checkbox, defaultValue: false },
        canReadInvoiceContexts: { type: Checkbox, defaultValue: false },
        canManageInvoiceContexts: { type: Checkbox, defaultValue: false },
        canReadInvoices: { type: Checkbox, defaultValue: false },
        canManageInvoices: { type: Checkbox, defaultValue: false },
        canReadMarketItems: { type: Checkbox, defaultValue: false },
        canManageMarketItems: { type: Checkbox, defaultValue: false },
        canReadMeters: { type: Checkbox, defaultValue: true },
        canReadSettings: { type: Checkbox, defaultValue: true },
        canReadExternalReports: { type: Checkbox, defaultValue: true },
        canReadServices: { type: Checkbox, defaultValue: true },
        canReadCallRecords: { type: Checkbox, defaultValue: true },
    },
    plugins: [uuided(), versioned(), tracked(), dvAndSender(), historical()],
    access: {
        read: access.canReadOrganizationEmployeeRoles,
        create: access.canManageOrganizationEmployeeRoles,
        update: access.canManageOrganizationEmployeeRoles,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    OrganizationEmployeeRole,
}

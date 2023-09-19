/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 */

/**
 * Payment categories meta used as a temporary, but somewhat generic solution
 * to the problem of differentiating billing and acquiring on mobile device
 *
 * Problem:
 *
 * Our system might have a generic default billing, that is enabled by default
 * for all Residents. In Russia this billing is SBER UPS (СБЕР ЕПС)
 *
 * Our system might also have an organization specific billing,
 * that is disabled by default and should be enabled manually.
 * An example in Russia: dom.gosuslugi.ru billing.
 *
 * Same goes for the acquiring: you have the default and org-specific
 *
 * Billing or Acquiring can also be toggled based on the payment category. For example:
 * - Cold Water: use default billing and default acquiring
 * - Housing Payment: use dom.gosuslugi.ru billing and SBER acquiring
 *
 * Depending on a chosen billing mobile app uses different screens and
 * different flow.
 *
 * Condo-Api should have a way to tell mobile app which billing or acquiring it
 * should use per payment category
 *
 * --
 *
 * Current solution
 *
 * A hardcoded constant that is planned to move to separate model in the future.
 *
 * Model PaymentCategory {
 *     id: ID
 *     name: str                             - Name of the category to pay for: Cold Water, Housing Payment, Bill
 *     canGetBillingFromOrganization: bool   - Whether or not to get billing from organization. If set to false, then default billing is used
 *     canGetAcquiringFromOrganization: bool - see canGetBillingFromOrganization field description
 * }
 *
 * todo: @toplenboren - when we sort this out on business side, move this hardcode to the model!
 * todo: @toplenboren - don't forget to add i18n when this hardcode is moved to model!
 */
const PAYMENT_CATEGORIES_META = [
    {
        id: '1',
        active: true,
        name: 'Квартплата',
        key: 'billing.category.housing.name',
        uuid: '928c97ef-5289-4daa-b80e-4b9fed50c629',
        canGetBillingFromOrganization: true,
        canGetAcquiringFromOrganization: true,
    },
    {
        id: '2',
        active: false,
        name: 'Интернет, ТВ, домашний телефон',
        key: 'billing.category.internet.name',
        uuid: '11bb27ce-3f11-40f2-8fdf-f6aa1364df08',
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '3',
        name: 'Электричество',
        key: 'billing.category.electricity.name',
        uuid: '9c29b499-6594-4479-a2a7-b6553587d6e2',
        active: true,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '4',
        name: 'Газ',
        key: 'billing.category.gas.name',
        uuid: '40053ebf-7a67-4b9d-8637-a6f398ad7d3c',
        active: true,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '5',
        name: 'ХВС',
        key: 'billing.category.cold_water.name',
        uuid: 'b84acc8b-ee9d-401c-bde6-75a284d84789',
        active: true,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '6',
        name: 'Отопление и ГВС',
        key: 'billing.category.heating_hot_water.name',
        uuid: 'ebf9524e-b5ad-44ef-9343-01ab6147d400',
        active: true,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '7',
        name: 'ТКО',
        key: 'billing.category.trash.name',
        uuid: '182998d2-ed32-4b1a-8876-982f7e7eb645',
        active: true,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '8',
        name: 'Охрана и домофон',
        key: 'billing.category.intercom.name',
        uuid: 'fff4549a-8abc-42d1-b888-93ffd49a7366',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '9',
        name: 'Капремонт',
        key: 'billing.category.repair.name',
        uuid: 'c0b9db6a-c351-4bf4-aa35-8e5a500d0195',
        active: true,
        canGetBillingFromOrganization: true,
        canGetAcquiringFromOrganization: true,
    },
    {
        id: '10',
        name: 'Дача',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '11',
        name: 'Страхование',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '12',
        name: 'Техническое обслуживание',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '13',
        name: 'Прочие услуги',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
    {
        id: '14',
        name: 'Квартплата пеня',
        active: false,
        canGetBillingFromOrganization: false,
        canGetAcquiringFromOrganization: false,
    },
]

const RESIDENT_DISCOVER_CONSUMERS_WINDOW_SEC = 24 * 60 * 60 // seconds
const MAX_RESIDENT_DISCOVER_CONSUMERS_BY_WINDOW_SEC = 10

module.exports = {
    PAYMENT_CATEGORIES_META,
    RESIDENT_DISCOVER_CONSUMERS_WINDOW_SEC,
    MAX_RESIDENT_DISCOVER_CONSUMERS_BY_WINDOW_SEC,
}

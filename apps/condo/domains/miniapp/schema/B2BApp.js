/**
 * Generated by `createschema miniapp.B2BApp 'name:Text;'`
 */

const { Text, Select, Relationship, Checkbox } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')
const access = require('@condo/domains/miniapp/access/B2BApp')
const {
    B2B_APP_CATEGORIES,
    OTHER_CATEGORY,
    GLOBAL_APP_NO_APP_URL_ERROR,
    NON_GLOBAL_APP_WITH_FEATURES_ERROR,
} = require('@condo/domains/miniapp/constants')
const { GALLERY_FIELD } = require('@condo/domains/miniapp/schema/fields/galleryField')
const { GLOBAL_FEATURES_FIELD } = require('@condo/domains/miniapp/schema/fields/globalFeaturesField')
const {
    LOGO_FIELD,
    APPS_FILE_ADAPTER,
    SHORT_DESCRIPTION_FIELD,
    DEVELOPER_FIELD,
    PARTNER_URL_FIELD,
    APP_DETAILS_FIELD,
    IFRAME_URL_FIELD,
    IS_HIDDEN_FIELD,
    CONTEXT_DEFAULT_STATUS_FIELD,
    LABEL_FIELD,
    DISPLAY_PRIORITY_FIELD,
    PRICE_FIELD,
    ICON_FIELD,
    MENU_CATEGORY_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')

const logoMetaAfterChange = getFileMetaAfterChange(APPS_FILE_ADAPTER, 'logo')

const B2BApp = new GQLListSchema('B2BApp', {
    schemaDoc: 'B2B app',
    fields: {
        name: {
            schemaDoc: 'Name of B2B App',
            type: Text,
            isRequired: true,
        },
        logo: LOGO_FIELD,
        shortDescription: SHORT_DESCRIPTION_FIELD,
        developer: DEVELOPER_FIELD,
        partnerUrl: PARTNER_URL_FIELD,
        detailedDescription: APP_DETAILS_FIELD,
        appUrl: IFRAME_URL_FIELD,
        isHidden: IS_HIDDEN_FIELD,
        isGlobal: {
            schemaDoc: 'Indicates whether the app is global or not. If so, then the application will be opened in hidden mode and receive various notifications from the condo. It\'s also possible to trigger some condo IFrame methods via global app outside of miniapps CRM section',
            type: Checkbox,
            defaultValue: false,
            isRequired: true,
        },
        icon: ICON_FIELD,
        menuCategory: MENU_CATEGORY_FIELD,
        contextDefaultStatus: CONTEXT_DEFAULT_STATUS_FIELD,
        category: {
            schemaDoc: `Category of app. Can be one of the following: [${B2B_APP_CATEGORIES.map(category => `"${category}"`).join(', ')}] By default set to "${OTHER_CATEGORY}"`,
            type: Select,
            dataType: 'string',
            isRequired: true,
            options: B2B_APP_CATEGORIES,
            defaultValue: OTHER_CATEGORY,
        },
        accessRights: {
            schemaDoc: 'Specifies set of service users, who can access app\'s contexts related as well as perform actions on behalf of the application',
            type: Relationship,
            ref: 'B2BAppAccessRight.app',
            many: true,
            access: { create: false, update: false },
        },
        features: GLOBAL_FEATURES_FIELD,
        displayPriority: DISPLAY_PRIORITY_FIELD,
        label: LABEL_FIELD,
        gallery: GALLERY_FIELD,
        price: PRICE_FIELD,
    },
    hooks: {
        resolveInput: ({ resolvedData, operation }) => {
            if (operation === 'update' && resolvedData.hasOwnProperty('isGlobal') && !resolvedData.isGlobal) {
                resolvedData['features'] = null
            }
            
            return resolvedData
        },
        validateInput: ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            if (newItem.isGlobal) {
                if (!newItem.appUrl) {
                    return addValidationError(GLOBAL_APP_NO_APP_URL_ERROR)
                }
            } else {
                if (newItem.features) {
                    return addValidationError(NON_GLOBAL_APP_WITH_FEATURES_ERROR)
                }
            }
        },
        afterChange: logoMetaAfterChange,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadB2BApps,
        create: access.canManageB2BApps,
        update: access.canManageB2BApps,
        delete: false,
        auth: true,
    },
})

module.exports = {
    B2BApp,
}

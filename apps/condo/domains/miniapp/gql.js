/**
 * Generated by `createservice miniapp.AllOrganizationAppsService --type queries`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const APP_FIELDS = '{ id name shortDescription connected type category logo }'
 
const ALL_MINI_APPS_QUERY = gql`
    query getAllMiniApps ($data: AllMiniAppsInput!) {
        objs: allMiniApps (data: $data) ${APP_FIELDS}
    }
`

const B2B_APP_FIELDS = `{ name logo { publicUrl } shortDescription about developer partnerUrl instruction appUrl category setupButtonMessage features ${COMMON_FIELDS} }`
const B2BApp = generateGqlQueries('B2BApp', B2B_APP_FIELDS)

const B2B_APP_CONTEXT_FIELDS = `{ app { id } organization { id } status ${COMMON_FIELDS} }`
const B2BAppContext = generateGqlQueries('B2BAppContext', B2B_APP_CONTEXT_FIELDS)

const B2B_APP_ACCESS_RIGHT_FIELDS = `{ app { id } user { id } ${COMMON_FIELDS} }`
const B2BAppAccessRight = generateGqlQueries('B2BAppAccessRight', B2B_APP_ACCESS_RIGHT_FIELDS)

const B2C_APP_FIELDS = `{ name isHidden colorSchema { main secondary } currentBuild { id } ${COMMON_FIELDS} }`
const B2CApp = generateGqlQueries('B2CApp', B2C_APP_FIELDS)

const B2C_APP_ACCESS_RIGHT_FIELDS = `{ user { id } app { id } ${COMMON_FIELDS} }`
const B2CAppAccessRight = generateGqlQueries('B2CAppAccessRight', B2C_APP_ACCESS_RIGHT_FIELDS)

const B2C_APP_BUILD_FIELDS = `{ app { id } version ${COMMON_FIELDS} }`
const B2CAppBuild = generateGqlQueries('B2CAppBuild', B2C_APP_BUILD_FIELDS)

const B2C_APP_PROPERTY_FIELDS = `{ app { id } address ${COMMON_FIELDS} }`
const B2CAppProperty = generateGqlQueries('B2CAppProperty', B2C_APP_PROPERTY_FIELDS)

const B2B_APP_PROMO_BLOCK_FIELDS = `{ title subtitle textVariant backgroundColor backgroundImage { publicUrl } targetUrl priority ${COMMON_FIELDS} }`
const B2BAppPromoBlock = generateGqlQueries('B2BAppPromoBlock', B2B_APP_PROMO_BLOCK_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    ALL_MINI_APPS_QUERY,
    B2BApp,
    B2BAppContext,
    B2BAppAccessRight,
    B2CApp,
    B2CAppAccessRight,
    B2CAppBuild,
    B2CAppProperty,
    B2BAppPromoBlock,
/* AUTOGENERATE MARKER <EXPORTS> */
}

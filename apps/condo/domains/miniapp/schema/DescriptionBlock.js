/**
 * Generated by `createschema miniapp.DescriptionBlock 'description:Text; image:File;'`
 */

const { Text, Relationship, Integer } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/miniapp/access/DescriptionBlock')
const { APP_IMAGE_FIELD } = require('@condo/domains/miniapp/schema/fields/integration')
const { WRONG_AMOUNT_OF_BLOCK_ERROR } = require('@condo/domains/miniapp/constants')
const get = require('lodash/get')

const RELATION_FIELDS = ['billingIntegration', 'acquiringIntegration']

const ONE_OF_ALL_MESSAGE = `Note that one of the following fields are required: [${RELATION_FIELDS.join(', ')}]`


const DescriptionBlock = new GQLListSchema('DescriptionBlock', {
    schemaDoc: 'Block of text and image used to represent miniapp features on it\'s description page',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        title: {
            schemaDoc: 'Title of a feature',
            type: Text,
            isRequired: true,
        },

        description: {
            schemaDoc: 'Text describing a feature',
            type: Text,
            isRequired: true,
        },

        image: {
            ...APP_IMAGE_FIELD,
            schemaDoc: 'Image representing a feature',
        },

        order: {
            schemaDoc: 'Order of block. Default value is 0. The higher the number, the further the block is from the start.',
            type: Integer,
            defaultValue: 0,
            isRequired: false,
        },

        billingIntegration: {
            schemaDoc: `Link to billing integration. ${ONE_OF_ALL_MESSAGE}`,
            type: Relationship,
            ref: 'BillingIntegration.descriptionBlocks',
            isRequired: false,
        },

        acquiringIntegration: {
            schemaDoc: `Link to acquiring integration. ${ONE_OF_ALL_MESSAGE}`,
            type: Relationship,
            ref: 'AcquiringIntegration.descriptionBlocks',
            isRequired: false,
        },

    },
    hooks: {
        validateInput: async ({ existingItem, resolvedData, addValidationError }) => {
            const newItem = { ...existingItem, ...resolvedData }

            const linkedIntegrations = RELATION_FIELDS.filter(field => Boolean(get(newItem, field))).length

            if (linkedIntegrations !== 1) {
                return addValidationError(`${WRONG_AMOUNT_OF_BLOCK_ERROR} ${RELATION_FIELDS.join(', ')}, but got ${linkedIntegrations}`)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadDescriptionBlocks,
        create: access.canManageDescriptionBlocks,
        update: access.canManageDescriptionBlocks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    DescriptionBlock,
}

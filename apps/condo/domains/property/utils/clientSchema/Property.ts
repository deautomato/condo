/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Property as PropertyGQL } from '@condo/domains/property/gql'
import { Property, PropertyUpdateInput, QueryAllPropertiesArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'organization', 'name', 'address', 'addressMeta', 'type', 'map', 'ticketsInWork', 'ticketsClosed', 'unitsCount']
const RELATIONS = ['organization']

export interface IPropertyUIState extends Property {
    id: string
    address: string
    ticketsInWork: string
    ticketsClosed: string
    unitsCount: string
}

function convertToUIState (item: Property): IPropertyUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IPropertyUIState
}

export interface IPropertyFormState {
    id?: undefined
    type?: string
    organization?: string
    name?: string
    address?: string,
    map?: JSON,
    // address: string,
    // TODO(codegen): write IPropertyUIFormState or extends it from
}

function convertToUIFormState (state: IPropertyUIState): IPropertyFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IPropertyFormState
}

function convertToGQLInput (state: IPropertyFormState): PropertyUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

function extractAttributes (state: IPropertyUIState, attributes: Array<string>): IPropertyUIState | undefined {
    const result = {}
    attributes.forEach((attribute) => {
        if (RELATIONS.includes(attribute)) {
            result[attribute] = get(state, [attribute, 'name'])
        } else {
            result[attribute] = get(state, attribute)
        }
    })
    return result as IPropertyUIState
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<Property, PropertyUpdateInput, IPropertyFormState, IPropertyUIState, QueryAllPropertiesArgs>(PropertyGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
    extractAttributes,
}

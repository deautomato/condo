/**
 * Generated by `createschema ticket.IncidentChange 'incident:Relationship:Incident:CASCADE;'`
 */

import {
    IncidentChange,
    IncidentChangeCreateInput,
    IncidentChangeUpdateInput,
    QueryAllIncidentChangesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@open-condo/codegen/generate.hooks'
import { IncidentChange as IncidentChangeGQL } from '@condo/domains/ticket/gql'

// TODO(codegen): write utils like convertToFormState and formValuesProcessor if needed, otherwise delete this TODO

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<IncidentChange, IncidentChangeCreateInput, IncidentChangeUpdateInput, QueryAllIncidentChangesArgs>(IncidentChangeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}

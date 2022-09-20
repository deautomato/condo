/**
 * Generated by `createschema scope.PropertyScopeOrganizationEmployee 'propertyScope:Relationship:PropertyScope:CASCADE; employee:Relationship:OrganizationEmployee:CASCADE;'`
 */

import {
    PropertyScopeOrganizationEmployee,
    PropertyScopeOrganizationEmployeeCreateInput,
    PropertyScopeOrganizationEmployeeUpdateInput,
    QueryAllPropertyScopeOrganizationEmployeesArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { PropertyScopeOrganizationEmployee as PropertyScopeOrganizationEmployeeGQL } from '@condo/domains/scope/gql'

// TODO(codegen): write utils like convertToFormState and formValuesProcessor if needed, otherwise delete this TODO

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<PropertyScopeOrganizationEmployee, PropertyScopeOrganizationEmployeeCreateInput, PropertyScopeOrganizationEmployeeUpdateInput, QueryAllPropertyScopeOrganizationEmployeesArgs>(PropertyScopeOrganizationEmployeeGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}

/**
 * Generated by `createschema ticket.TicketOrganizationSetting 'organization:Relationship:Organization:CASCADE; defaultDeadline?:Integer; paidDeadline?:Integer; emergencyDeadline?:Integer; warrantyDeadline?:Integer;'`
 */

import {
    TicketOrganizationSetting,
    TicketOrganizationSettingCreateInput,
    TicketOrganizationSettingUpdateInput,
    QueryAllTicketOrganizationSettingsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'
import { TicketOrganizationSetting as TicketOrganizationSettingGQL } from '@condo/domains/ticket/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketOrganizationSetting, TicketOrganizationSettingCreateInput, TicketOrganizationSettingUpdateInput, QueryAllTicketOrganizationSettingsArgs>(TicketOrganizationSettingGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}

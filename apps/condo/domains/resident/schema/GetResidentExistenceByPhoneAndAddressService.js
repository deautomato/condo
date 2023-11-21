/**
 * Generated by `createservice resident.GetResidentExistenceByPhoneAndAddressService --type queries`
 */
const { GQLCustomSchema, find } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/resident/access/GetResidentExistenceByPhoneAndAddressService')
const { RESIDENT } = require('@condo/domains/user/constants/common')


const GetResidentExistenceByPhoneAndAddressService = new GQLCustomSchema('GetResidentExistenceByPhoneAndAddressService', {
    types: [
        {
            access: true,
            type: 'input GetResidentExistenceByPhoneAndAddressInput { dv: Int!, sender: SenderFieldInput!, phone: String!, propertyId: ID!, unitName: String!, unitType: BuildingUnitSubType! }',
        },
        {
            access: true,
            type: 'type GetResidentExistenceByPhoneAndAddressOutput { hasResident: Boolean!, hasResidentOnAddress: Boolean! }',
        },
    ],
    
    queries: [
        {
            access: access.canGetResidentExistenceByPhoneAndAddress,
            schema: 'getResidentExistenceByPhoneAndAddress (data: GetResidentExistenceByPhoneAndAddressInput!): GetResidentExistenceByPhoneAndAddressOutput',
            resolver: async (parent, args) => {
                const { data: { phone, propertyId, unitName, unitType } } = args

                const userResidents = await find('Resident', {
                    user: { phone, type: RESIDENT, deletedAt: null },
                    deletedAt: null,
                })

                if (userResidents.length === 0) {
                    return { hasResident: false, hasResidentOnAddress: false }
                }

                const residentOnAddress = userResidents.find(resident =>
                    resident.property === propertyId &&
                    resident.unitName === unitName &&
                    resident.unitType === unitType
                )

                return { hasResident: true, hasResidentOnAddress: Boolean(residentOnAddress) }
            },
        },
    ],
    
})

module.exports = {
    GetResidentExistenceByPhoneAndAddressService,
}
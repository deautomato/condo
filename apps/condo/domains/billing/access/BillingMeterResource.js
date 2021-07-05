/**
 * Generated by `createschema billing.BillingMeterResource 'name:Text'`
 */

async function canReadBillingMeterResources ({ authentication: { item: user } }) {
    return !!user
}

async function canManageBillingMeterResources ({ authentication: { item: user } }) {
    return (user && (user.isAdmin || user.isSupport)) ||
        { context: { integration: { accessRights_some: { user: { id: user.id } } } } }
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingMeterResources,
    canManageBillingMeterResources,
}

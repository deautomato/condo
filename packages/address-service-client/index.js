const conf = require('@condo/config')
const { AddressServiceClient } = require('@condo/address-service-client/AddressServiceClient')
const { MockedAddressServiceClient } = require('@condo/address-service-client/MockedAddressServiceClient')

let instance

/**
 * Singleton. Returns the client instance
 * @param {string} url The URL of the address service
 * @param {AddressServiceParams?} params
 * @returns {AddressServiceClient}
 */
function createInstance (url, params) {
    if (!instance) {
        instance = new AddressServiceClient(url, params)
    }

    return instance
}

function createTestInstance (existingItem = null) {
    // In the case of testing, we must return a new instance every time because all tests have a unique context.
    return new MockedAddressServiceClient(existingItem)
}

module.exports = { createInstance, createTestInstance }
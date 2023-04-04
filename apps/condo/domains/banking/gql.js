/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { gql } = require('graphql-tag')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')

const COMMON_FIELDS = 'id dv sender { dv fingerprint } v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const BANK_CATEGORY_FIELDS = `{ name ${COMMON_FIELDS} }`
const BankCategory = generateGqlQueries('BankCategory', BANK_CATEGORY_FIELDS)

// TODO(antonal): maybe we can avoid querying related BankCategory for each BankCostItem. For example, keep whole list of BankCategory in React Context and pull categories from it when needed
const BANK_COST_ITEM_FIELDS = `{ name isOutcome category { id name } ${COMMON_FIELDS} }`
const BankCostItem = generateGqlQueries('BankCostItem', BANK_COST_ITEM_FIELDS)

const BANK_INTEGRATION_FIELDS = `{ name ${COMMON_FIELDS} }`
const BankIntegration = generateGqlQueries('BankIntegration', BANK_INTEGRATION_FIELDS)

const BANK_ACCOUNT_FIELDS = `{ organization { id } integrationContext { id enabled integration ${BANK_INTEGRATION_FIELDS} } tin country routingNumber number currencyCode approvedAt approvedBy { id name } importId territoryCode bankName meta reportVisible ${COMMON_FIELDS} }`
const BankAccount = generateGqlQueries('BankAccount', BANK_ACCOUNT_FIELDS)

const BANK_CONTRACTOR_ACCOUNT_FIELDS = `{ name organization { id } costItem { id category { id name } } tin country routingNumber number currencyCode importId territoryCode bankName meta relatedTransactions ${COMMON_FIELDS} }`
const BankContractorAccount = generateGqlQueries('BankContractorAccount', BANK_CONTRACTOR_ACCOUNT_FIELDS)

const BANK_INTEGRATION_ACCOUNT_CONTEXT_FIELDS = `{ integration { id } organization { id } enabled meta ${COMMON_FIELDS} }`
const BankIntegrationAccountContext = generateGqlQueries('BankIntegrationAccountContext', BANK_INTEGRATION_ACCOUNT_CONTEXT_FIELDS)

const BANK_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS = `{ integration { id } organization { id, deletedAt } deletedAt ${COMMON_FIELDS} }`
const BankIntegrationOrganizationContext = generateGqlQueries('BankIntegrationOrganizationContext', BANK_INTEGRATION_ORGANIZATION_CONTEXT_FIELDS)

const BANK_TRANSACTION_FIELDS = `{ account { id number } contractorAccount { id name costItem { id } } costItem { id } integrationContext { id enabled } organization { id } number date amount isOutcome currencyCode purpose meta importId importRemoteSystem ${COMMON_FIELDS} }`
const BankTransaction = generateGqlQueries('BankTransaction', BANK_TRANSACTION_FIELDS)

const BANK_SYNC_TASK_FIELDS = `{ account { id } integrationContext { id } organization { id } property { id } status file { id originalFilename publicUrl mimetype } user { id } totalCount processedCount meta ${COMMON_FIELDS} }`
const BankSyncTask = generateGqlQueries('BankSyncTask', BANK_SYNC_TASK_FIELDS)

const BANK_INTEGRATION_ACCESS_RIGHT_FIELDS = `{ integration { id } user { id } ${COMMON_FIELDS} }`
const BankIntegrationAccessRight = generateGqlQueries('BankIntegrationAccessRight', BANK_INTEGRATION_ACCESS_RIGHT_FIELDS)

const CREATE_BANK_ACCOUNT_REQUEST_MUTATION = gql`
    mutation createBankAccountRequest ($data: CreateBankAccountRequestInput!) {
        result: createBankAccountRequest(data: $data) { status id }
    }
`

const IMPORT_BANK_TRANSACTIONS_MUTATION = gql`
    mutation importBankTransactions ($data: ImportBankTransactionsInput!) {
        result: importBankTransactions(data: $data) { bankAccount ${BANK_ACCOUNT_FIELDS} }
    }
`

const PREDICT_TRANSACTION_CLASSIFICATION_QUERY = gql`
    query predictTransactionClassification ($data: PredictTransactionClassificationInput!) {
        result: predictTransactionClassification(data: $data) { id name isOutcome category }
    }
`

const BANK_ACCOUNT_REPORT_FIELDS = `{ account { id } organization { id } version template period amount amountAt publishedAt totalIncome totalOutcome data ${COMMON_FIELDS} }`
const BankAccountReport = generateGqlQueries('BankAccountReport', BANK_ACCOUNT_REPORT_FIELDS)

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BankAccount,
    BankCategory,
    BankCostItem,
    BankContractorAccount,
    BankIntegration,
    BankIntegrationAccessRight,
    BankIntegrationAccountContext,
    BankIntegrationOrganizationContext,
    BankTransaction,
    BankSyncTask,
    CREATE_BANK_ACCOUNT_REQUEST_MUTATION,
    IMPORT_BANK_TRANSACTIONS_MUTATION,
    PREDICT_TRANSACTION_CLASSIFICATION_QUERY,
    BankAccountReport,
/* AUTOGENERATE MARKER <EXPORTS> */
}

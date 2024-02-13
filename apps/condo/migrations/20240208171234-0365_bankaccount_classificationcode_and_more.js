// auto generated by kmigrator
// KMIGRATOR:0365_bankaccount_classificationcode_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi45IG9uIDIwMjQtMDItMDggMTQ6MTIKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzNjRfbWFya2V0cHJpY2VzY29wZV90eXBlX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiYW5rYWNjb3VudCcsCiAgICAgICAgICAgIG5hbWU9J2NsYXNzaWZpY2F0aW9uQ29kZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JhbmthY2NvdW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NsYXNzaWZpY2F0aW9uQ29kZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JpbGxpbmdyZWNpcGllbnQnLAogICAgICAgICAgICBuYW1lPSdjbGFzc2lmaWNhdGlvbkNvZGUnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5ncmVjaXBpZW50aGlzdG9yeXJlY29yZCcsCiAgICAgICAgICAgIG5hbWU9J2NsYXNzaWZpY2F0aW9uQ29kZScsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field classificationCode to bankaccount
--
ALTER TABLE "BankAccount" ADD COLUMN "classificationCode" text NULL;
--
-- Add field classificationCode to bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" ADD COLUMN "classificationCode" text NULL;
--
-- Add field classificationCode to billingrecipient
--
ALTER TABLE "BillingRecipient" ADD COLUMN "classificationCode" text NULL;
--
-- Add field classificationCode to billingrecipienthistoryrecord
--
ALTER TABLE "BillingRecipientHistoryRecord" ADD COLUMN "classificationCode" text NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field classificationCode to billingrecipienthistoryrecord
--
ALTER TABLE "BillingRecipientHistoryRecord" DROP COLUMN "classificationCode" CASCADE;
--
-- Add field classificationCode to billingrecipient
--
ALTER TABLE "BillingRecipient" DROP COLUMN "classificationCode" CASCADE;
--
-- Add field classificationCode to bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" DROP COLUMN "classificationCode" CASCADE;
--
-- Add field classificationCode to bankaccount
--
ALTER TABLE "BankAccount" DROP COLUMN "classificationCode" CASCADE;
COMMIT;

    `)
}

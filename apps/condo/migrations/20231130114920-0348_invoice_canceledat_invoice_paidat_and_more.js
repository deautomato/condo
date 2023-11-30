// auto generated by kmigrator
// KMIGRATOR:0348_invoice_canceledat_invoice_paidat_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMi40IG9uIDIwMjMtMTEtMzAgMDY6NDkKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAzNDdfbWVyZ2VfMjAyMzExMjlfMTA0MCcpLAogICAgXQoKICAgIG9wZXJhdGlvbnMgPSBbCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0naW52b2ljZScsCiAgICAgICAgICAgIG5hbWU9J2NhbmNlbGVkQXQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0naW52b2ljZScsCiAgICAgICAgICAgIG5hbWU9J3BhaWRBdCcsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdpbnZvaWNlJywKICAgICAgICAgICAgbmFtZT0ncHVibGlzaGVkQXQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BZGRGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0naW52b2ljZWhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjYW5jZWxlZEF0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2ludm9pY2VoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncGFpZEF0JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2ludm9pY2VoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ncHVibGlzaGVkQXQnLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpLAogICAgICAgICksCiAgICBdCg==

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field canceledAt to invoice
--
ALTER TABLE "Invoice" ADD COLUMN "canceledAt" timestamp with time zone NULL;
--
-- Add field paidAt to invoice
--
ALTER TABLE "Invoice" ADD COLUMN "paidAt" timestamp with time zone NULL;
--
-- Add field publishedAt to invoice
--
ALTER TABLE "Invoice" ADD COLUMN "publishedAt" timestamp with time zone NULL;
--
-- Add field canceledAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" ADD COLUMN "canceledAt" timestamp with time zone NULL;
--
-- Add field paidAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" ADD COLUMN "paidAt" timestamp with time zone NULL;
--
-- Add field publishedAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" ADD COLUMN "publishedAt" timestamp with time zone NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field publishedAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" DROP COLUMN "publishedAt" CASCADE;
--
-- Add field paidAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" DROP COLUMN "paidAt" CASCADE;
--
-- Add field canceledAt to invoicehistoryrecord
--
ALTER TABLE "InvoiceHistoryRecord" DROP COLUMN "canceledAt" CASCADE;
--
-- Add field publishedAt to invoice
--
ALTER TABLE "Invoice" DROP COLUMN "publishedAt" CASCADE;
--
-- Add field paidAt to invoice
--
ALTER TABLE "Invoice" DROP COLUMN "paidAt" CASCADE;
--
-- Add field canceledAt to invoice
--
ALTER TABLE "Invoice" DROP COLUMN "canceledAt" CASCADE;
COMMIT;

    `)
}

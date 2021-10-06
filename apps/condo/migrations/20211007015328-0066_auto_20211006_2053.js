// auto generated by kmigrator
// KMIGRATOR:0066_auto_20211006_2053:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi40IG9uIDIwMjEtMTAtMDYgMjA6NTMKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAwNjVfYXV0b18yMDIxMTAwMV8wMzM0JyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5ncmVjZWlwdCcsCiAgICAgICAgICAgIG5hbWU9J2NvbW1pc3Npb24nLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGVjaW1hbEZpZWxkKGJsYW5rPVRydWUsIGRlY2ltYWxfcGxhY2VzPTIsIG1heF9kaWdpdHM9MTgsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5ncmVjZWlwdGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdjb21taXNzaW9uJywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRlY2ltYWxGaWVsZChibGFuaz1UcnVlLCBkZWNpbWFsX3BsYWNlcz00LCBtYXhfZGlnaXRzPTE4LCBudWxsPVRydWUpLAogICAgICAgICksCiAgICAgICAgbWlncmF0aW9ucy5BbHRlckZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiaWxsaW5ncmVjZWlwdCcsCiAgICAgICAgICAgIG5hbWU9J3RvUGF5JywKICAgICAgICAgICAgZmllbGQ9bW9kZWxzLkRlY2ltYWxGaWVsZChkZWNpbWFsX3BsYWNlcz0yLCBtYXhfZGlnaXRzPTE4KSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWx0ZXJGaWVsZCgKICAgICAgICAgICAgbW9kZWxfbmFtZT0nYmlsbGluZ3JlY2VpcHRoaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgbmFtZT0ndG9QYXknLAogICAgICAgICAgICBmaWVsZD1tb2RlbHMuRGVjaW1hbEZpZWxkKGJsYW5rPVRydWUsIGRlY2ltYWxfcGxhY2VzPTQsIG1heF9kaWdpdHM9MTgsIG51bGw9VHJ1ZSksCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field commission to billingreceipt
--
ALTER TABLE "BillingReceipt" ADD COLUMN "commission" numeric(18, 2) NULL;
--
-- Add field commission to billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" ADD COLUMN "commission" numeric(18, 4) NULL;
--
-- Alter field toPay on billingreceipt
--
ALTER TABLE "BillingReceipt" ALTER COLUMN "toPay" TYPE numeric(18, 2) USING "toPay"::numeric(18, 2);
--
-- Alter field toPay on billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" ALTER COLUMN "toPay" TYPE numeric(18, 4) USING "toPay"::numeric(18, 4);
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Alter field toPay on billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" ALTER COLUMN "toPay" TYPE text USING "toPay"::text;
--
-- Alter field toPay on billingreceipt
--
ALTER TABLE "BillingReceipt" ALTER COLUMN "toPay" TYPE text USING "toPay"::text;
--
-- Add field commission to billingreceipthistoryrecord
--
ALTER TABLE "BillingReceiptHistoryRecord" DROP COLUMN "commission" CASCADE;
--
-- Add field commission to billingreceipt
--
ALTER TABLE "BillingReceipt" DROP COLUMN "commission" CASCADE;
COMMIT;

    `)
}

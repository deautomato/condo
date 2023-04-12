// auto generated by kmigrator
// KMIGRATOR:0256_remove_bankaccount_reportvisible_and_more:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDQuMCBvbiAyMDIzLTA0LTEyIDA2OjAzCgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucwoKCmNsYXNzIE1pZ3JhdGlvbihtaWdyYXRpb25zLk1pZ3JhdGlvbik6CgogICAgZGVwZW5kZW5jaWVzID0gWwogICAgICAgICgnX2RqYW5nb19zY2hlbWEnLCAnMDI1NV9hdXRvXzIwMjMwNDExXzEzMDYnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuUmVtb3ZlRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2JhbmthY2NvdW50JywKICAgICAgICAgICAgbmFtZT0ncmVwb3J0VmlzaWJsZScsCiAgICAgICAgKSwKICAgICAgICBtaWdyYXRpb25zLlJlbW92ZUZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiYW5rYWNjb3VudGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdyZXBvcnRWaXNpYmxlJywKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field reportVisible from bankaccount
--
ALTER TABLE "BankAccount" DROP COLUMN "reportVisible" CASCADE;
--
-- Remove field reportVisible from bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" DROP COLUMN "reportVisible" CASCADE;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Remove field reportVisible from bankaccounthistoryrecord
--
ALTER TABLE "BankAccountHistoryRecord" ADD COLUMN "reportVisible" boolean NULL;
--
-- Remove field reportVisible from bankaccount
--
ALTER TABLE "BankAccount" ADD COLUMN "reportVisible" boolean default false NOT NULL;
COMMIT;

    `)
}

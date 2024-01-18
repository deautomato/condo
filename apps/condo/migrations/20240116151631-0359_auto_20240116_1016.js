// auto generated by kmigrator
// KMIGRATOR:0359_auto_20240116_1016:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMSBvbiAyMDI0LTAxLTE2IDEwOjE2Cgpmcm9tIGRqYW5nby5kYiBpbXBvcnQgbWlncmF0aW9ucywgbW9kZWxzCgoKY2xhc3MgTWlncmF0aW9uKG1pZ3JhdGlvbnMuTWlncmF0aW9uKToKCiAgICBkZXBlbmRlbmNpZXMgPSBbCiAgICAgICAgKCdfZGphbmdvX3NjaGVtYScsICcwMzU4X3RlbGVncmFtdXNlcmNoYXRoaXN0b3J5cmVjb3JkX2FuZF9tb3JlJyksCiAgICBdCgogICAgb3BlcmF0aW9ucyA9IFsKICAgICAgICBtaWdyYXRpb25zLkFkZEZpZWxkKAogICAgICAgICAgICBtb2RlbF9uYW1lPSdiMmJhcHAnLAogICAgICAgICAgICBuYW1lPSdpc1B1YmxpYycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoZGVmYXVsdD1UcnVlKSwKICAgICAgICAgICAgcHJlc2VydmVfZGVmYXVsdD1GYWxzZSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQWRkRmllbGQoCiAgICAgICAgICAgIG1vZGVsX25hbWU9J2IyYmFwcGhpc3RvcnlyZWNvcmQnLAogICAgICAgICAgICBuYW1lPSdpc1B1YmxpYycsCiAgICAgICAgICAgIGZpZWxkPW1vZGVscy5Cb29sZWFuRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSwKICAgICAgICApLAogICAgXQo=

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field isPublic to b2bapp
--
ALTER TABLE "B2BApp" ADD COLUMN "isPublic" boolean DEFAULT true NOT NULL;
ALTER TABLE "B2BApp" ALTER COLUMN "isPublic" DROP DEFAULT;
--
-- Add field isPublic to b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" ADD COLUMN "isPublic" boolean NULL;
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Add field isPublic to b2bapphistoryrecord
--
ALTER TABLE "B2BAppHistoryRecord" DROP COLUMN "isPublic" CASCADE;
--
-- Add field isPublic to b2bapp
--
ALTER TABLE "B2BApp" DROP COLUMN "isPublic" CASCADE;
COMMIT;

    `)
}

// auto generated by kmigrator
// KMIGRATOR:0154_ticketexporttask_ticketexporttaskhistoryrecord:IyBHZW5lcmF0ZWQgYnkgRGphbmdvIDMuMi45IG9uIDIwMjItMDctMjIgMTU6NTQKCmZyb20gZGphbmdvLmRiIGltcG9ydCBtaWdyYXRpb25zLCBtb2RlbHMKaW1wb3J0IGRqYW5nby5kYi5tb2RlbHMuZGVsZXRpb24KCgpjbGFzcyBNaWdyYXRpb24obWlncmF0aW9ucy5NaWdyYXRpb24pOgoKICAgIGRlcGVuZGVuY2llcyA9IFsKICAgICAgICAoJ19kamFuZ29fc2NoZW1hJywgJzAxNTNfcmVtb3ZlX3RpY2tldF9wbGFjZWNsYXNzaWZpZXJfYW5kX21vcmUnKSwKICAgIF0KCiAgICBvcGVyYXRpb25zID0gWwogICAgICAgIG1pZ3JhdGlvbnMuQ3JlYXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J3RpY2tldGV4cG9ydHRhc2toaXN0b3J5cmVjb3JkJywKICAgICAgICAgICAgZmllbGRzPVsKICAgICAgICAgICAgICAgICgnc3RhdHVzJywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZm9ybWF0JywgbW9kZWxzLlRleHRGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnZXhwb3J0ZWRSZWNvcmRzQ291bnQnLCBtb2RlbHMuSW50ZWdlckZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd0b3RhbFJlY29yZHNDb3VudCcsIG1vZGVscy5JbnRlZ2VyRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2ZpbGUnLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdtZXRhJywgbW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnd2hlcmUnLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdzb3J0QnknLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdsb2NhbGUnLCBtb2RlbHMuVGV4dEZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd0aW1lWm9uZScsIG1vZGVscy5UZXh0RmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3VzZXInLCBtb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdpZCcsIG1vZGVscy5VVUlERmllbGQocHJpbWFyeV9rZXk9VHJ1ZSwgc2VyaWFsaXplPUZhbHNlKSksCiAgICAgICAgICAgICAgICAoJ3YnLCBtb2RlbHMuSW50ZWdlckZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdjcmVhdGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgndXBkYXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRCeScsIG1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRCeScsIG1vZGVscy5VVUlERmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2RlbGV0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCduZXdJZCcsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ2R2JywgbW9kZWxzLkludGVnZXJGaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnc2VuZGVyJywgbW9kZWxzLkpTT05GaWVsZChibGFuaz1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnaGlzdG9yeV9kYXRlJywgbW9kZWxzLkRhdGVUaW1lRmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ2hpc3RvcnlfYWN0aW9uJywgbW9kZWxzLkNoYXJGaWVsZChjaG9pY2VzPVsoJ2MnLCAnYycpLCAoJ3UnLCAndScpLCAoJ2QnLCAnZCcpXSwgbWF4X2xlbmd0aD01MCkpLAogICAgICAgICAgICAgICAgKCdoaXN0b3J5X2lkJywgbW9kZWxzLlVVSURGaWVsZChkYl9pbmRleD1UcnVlKSksCiAgICAgICAgICAgIF0sCiAgICAgICAgICAgIG9wdGlvbnM9ewogICAgICAgICAgICAgICAgJ2RiX3RhYmxlJzogJ1RpY2tldEV4cG9ydFRhc2tIaXN0b3J5UmVjb3JkJywKICAgICAgICAgICAgfSwKICAgICAgICApLAogICAgICAgIG1pZ3JhdGlvbnMuQ3JlYXRlTW9kZWwoCiAgICAgICAgICAgIG5hbWU9J3RpY2tldGV4cG9ydHRhc2snLAogICAgICAgICAgICBmaWVsZHM9WwogICAgICAgICAgICAgICAgKCdzdGF0dXMnLCBtb2RlbHMuQ2hhckZpZWxkKGNob2ljZXM9WygncHJvY2Vzc2luZycsICdwcm9jZXNzaW5nJyksICgnY29tcGxldGVkJywgJ2NvbXBsZXRlZCcpLCAoJ2Vycm9yJywgJ2Vycm9yJyldLCBtYXhfbGVuZ3RoPTUwKSksCiAgICAgICAgICAgICAgICAoJ2Zvcm1hdCcsIG1vZGVscy5DaGFyRmllbGQoY2hvaWNlcz1bKCdleGNlbCcsICdleGNlbCcpXSwgbWF4X2xlbmd0aD01MCkpLAogICAgICAgICAgICAgICAgKCdleHBvcnRlZFJlY29yZHNDb3VudCcsIG1vZGVscy5JbnRlZ2VyRmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ3RvdGFsUmVjb3Jkc0NvdW50JywgbW9kZWxzLkludGVnZXJGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnZmlsZScsIG1vZGVscy5KU09ORmllbGQoYmxhbms9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ21ldGEnLCBtb2RlbHMuSlNPTkZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCd3aGVyZScsIG1vZGVscy5KU09ORmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ3NvcnRCeScsIG1vZGVscy5KU09ORmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ2xvY2FsZScsIG1vZGVscy5UZXh0RmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ3RpbWVab25lJywgbW9kZWxzLlRleHRGaWVsZCgpKSwKICAgICAgICAgICAgICAgICgnaWQnLCBtb2RlbHMuVVVJREZpZWxkKHByaW1hcnlfa2V5PVRydWUsIHNlcmlhbGl6ZT1GYWxzZSkpLAogICAgICAgICAgICAgICAgKCd2JywgbW9kZWxzLkludGVnZXJGaWVsZChkZWZhdWx0PTEpKSwKICAgICAgICAgICAgICAgICgnY3JlYXRlZEF0JywgbW9kZWxzLkRhdGVUaW1lRmllbGQoYmxhbms9VHJ1ZSwgZGJfaW5kZXg9VHJ1ZSwgbnVsbD1UcnVlKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRBdCcsIG1vZGVscy5EYXRlVGltZUZpZWxkKGJsYW5rPVRydWUsIGRiX2luZGV4PVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdkZWxldGVkQXQnLCBtb2RlbHMuRGF0ZVRpbWVGaWVsZChibGFuaz1UcnVlLCBkYl9pbmRleD1UcnVlLCBudWxsPVRydWUpKSwKICAgICAgICAgICAgICAgICgnbmV3SWQnLCBtb2RlbHMuVVVJREZpZWxkKGJsYW5rPVRydWUsIG51bGw9VHJ1ZSkpLAogICAgICAgICAgICAgICAgKCdkdicsIG1vZGVscy5JbnRlZ2VyRmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ3NlbmRlcicsIG1vZGVscy5KU09ORmllbGQoKSksCiAgICAgICAgICAgICAgICAoJ2NyZWF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0nY3JlYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ3VwZGF0ZWRCeScsIG1vZGVscy5Gb3JlaWduS2V5KGJsYW5rPVRydWUsIGRiX2NvbHVtbj0ndXBkYXRlZEJ5JywgbnVsbD1UcnVlLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5TRVRfTlVMTCwgcmVsYXRlZF9uYW1lPScrJywgdG89J19kamFuZ29fc2NoZW1hLnVzZXInKSksCiAgICAgICAgICAgICAgICAoJ3VzZXInLCBtb2RlbHMuRm9yZWlnbktleShkYl9jb2x1bW49J3VzZXInLCBvbl9kZWxldGU9ZGphbmdvLmRiLm1vZGVscy5kZWxldGlvbi5DQVNDQURFLCByZWxhdGVkX25hbWU9JysnLCB0bz0nX2RqYW5nb19zY2hlbWEudXNlcicpKSwKICAgICAgICAgICAgXSwKICAgICAgICAgICAgb3B0aW9ucz17CiAgICAgICAgICAgICAgICAnZGJfdGFibGUnOiAnVGlja2V0RXhwb3J0VGFzaycsCiAgICAgICAgICAgIH0sCiAgICAgICAgKSwKICAgIF0K

exports.up = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model ticketexporttaskhistoryrecord
--
CREATE TABLE "TicketExportTaskHistoryRecord" ("status" text NULL, "format" text NULL, "exportedRecordsCount" integer NULL, "totalRecordsCount" integer NULL, "file" jsonb NULL, "meta" jsonb NULL, "where" jsonb NULL, "sortBy" jsonb NULL, "locale" text NULL, "timeZone" text NULL, "user" uuid NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "deletedAt" timestamp with time zone NULL, "newId" jsonb NULL, "dv" integer NULL, "sender" jsonb NULL, "history_date" timestamp with time zone NOT NULL, "history_action" varchar(50) NOT NULL, "history_id" uuid NOT NULL);
--
-- Create model ticketexporttask
--
CREATE TABLE "TicketExportTask" ("status" varchar(50) NOT NULL, "format" varchar(50) NOT NULL, "exportedRecordsCount" integer NOT NULL, "totalRecordsCount" integer NOT NULL, "file" jsonb NULL, "meta" jsonb NULL, "where" jsonb NOT NULL, "sortBy" jsonb NOT NULL, "locale" text NOT NULL, "timeZone" text NOT NULL, "id" uuid NOT NULL PRIMARY KEY, "v" integer NOT NULL, "createdAt" timestamp with time zone NULL, "updatedAt" timestamp with time zone NULL, "deletedAt" timestamp with time zone NULL, "newId" uuid NULL, "dv" integer NOT NULL, "sender" jsonb NOT NULL, "createdBy" uuid NULL, "updatedBy" uuid NULL, "user" uuid NOT NULL);
CREATE INDEX "TicketExportTaskHistoryRecord_history_id_a334f5a3" ON "TicketExportTaskHistoryRecord" ("history_id");
ALTER TABLE "TicketExportTask" ADD CONSTRAINT "TicketExportTask_createdBy_6c99ab1c_fk_User_id" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "TicketExportTask" ADD CONSTRAINT "TicketExportTask_updatedBy_d43aaff2_fk_User_id" FOREIGN KEY ("updatedBy") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "TicketExportTask" ADD CONSTRAINT "TicketExportTask_user_0b3acac6_fk_User_id" FOREIGN KEY ("user") REFERENCES "User" ("id") DEFERRABLE INITIALLY DEFERRED;
CREATE INDEX "TicketExportTask_createdAt_46357933" ON "TicketExportTask" ("createdAt");
CREATE INDEX "TicketExportTask_updatedAt_401f99ac" ON "TicketExportTask" ("updatedAt");
CREATE INDEX "TicketExportTask_deletedAt_c58b007c" ON "TicketExportTask" ("deletedAt");
CREATE INDEX "TicketExportTask_createdBy_6c99ab1c" ON "TicketExportTask" ("createdBy");
CREATE INDEX "TicketExportTask_updatedBy_d43aaff2" ON "TicketExportTask" ("updatedBy");
CREATE INDEX "TicketExportTask_user_0b3acac6" ON "TicketExportTask" ("user");
COMMIT;

    `)
}

exports.down = async (knex) => {
    await knex.raw(`
    BEGIN;
--
-- Create model ticketexporttask
--
DROP TABLE "TicketExportTask" CASCADE;
--
-- Create model ticketexporttaskhistoryrecord
--
DROP TABLE "TicketExportTaskHistoryRecord" CASCADE;
COMMIT;

    `)
}

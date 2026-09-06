-- Existing accounts should not receive a newly introduced onboarding prompt.
ALTER TABLE "users" ADD COLUMN "notification_onboarding_seen" boolean DEFAULT true NOT NULL;
ALTER TABLE "users" ALTER COLUMN "notification_onboarding_seen" SET DEFAULT false;

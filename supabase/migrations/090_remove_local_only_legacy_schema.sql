-- Remove the 22 legacy tables already absent from hosted Supabase. Historical
-- migrations remain immutable. Every drop is scoped and RESTRICTed so an
-- unexpected dependency aborts this migration.

do $$
declare object record;
begin
  for object in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array[
      'appointment_notification_log','appointment_reminders','appointment_requests',
      'campaign_clicks','campaign_opens','campaign_recipients','email_campaigns','email_templates',
      'loyalty_redemptions','loyalty_points','loyalty_points_config','referral_credit_usage',
      'referral_transactions','customer_referrals','product_category_mappings','product_categories',
      'product_waitlist','saved_addresses','waitlist_campaign_recipients','waitlist_campaigns',
      'payment_attempts','webhook_events'
    ])
  loop execute format('drop policy %I on %I.%I', object.policyname, object.schemaname, object.tablename); end loop;
  for object in
    select distinct event_object_schema as schemaname, event_object_table as tablename, trigger_name
    from information_schema.triggers where event_object_schema = 'public' and event_object_table = any(array[
      'appointment_notification_log','appointment_reminders','appointment_requests',
      'campaign_clicks','campaign_opens','campaign_recipients','email_campaigns','email_templates',
      'loyalty_redemptions','loyalty_points','loyalty_points_config','referral_credit_usage',
      'referral_transactions','customer_referrals','product_category_mappings','product_categories',
      'product_waitlist','saved_addresses','waitlist_campaign_recipients','waitlist_campaigns',
      'payment_attempts','webhook_events'
    ])
  loop execute format('drop trigger %I on %I.%I', object.trigger_name, object.schemaname, object.tablename); end loop;
end $$;

drop function if exists public.check_appointment_conflict() restrict;
drop function if exists public.check_daily_limit() restrict;
drop function if exists public.validate_business_hours() restrict;
drop function if exists public.update_appointment_notification_sent() restrict;
drop function if exists public.cleanup_old_webhook_events() restrict;
drop function if exists public.get_user_loyalty_balance(uuid) restrict;
drop function if exists public.update_product_categories_timestamp() restrict;
drop function if exists public.update_product_waitlist_timestamp() restrict;
drop function if exists public.update_saved_addresses_timestamp() restrict;
drop function if exists public.update_waitlist_campaigns_timestamp() restrict;
drop function if exists public.update_waitlist_campaign_recipients_timestamp() restrict;
drop view if exists public.loyalty_points_balance restrict;

drop table if exists public.appointment_notification_log restrict;
drop table if exists public.appointment_reminders restrict;
drop table if exists public.appointment_requests restrict;
drop table if exists public.campaign_clicks restrict;
drop table if exists public.campaign_opens restrict;
drop table if exists public.campaign_recipients restrict;
drop table if exists public.email_campaigns restrict;
drop table if exists public.email_templates restrict;
drop table if exists public.loyalty_redemptions restrict;
drop table if exists public.loyalty_points restrict;
drop table if exists public.loyalty_points_config restrict;
drop table if exists public.referral_credit_usage restrict;
drop table if exists public.referral_transactions restrict;
drop table if exists public.customer_referrals restrict;
drop table if exists public.product_category_mappings restrict;
drop table if exists public.product_categories restrict;
drop table if exists public.product_waitlist restrict;
drop table if exists public.saved_addresses restrict;
drop table if exists public.waitlist_campaign_recipients restrict;
drop table if exists public.waitlist_campaigns restrict;
drop table if exists public.payment_attempts restrict;
drop table if exists public.webhook_events restrict;
drop type if exists public.appointment_status restrict;

-- Remove the retired marketplace and commerce contract. Child relations,
-- views, and functions are removed before parents. RESTRICT is intentional:
-- retained or unknown dependencies must stop review rather than cascade.

do $$
declare object record;
begin
  for object in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array[
      'review_reports','review_votes','template_reviews','template_purchases','product_similarities',
      'product_interactions','coupon_usage','user_currency_preferences','exchange_rates','payments',
      'cart_reminders','orders','quotes','reviews','marketplace_templates','template_categories',
      'coupons','currencies','stripe_customers','subscriptions','demo_items','wizard_sessions'
    ])
  loop execute format('drop policy %I on %I.%I', object.policyname, object.schemaname, object.tablename); end loop;
  for object in select distinct event_object_schema as schemaname, event_object_table as tablename, trigger_name from information_schema.triggers
    where event_object_schema = 'public' and event_object_table = any(array[
      'review_reports','review_votes','template_reviews','template_purchases','product_similarities',
      'product_interactions','coupon_usage','user_currency_preferences','exchange_rates','payments',
      'cart_reminders','orders','quotes','reviews','marketplace_templates','template_categories',
      'coupons','currencies','stripe_customers','subscriptions','demo_items','wizard_sessions'
    ])
  loop execute format('drop trigger %I on %I.%I', object.trigger_name, object.schemaname, object.tablename); end loop;
end $$;

drop view if exists public.cart_reminder_stats restrict;
drop view if exists public.featured_templates restrict;
drop view if exists public.popular_products restrict;
drop view if exists public.popular_templates restrict;
drop view if exists public.product_ratings restrict;
drop view if exists public.trending_products restrict;

drop function if exists public.apply_coupon(uuid, uuid, text, integer, integer, text) restrict;
drop function if exists public.calculate_deposit_amount(integer) restrict;
drop function if exists public.convert_currency(numeric, character varying, character varying) restrict;
drop function if exists public.create_quote_with_project_update(text, text, uuid, integer, integer, timestamptz, text) restrict;
drop function if exists public.download_template(uuid, uuid) restrict;
drop function if exists public.format_price(numeric, character varying) restrict;
drop function if exists public.generate_quote_reference() restrict;
drop function if exists public.get_product_rating(character varying) restrict;
drop function if exists public.has_pending_final_payment(uuid) restrict;
drop function if exists public.record_product_interaction(text, text, uuid, text, text, text, text) restrict;
drop function if exists public.update_coupon_timestamp() restrict;
drop function if exists public.update_currency_timestamp() restrict;
drop function if exists public.update_quotes_updated_at() restrict;
drop function if exists public.update_report_count() restrict;
drop function if exists public.update_review_timestamp() restrict;
drop function if exists public.update_template_rating() restrict;
drop function if exists public.update_template_timestamp() restrict;
drop function if exists public.validate_coupon(text, integer, integer, uuid, text, boolean) restrict;
drop function if exists public.vote_on_review(uuid, character varying, uuid, character varying) restrict;

drop table if exists public.review_reports restrict;
drop table if exists public.review_votes restrict;
drop table if exists public.template_reviews restrict;
drop table if exists public.template_purchases restrict;
drop table if exists public.product_similarities restrict;
drop table if exists public.product_interactions restrict;
drop table if exists public.coupon_usage restrict;
drop table if exists public.user_currency_preferences restrict;
drop table if exists public.exchange_rates restrict;
drop table if exists public.payments restrict;
drop table if exists public.cart_reminders restrict;
drop table if exists public.orders restrict;
drop table if exists public.quotes restrict;
drop table if exists public.reviews restrict;
drop table if exists public.marketplace_templates restrict;
drop table if exists public.template_categories restrict;
drop table if exists public.coupons restrict;
drop table if exists public.currencies restrict;
drop table if exists public.stripe_customers restrict;
drop table if exists public.subscriptions restrict;
drop table if exists public.demo_items restrict;
drop table if exists public.wizard_sessions restrict;

-- Atomic widget counters.
--
-- Both counters were previously maintained with a read-then-write from application code
-- (SELECT total_impressions -> UPDATE value + 1). Concurrent widget loads interleave, so
-- increments were silently lost under any real traffic. total_interactions was never
-- incremented at all, so the dashboard always displayed 0.
--
-- These do the arithmetic inside the UPDATE, making each increment atomic.
-- Safe to re-run.

create or replace function increment_widget_impressions(p_widget_id uuid)
returns void as $$
  update embedded_widgets
     set total_impressions = total_impressions + 1
   where id = p_widget_id;
$$ language sql security definer;

create or replace function increment_widget_interactions(p_widget_id uuid)
returns void as $$
  update embedded_widgets
     set total_interactions = total_interactions + 1
   where id = p_widget_id;
$$ language sql security definer;

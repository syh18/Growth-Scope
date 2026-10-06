-- GrowthScope: planner <-> content integration fields.
-- Run once in the Supabase SQL Editor before using the new planner upload flow.

ALTER TABLE public.contents
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS source_plan_id uuid REFERENCES public.content_plans(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS uploaded boolean NOT NULL DEFAULT true;

ALTER TABLE public.content_plans
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS uploaded boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_content_id uuid REFERENCES public.contents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contents_source_plan_id
  ON public.contents(source_plan_id);

CREATE INDEX IF NOT EXISTS idx_content_plans_linked_content_id
  ON public.content_plans(linked_content_id);

CREATE INDEX IF NOT EXISTS idx_contents_instagram_url
  ON public.contents(instagram_url);

CREATE INDEX IF NOT EXISTS idx_content_plans_instagram_url
  ON public.content_plans(instagram_url);

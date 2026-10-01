-- GrowthScope: allow workspace owners to clear cloud content/planner data.
-- Run this once in Supabase SQL Editor.

GRANT DELETE ON TABLE public.contents TO authenticated;
GRANT DELETE ON TABLE public.content_plans TO authenticated;

DROP POLICY IF EXISTS "Owners can delete workspace contents" ON public.contents;
CREATE POLICY "Owners can delete workspace contents"
ON public.contents
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(workspace_id)
);

DROP POLICY IF EXISTS "Owners can delete workspace plans" ON public.content_plans;
CREATE POLICY "Owners can delete workspace plans"
ON public.content_plans
FOR DELETE
TO authenticated
USING (
  public.is_workspace_owner(workspace_id)
);

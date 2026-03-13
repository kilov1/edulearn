-- ##############################################
-- 【部分 2】部分 1 执行成功后，执行这段，点 Run
-- ##############################################

DROP POLICY IF EXISTS "允许读取 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许插入自己的 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许更新自己的 user_info" ON public.user_info;

ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许读取 user_info" ON public.user_info FOR SELECT USING (true);
CREATE POLICY "允许插入自己的 user_info" ON public.user_info FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "允许更新自己的 user_info" ON public.user_info FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- EduLearn Supabase 初始化 - 请分 3 次执行
-- 每次只复制一个「部分」到 SQL Editor，点 Run
-- ============================================

-- ##############################################
-- 【部分 1】先执行这段，点 Run
-- ##############################################

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_info') THEN
    CREATE TABLE public.user_info (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text NOT NULL,
      nickname text,
      created_at timestamptz DEFAULT now()
    );
    RAISE NOTICE '已创建 user_info 表';
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'email') THEN
    ALTER TABLE public.user_info ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'nickname') THEN
    ALTER TABLE public.user_info ADD COLUMN nickname text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'created_at') THEN
    ALTER TABLE public.user_info ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'username') THEN
    UPDATE public.user_info SET nickname = COALESCE(nickname, username) WHERE nickname IS NULL AND username IS NOT NULL;
    UPDATE public.user_info ui SET email = au.email FROM auth.users au WHERE ui.id = au.id AND (ui.email IS NULL OR ui.email = '');
    UPDATE public.user_info SET email = id::text WHERE email IS NULL OR email = '';
    ALTER TABLE public.user_info ALTER COLUMN username DROP NOT NULL;
    ALTER TABLE public.user_info DROP COLUMN username;
  END IF;

  UPDATE public.user_info SET email = id::text WHERE email IS NULL OR email = '';
  ALTER TABLE public.user_info ALTER COLUMN email SET NOT NULL;
END $$;


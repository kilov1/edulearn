-- ============================================
-- EduLearn Supabase 完整初始化脚本
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. 检查并创建 user_info 表
-- 若表不存在则创建；若存在则添加缺失列
DO $$
BEGIN
  -- 创建表（若不存在）
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_info') THEN
    CREATE TABLE public.user_info (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text NOT NULL,
      nickname text,
      created_at timestamptz DEFAULT now()
    );
    RAISE NOTICE '已创建 user_info 表';
  ELSE
    RAISE NOTICE 'user_info 表已存在';
    -- 添加可能缺失的列
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'nickname') THEN
      ALTER TABLE public.user_info ADD COLUMN nickname text;
      RAISE NOTICE '已添加 nickname 列';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'email') THEN
      ALTER TABLE public.user_info ADD COLUMN email text;
      RAISE NOTICE '已添加 email 列';
    END IF;
  END IF;
END $$;

-- 2. 若之前有 username 列，将数据迁移到 nickname 后删除
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_info' AND column_name = 'username') THEN
    UPDATE public.user_info SET nickname = COALESCE(nickname, username) WHERE nickname IS NULL AND username IS NOT NULL;
    ALTER TABLE public.user_info DROP COLUMN username;
    RAISE NOTICE '已从 username 迁移到 nickname 并删除 username 列';
  END IF;
END $$;

-- 3. 启用 RLS
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- 4. 删除旧策略（避免重复创建报错）
DROP POLICY IF EXISTS "允许读取 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许插入自己的 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许更新自己的 user_info" ON public.user_info;

-- 5. 创建 RLS 策略
CREATE POLICY "允许读取 user_info"
  ON public.user_info FOR SELECT
  USING (true);

CREATE POLICY "允许插入自己的 user_info"
  ON public.user_info FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "允许更新自己的 user_info"
  ON public.user_info FOR UPDATE
  USING (auth.uid() = id);

-- 6. 查看当前表结构（执行后可在 Messages 中查看）
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_info'
ORDER BY ordinal_position;

# Supabase 配置说明（邮箱主账号 + 昵称）

本系统采用**邮箱作为主账号**：注册、登录、找回密码均使用邮箱。昵称在首次注册后弹窗设置，并保存在 Supabase。

---

## 一、一键初始化（推荐）

在 Supabase Dashboard → **SQL Editor** → **New query** 中，复制粘贴并执行项目根目录下的 **`supabase-init.sql`** 文件全部内容。

该脚本会：
- 检查 `user_info` 表是否存在，不存在则创建
- 若表已存在，则添加缺失的 `nickname`、`email` 列
- 若有旧的 `username` 列，会迁移到 `nickname` 后删除
- 配置 RLS 策略
- 执行结束后显示当前表结构

---

## 二、手动修改 user_info 表结构（可选）

在 **SQL Editor** 中执行以下 SQL，将表结构改为 `id, email, nickname`：

```sql
-- 若已有 user_info 表，先备份并修改结构
-- 添加 nickname 列（若不存在）
ALTER TABLE public.user_info ADD COLUMN IF NOT EXISTS nickname text;

-- 若之前有 username 列，可将 nickname 从 username 迁移后删除 username
-- UPDATE public.user_info SET nickname = username WHERE nickname IS NULL AND username IS NOT NULL;
-- ALTER TABLE public.user_info DROP COLUMN IF EXISTS username;

-- 确保 email 列存在且唯一
-- ALTER TABLE public.user_info ADD CONSTRAINT user_info_email_unique UNIQUE (email);  -- 若需要

-- 删除旧策略
DROP POLICY IF EXISTS "允许读取 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许插入自己的 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许更新自己的 user_info" ON public.user_info;

-- 启用 RLS
ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取（登录、展示用）
CREATE POLICY "允许读取 user_info"
  ON public.user_info FOR SELECT
  USING (true);

-- 允许已登录用户插入自己的记录（注册时）
CREATE POLICY "允许插入自己的 user_info"
  ON public.user_info FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 允许用户更新自己的记录（修改昵称等）
CREATE POLICY "允许更新自己的 user_info"
  ON public.user_info FOR UPDATE
  USING (auth.uid() = id);
```

**若需从零创建 user_info 表：**

```sql
CREATE TABLE IF NOT EXISTS public.user_info (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  nickname text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "允许读取 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许插入自己的 user_info" ON public.user_info;
DROP POLICY IF EXISTS "允许更新自己的 user_info" ON public.user_info;

CREATE POLICY "允许读取 user_info" ON public.user_info FOR SELECT USING (true);
CREATE POLICY "允许插入自己的 user_info" ON public.user_info FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "允许更新自己的 user_info" ON public.user_info FOR UPDATE USING (auth.uid() = id);
```

---

## 三、如何查看 Supabase 中是否有 user_info 表

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 左侧菜单 **Table Editor** → 查看是否有 `user_info` 表
4. 或在 **SQL Editor** 中执行：
   ```sql
   SELECT EXISTS (
     SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'user_info'
   );
   ```
   - 返回 `true` 表示表存在
   - 返回 `false` 表示表不存在，可执行 `supabase-init.sql` 创建

---

## 四、关闭邮箱验证

1. **Authentication** → **Providers** → **Email**
2. 关闭 **Confirm email**
3. 保存

---

## 五、部署忘记密码 Edge Function（必做）

忘记密码功能改为**无需邮箱链接**，直接输入邮箱后设置新密码。需部署 Edge Function：

1. 安装 [Supabase CLI](https://supabase.com/docs/guides/cli)
2. 在项目根目录执行：
   ```bash
   supabase login
   supabase link --project-ref 你的项目ID
   supabase functions deploy reset-password
   ```
3. 项目 ID 可在 Supabase Dashboard → Project Settings → General 中查看

若未部署该函数，忘记密码页面会提示「请求失败」。

---

## 六、流程说明

| 操作     | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 注册     | 邮箱 + 密码 → 注册成功 → 跳转首页 → **首次弹窗设置昵称**              |
| 登录     | 邮箱 + 密码 → 直接进入首页（无弹窗）                                  |
| 忘记密码 | 输入邮箱 → 设置新密码（两次输入 + 强度提示）→ 跳转登录页               |
| 个人中心 | 可修改昵称，昵称会同步到 Supabase `user_info.nickname`               |

# Supabase 配置说明

本项目的认证流程：**邮箱无需验证**，填写即可注册；**找回密码**通过注册时填写的邮箱验证后重置。

---

## 一、关闭邮箱验证（重要）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 左侧菜单 **Authentication** → **Providers** → **Email**
4. 找到 **Confirm email**，**关闭**此选项
5. 点击 **Save**

这样用户注册后无需点击邮件验证链接，填写邮箱即可完成注册并登录。

---

## 二、创建 user_info 表

1. 左侧菜单 **SQL Editor** → **New query**
2. 粘贴并执行以下 SQL：

```sql
-- 创建 user_info 表（与 auth.users 关联）
create table if not exists public.user_info (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  created_at timestamptz default now()
);

-- 启用 RLS
alter table public.user_info enable row level security;

-- 若之前已创建过策略，先删除再重建（可安全重复执行）
drop policy if exists "允许读取 user_info" on public.user_info;
drop policy if exists "允许插入自己的 user_info" on public.user_info;
drop policy if exists "允许更新自己的 user_info" on public.user_info;

-- 允许所有人读取（登录时需查 username/email）
create policy "允许读取 user_info"
  on public.user_info for select
  using (true);

-- 允许已登录用户插入自己的记录（注册时）
create policy "允许插入自己的 user_info"
  on public.user_info for insert
  with check (auth.uid() = id);

-- 允许用户更新自己的记录
create policy "允许更新自己的 user_info"
  on public.user_info for update
  using (auth.uid() = id);
```

---

## 三、配置忘记密码重定向地址

1. 左侧菜单 **Authentication** → **URL Configuration**
2. **Site URL**：填写你的站点地址，例如：
   - 本地开发：`http://localhost:3000`
   - 线上：`https://你的域名.com`
3. **Redirect URLs** 中添加（点击 Add URL）：
   - `http://localhost:3000/reset-password.html`
   - 若有线上环境：`https://你的域名/reset-password.html`
4. 点击 **Save**

---

## 四、邮箱发送配置（找回密码需发邮件）

Supabase 默认使用内置邮件服务，有发送限制。若需稳定使用找回密码功能，建议：

1. **Authentication** → **Email Templates** 中可自定义邮件模板
2. 或配置 **SMTP**：**Project Settings** → **Auth** → **SMTP Settings**，填入你的 SMTP 信息

---

## 五、流程说明

| 操作     | 说明                                                                 |
|----------|----------------------------------------------------------------------|
| 注册     | 填写用户名、邮箱、密码即可，邮箱会保存到 Supabase，无需验证         |
| 登录     | 使用用户名或邮箱 + 密码登录                                          |
| 忘记密码 | 输入注册时的邮箱，Supabase 仅对已注册邮箱发送重置链接，点击后设置新密码 |

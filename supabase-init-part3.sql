-- ##############################################
-- 【部分 3】部分 2 执行成功后，执行这段查看结果（可选）
-- ##############################################

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'user_info'
ORDER BY ordinal_position;

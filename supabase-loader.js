// Supabase 库加载器 - 支持多个 CDN 备用源
(function() {
  const CDN_SOURCES = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/@supabase/supabase-js@2',
    'https://cdn.skypack.dev/@supabase/supabase-js@2'
  ];

  let currentIndex = 0;
  let loadAttempts = 0;
  const MAX_ATTEMPTS = CDN_SOURCES.length;

  function loadSupabaseScript() {
    if (loadAttempts >= MAX_ATTEMPTS) {
      console.error('[Supabase Loader] 所有 CDN 源均加载失败');
      return;
    }

    const script = document.createElement('script');
    script.src = CDN_SOURCES[currentIndex];
    
    script.onload = function() {
      console.log(`[Supabase Loader] 成功从 ${CDN_SOURCES[currentIndex]} 加载`);
    };

    script.onerror = function() {
      console.warn(`[Supabase Loader] ${CDN_SOURCES[currentIndex]} 加载失败，尝试下一个源...`);
      loadAttempts++;
      currentIndex++;
      if (currentIndex < CDN_SOURCES.length) {
        loadSupabaseScript();
      } else {
        console.error('[Supabase Loader] 所有 CDN 源均加载失败，请检查网络连接');
      }
    };

    document.head.appendChild(script);
  }

  loadSupabaseScript();
})();

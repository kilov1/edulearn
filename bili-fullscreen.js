/**
 * B站视频网页内全屏 - 兼容桌面端与移动端（安卓/iOS）
 * 桌面端使用原生 Fullscreen API，移动端不支持时使用覆盖层模拟全屏
 */
(function () {
  "use strict";

  const OVERLAY_CLASS = "bili-overlay-fullscreen";
  const OVERLAY_ACTIVE_CLASS = "bili-overlay-active";

  function requestFullscreenCompat(el) {
    return (
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.webkitRequestFullScreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen
    );
  }

  function exitFullscreenCompat() {
    const doc = document;
    if (doc.exitFullscreen) return doc.exitFullscreen();
    if (doc.webkitExitFullscreen) return doc.webkitExitFullscreen();
    if (doc.webkitCancelFullScreen) return doc.webkitCancelFullScreen();
    if (doc.mozCancelFullScreen) return doc.mozCancelFullScreen();
    if (doc.msExitFullscreen) return doc.msExitFullscreen();
    return Promise.resolve();
  }

  function getFullscreenElement() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function isOverlayMode(el) {
    return el && el.classList.contains(OVERLAY_ACTIVE_CLASS);
  }

  window.BiliFullscreen = {
    /**
     * 进入全屏（优先原生 API，失败则用覆盖层）
     * @param {HTMLElement} wrap - 播放器包裹元素
     * @param {HTMLElement} [fullscreenBtn] - 全屏按钮，用于更新文字
     */
    enter: function (wrap, fullscreenBtn) {
      if (!wrap) return Promise.resolve();

      const req = requestFullscreenCompat(wrap);
      if (req) {
        return req.call(wrap)
          .then(function () {
            if (fullscreenBtn) fullscreenBtn.textContent = "退出全屏";
          })
          .catch(function () {
            enterOverlayMode(wrap, fullscreenBtn);
          });
      }
      enterOverlayMode(wrap, fullscreenBtn);
      return Promise.resolve();
    },

    /**
     * 退出全屏
     */
    exit: function (wrap, fullscreenBtn) {
      if (!wrap) return Promise.resolve();

      if (isOverlayMode(wrap)) {
        exitOverlayMode(wrap, fullscreenBtn);
        return Promise.resolve();
      }
      return exitFullscreenCompat().then(function () {
        if (fullscreenBtn) fullscreenBtn.textContent = "全屏";
      });
    },

    /**
     * 切换全屏状态
     */
    toggle: function (wrap, fullscreenBtn) {
      if (!wrap) return;

      if (getFullscreenElement() || isOverlayMode(wrap)) {
        this.exit(wrap, fullscreenBtn);
      } else {
        this.enter(wrap, fullscreenBtn);
      }
    },

    isActive: function (wrap) {
      return !!(getFullscreenElement() || (wrap && isOverlayMode(wrap)));
    }
  };

  function enterOverlayMode(wrap, fullscreenBtn) {
    wrap.classList.add(OVERLAY_CLASS, OVERLAY_ACTIVE_CLASS);
    document.body.classList.add("bili-overlay-body");
    if (fullscreenBtn) fullscreenBtn.textContent = "退出全屏";
    preventBodyScroll(true);
  }

  function exitOverlayMode(wrap, fullscreenBtn) {
    wrap.classList.remove(OVERLAY_CLASS, OVERLAY_ACTIVE_CLASS);
    document.body.classList.remove("bili-overlay-body");
    if (fullscreenBtn) fullscreenBtn.textContent = "全屏";
    preventBodyScroll(false);
  }

  function preventBodyScroll(lock) {
    if (lock) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
  }

  document.addEventListener("fullscreenchange", function () {
    if (!getFullscreenElement()) {
      document.body.classList.remove("bili-overlay-body");
      preventBodyScroll(false);
      document.querySelectorAll("." + OVERLAY_ACTIVE_CLASS).forEach(function (el) {
        el.classList.remove(OVERLAY_CLASS, OVERLAY_ACTIVE_CLASS);
        var btn = el.parentElement && el.parentElement.querySelector("[data-bili-fullscreen-btn]");
        if (btn) btn.textContent = "全屏";
      });
    }
  });

  document.addEventListener("webkitfullscreenchange", function () {
    if (!getFullscreenElement()) {
      document.body.classList.remove("bili-overlay-body");
      preventBodyScroll(false);
      document.querySelectorAll("." + OVERLAY_ACTIVE_CLASS).forEach(function (el) {
        el.classList.remove(OVERLAY_CLASS, OVERLAY_ACTIVE_CLASS);
        var btn = el.parentElement && el.parentElement.querySelector("[data-bili-fullscreen-btn]");
        if (btn) btn.textContent = "全屏";
      });
    }
  });
})();

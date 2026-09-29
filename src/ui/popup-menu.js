// Shared shell for the small floating popovers (download, collections,
// filter). Owns everything that used to be copy-pasted into each of them:
// one instance per id (a second tap on the same anchor closes it),
// dismissal on outside click / Escape / page scroll, and placement under the
// anchor, flipping above when it would overflow the viewport.
//
// Returns null when this call merely closed an already-open menu for the same
// anchor. Otherwise { menu, cleanup, show }: fill `menu`, then call show().
export function createPopupMenu(anchorEl, id, css) {
  const existing = document.getElementById(id);
  const reopening = existing && existing._anchor === anchorEl;
  if (existing && existing._cleanup) existing._cleanup();
  if (reopening) return null;

  const menu = document.createElement("div");
  menu.id = id;
  menu._anchor = anchorEl;
  menu.style.cssText =
    "position:fixed;z-index:100002;" + css +
    "background:#1a1a1a;border:1px solid #333;border-radius:4px;" +
    "box-shadow:0 4px 16px rgba(0,0,0,.5);padding:4px;" +
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";

  // A scroll *inside* the menu (long genre/tag or collections list) must not
  // close it; only page/panel scrolls that move the anchor away do.
  const dismiss = (e) => { if (!menu.contains(e.target)) cleanup(); };
  const onKey = (e) => { if (e.key === "Escape") cleanup(); };
  function cleanup() {
    menu.remove();
    document.removeEventListener("click", dismiss, true);
    document.removeEventListener("keydown", onKey, true);
    window.removeEventListener("scroll", dismiss, true);
  }
  menu._cleanup = cleanup;

  function show({ alignLeft = false } = {}) {
    document.body.appendChild(menu);
    const rect = anchorEl.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    let top = rect.bottom + 4;
    if (top + menuRect.height > window.innerHeight) top = Math.max(8, rect.top - menuRect.height - 4);
    const left = alignLeft ? rect.left : rect.right - menuRect.width;
    menu.style.top = top + "px";
    menu.style.left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8)) + "px";
    // Deferred so the click that opened the menu doesn't immediately close it.
    setTimeout(() => document.addEventListener("click", dismiss, true), 0);
    document.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", dismiss, true);
  }
  return { menu, cleanup, show };
}

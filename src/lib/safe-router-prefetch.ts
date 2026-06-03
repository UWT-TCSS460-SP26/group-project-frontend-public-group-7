type PrefetchRouter = {
  prefetch: (href: string) => void | Promise<void>;
};

export function safeRouterPrefetch(router: PrefetchRouter, href: string) {
  try {
    const result = router.prefetch(href);

    if (result && "catch" in result) {
      void result.catch(() => undefined);
    }
  } catch {
    // Prefetch is only a performance hint. Navigation should never depend on it.
  }
}

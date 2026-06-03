"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  type ComponentProps,
  type FocusEvent,
  type MouseEvent,
} from "react";

import { useMediaRouteLoading } from "@/components/MediaRouteLoadingProvider";
import { safeRouterPrefetch } from "@/lib/safe-router-prefetch";

type RouteLoadingLinkProps = ComponentProps<typeof Link> & {
  disableLoading?: boolean;
};

const MISSING_ROUTE_PREFIXES = ["/dashboard", "/messages", "/debug"] as const;

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function shouldShowLoading(href: RouteLoadingLinkProps["href"]) {
  const targetUrl = getInternalUrl(href);

  if (!targetUrl) {
    return false;
  }

  return (
    targetUrl.pathname !== window.location.pathname ||
    targetUrl.search !== window.location.search
  );
}

function getInternalUrl(href: RouteLoadingLinkProps["href"]) {
  if (typeof href !== "string" || typeof window === "undefined") {
    return null;
  }

  const targetUrl = new URL(href, window.location.href);

  if (targetUrl.origin !== window.location.origin) {
    return null;
  }

  return targetUrl;
}

function canPrefetchRoute(pathname: string) {
  return !MISSING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

const RouteLoadingLink = forwardRef<HTMLAnchorElement, RouteLoadingLinkProps>(
  function RouteLoadingLink(
    {
      disableLoading = false,
      href,
      onClick,
      onFocus,
      onMouseEnter,
      target,
      ...props
    },
    ref,
  ) {
    const router = useRouter();
    const { showLoadingOverlay } = useMediaRouteLoading();

    function prefetchRoute() {
      const targetUrl = getInternalUrl(href);

      if (
        !targetUrl ||
        target === "_blank" ||
        !canPrefetchRoute(targetUrl.pathname)
      ) {
        return;
      }

      safeRouterPrefetch(router, `${targetUrl.pathname}${targetUrl.search}`);
    }

    function handleFocus(event: FocusEvent<HTMLAnchorElement>) {
      onFocus?.(event);
      prefetchRoute();
    }

    function handleMouseEnter(event: MouseEvent<HTMLAnchorElement>) {
      onMouseEnter?.(event);
      prefetchRoute();
    }

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      onClick?.(event);

      if (!isPlainLeftClick(event) || target === "_blank") {
        return;
      }

      if (!disableLoading && shouldShowLoading(href)) {
        showLoadingOverlay();
      }
    }

    return (
      <Link
        {...props}
        ref={ref}
        href={href}
        target={target}
        onFocus={handleFocus}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      />
    );
  },
);

export default RouteLoadingLink;

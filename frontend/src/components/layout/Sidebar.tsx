"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/constants/routes";
import { RealtimeClock } from "./RealtimeClock";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useState, useEffect, useRef, useCallback } from "react";

const COLLAPSED_WIDTH = 72;
const EXPANDED_DEFAULT_WIDTH = 216;
const MIN_EXPANDED_WIDTH = 204;
const MAX_WIDTH = 280;
const SNAP_THRESHOLD = 144;
const ENABLE_SIDEBAR_NAV_SCROLL = true;

export function Sidebar() {
  const pathname = usePathname();
  // Intentionally try to get width immediately to reduce layout shift if possible,
  // but rely on useEffect to safely update it to avoid hydration mismatch.
  const [width, setWidth] = useState(COLLAPSED_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Delay state hydration so the first client render stays stable.
    const timeout = setTimeout(() => {
      const savedWidth = localStorage.getItem("sidebarWidth");
      if (savedWidth) {
        const parsedWidth = parseInt(savedWidth, 10);
        setWidth(parsedWidth <= SNAP_THRESHOLD ? COLLAPSED_WIDTH : parsedWidth);
      }
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sidebarWidth", width.toString());
    }
  }, [width, isMounted]);

  const isCollapsed = width <= SNAP_THRESHOLD;

  const handleToggle = () => {
    if (isCollapsed) {
      setWidth(EXPANDED_DEFAULT_WIDTH);
    } else {
      setWidth(COLLAPSED_WIDTH);
    }
  };

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      let newWidth = e.clientX - sidebarRect.left;

      if (newWidth < SNAP_THRESHOLD) {
        newWidth = COLLAPSED_WIDTH;
      } else if (newWidth < MIN_EXPANDED_WIDTH) {
        newWidth = MIN_EXPANDED_WIDTH;
      } else if (newWidth > MAX_WIDTH) {
        newWidth = MAX_WIDTH;
      }

      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${isCollapsed ? "collapsed" : "expanded"} ${isResizing || !isMounted ? "resizing" : ""}`}
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
    >
      <div
        className="sidebar-resizer"
        onMouseDown={startResizing}
        title="Drag to resize"
      />
      <button
        className="sidebar-toggle"
        onClick={handleToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <CaretRight size={22} weight="bold" /> : <CaretLeft size={22} weight="bold" />}
      </button>

      <div className="sidebar-inner">
        <div className="brand" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '6px 0' : '6px 8px 12px' }}>
          {isCollapsed ? (
            <Image src="/images/logo.png" alt="Logo" width={25} height={25} style={{ objectFit: "contain" }} />
          ) : (
            <>
              <span>TEL-U</span>
              <strong>Insight System</strong>
            </>
          )}
        </div>
        <div className={ENABLE_SIDEBAR_NAV_SCROLL ? "sidebar-nav-scroll" : "sidebar-nav-static"}>
          <nav aria-label="Main navigation">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href || pathname.startsWith(`${route.href}/`);

              return (
                <Link
                  className={`sidebar-link${isActive ? " active" : ""}${isCollapsed ? " collapsed" : ""}`}
                  href={route.href}
                  key={route.href}
                  title={isCollapsed ? route.label : undefined}
                >
                  <Icon size={isCollapsed ? 19 : 20} weight="regular" />
                  <span>{isCollapsed ? route.shortLabel || route.label : route.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <RealtimeClock isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
}

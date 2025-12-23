"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsLoggingOut(false);
    }
    router.push("/login");
  };

  // Reset button state whenever route changes, so it doesn't stick on "Saliendo..."
  useEffect(() => {
    setIsLoggingOut(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Hide navbar on login route; hooks above must always run
  if (pathname === "/login") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Alumnos y Grupos" },
    { href: "/calendar", label: "Calendario" },
    { href: "/lessons", label: "Clases" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20 gap-3 relative">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/rogalik.png"
                alt="Rogalik logo"
                width={44}
                height={44}
                priority
                className="rounded-md"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Rogalik Lessons
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="sr-only">Abrir menú</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-3 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60"
            >
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={`${isMenuOpen ? "block" : "hidden"} lg:hidden absolute right-0 top-full mt-2 z-30 w-72 max-w-[100vw]`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full block px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full px-3 py-2 rounded-md text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-60"
            >
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

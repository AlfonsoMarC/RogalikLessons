"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (pathname === "/login") return null;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { href: "/", label: "Alumnos y Grupos" },
    { href: "/calendar", label: "Calendario" },
    { href: "/lessons", label: "Clases" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📚</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Rogalik Lessons
              </span>
            </Link>
          </div>
          <div className="flex space-x-4">
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
      </div>
    </nav>
  );
}

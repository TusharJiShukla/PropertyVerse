"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Properties", path: "/AdminDashboard/property" },
    { name: "Brokers", path: "/AdminDashboard/broker" },
    { name: "Redevelopment", path: "/AdminDashboard/redevelopment" },
  ];

  return (
    <div className="min-h-screen bg-[#faeebf] p-6">
      <nav className="flex gap-4 mb-6 flex-wrap">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path || (pathname === "/AdminDashboard" && tab.name === "Properties");
          return (
            <Link
              key={tab.name}
              href={tab.path}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                isActive
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
              }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>

      {/* Render the currently active page/tab */}
      <div className="admin-content">
        {children}
      </div>
    </div>
  );
}
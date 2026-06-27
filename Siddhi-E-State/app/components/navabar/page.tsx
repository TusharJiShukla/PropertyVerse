"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FaHome, FaHandshake, FaBalanceScale, FaHardHat } from "react-icons/fa";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileServices, setShowMobileServices] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const services = [
    {
      title: "Property Sales and Rentals",
      link: "/sale-rentals",
      icon: <FaHome className="text-xl" />,
    },
    {
      title: "Brokerage Services",
      link: "/broker",
      icon: <FaHandshake className="text-xl" />,
    },
    {
      title: "Loans & Legal",
      link: "/loans-legal",
      icon: <FaBalanceScale className="text-xl" />,
    },
    {
      title: "Redevelopment & Commercial",
      link: "/redevelopment-commercial",
      icon: <FaHardHat className="text-xl" />,
    },
  ];

  // Handle mount state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowMobileServices(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  // Prevent hydration mismatch by not rendering interactive elements until mounted
  if (!mounted) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gray-50 shadow-sm py-4`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex flex-col">
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                PropertyVerse
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                & Consultancy
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white shadow-lg py-2"
            : "bg-gray-50 shadow-sm py-4"
        }`}
        suppressHydrationWarning
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex flex-col" suppressHydrationWarning>
              <span className="text-lg font-bold text-gray-900 tracking-tight hover:text-[#d6a243] transition-colors">
                PropertyVerse
              </span>
              <span className="text-xs text-gray-500 hidden sm:block">
                & Consultancy
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`font-medium transition-colors ${
                  isActive("/")
                    ? "text-[#d6a243] border-b-2 border-[#d6a243]"
                    : "text-gray-900 hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`font-medium transition-colors ${
                  isActive("/about")
                    ? "text-[#d6a243] border-b-2 border-[#d6a243]"
                    : "text-gray-900 hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                About
              </Link>

              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button
                  className={`font-medium transition-colors ${
                    isActive("/sale-rentals") ||
                    isActive("/broker") ||
                    isActive("/loans-legal") ||
                    isActive("/redevelopment-commercial")
                      ? "text-[#d6a243]"
                      : "text-gray-900 hover:text-[#d6a243]"
                  }`}
                  suppressHydrationWarning
                >
                  Services
                </button>

                {showDropdown && (
                  <div className="absolute left-0 pt-2 w-64 z-50">
                    <div className="bg-white shadow-lg rounded-md overflow-hidden border border-gray-100">
                      {services.map((item, index) => (
                        <Link
                          key={index}
                          href={item.link}
                          className={`flex items-center gap-2 px-4 py-3 text-gray-800 hover:bg-[#f9f1dd] hover:text-[#d6a243] transition-colors ${
                            isActive(item.link) ? "bg-[#f9f1dd] text-[#d6a243]" : ""
                          }`}
                          suppressHydrationWarning
                        >
                          <span className="text-[#d6a243] flex-shrink-0">{item.icon}</span>
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/properties"
                className={`font-medium transition-colors ${
                  isActive("/properties")
                    ? "text-[#d6a243] border-b-2 border-[#d6a243]"
                    : "text-gray-900 hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                Properties
              </Link>
            </div>

            {/* Contact Button */}
            <Link
              href="/#contact"
              className="px-4 py-2 bg-[#d6a243] text-white rounded-lg hover:bg-[#b48735] transition-colors font-semibold text-sm"
              suppressHydrationWarning
            >
              Contact Us
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden bg-[#d6a243] text-white rounded-lg p-2 ml-2 focus:outline-none"
              aria-label="Toggle menu"
              suppressHydrationWarning
            >
              <span className="text-xl font-bold block w-5 h-5 flex items-center justify-center">
                {isMobileMenuOpen ? "✖" : "☰"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-20"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 z-50 md:hidden bg-white shadow-lg rounded-b-lg mx-4 overflow-hidden">
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className={`px-6 py-3 font-medium transition-colors ${
                  isActive("/")
                    ? "text-[#d6a243] bg-[#f9f1dd]"
                    : "text-gray-900 hover:bg-[#f9f1dd] hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`px-6 py-3 font-medium transition-colors ${
                  isActive("/about")
                    ? "text-[#d6a243] bg-[#f9f1dd]"
                    : "text-gray-900 hover:bg-[#f9f1dd] hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                About
              </Link>

              {/* Mobile Services Dropdown Toggle */}
              <button
                onClick={() => setShowMobileServices(!showMobileServices)}
                className={`px-6 py-3 font-medium text-left transition-colors flex items-center justify-between ${
                  isActive("/sale-rentals") ||
                  isActive("/broker") ||
                  isActive("/loans-legal") ||
                  isActive("/redevelopment-commercial")
                    ? "text-[#d6a243] bg-[#f9f1dd]"
                    : "text-gray-900 hover:bg-[#f9f1dd] hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                <span>Services</span>
                <span className="text-sm">{showMobileServices ? "▲" : "▼"}</span>
              </button>
              
              {showMobileServices && (
                <div className="bg-gray-50 ml-4 flex flex-col">
                  {services.map((item, index) => (
                    <Link
                      key={index}
                      href={item.link}
                      className={`flex items-center gap-2 px-6 py-3 text-gray-800 transition-colors ${
                        isActive(item.link)
                          ? "text-[#d6a243] bg-[#f9f1dd]"
                          : "hover:bg-[#f9f1dd] hover:text-[#d6a243]"
                      }`}
                      suppressHydrationWarning
                    >
                      <span className="text-[#d6a243] flex-shrink-0">{item.icon}</span>
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/properties"
                className={`px-6 py-3 font-medium transition-colors ${
                  isActive("/properties")
                    ? "text-[#d6a243] bg-[#f9f1dd]"
                    : "text-gray-900 hover:bg-[#f9f1dd] hover:text-[#d6a243]"
                }`}
                suppressHydrationWarning
              >
                Properties
              </Link>

              {/* Mobile Contact Button */}
              <div className="px-6 pt-2 pb-4">
                <Link
                  href="/#contact"
                  className="block w-full text-center bg-[#d6a243] text-white py-2 rounded-lg hover:bg-[#b48735] transition-colors font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                  suppressHydrationWarning
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
"use client";

import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: "About", href: "/about" },
    { name: "Services", href: "/sale-rentals" },
    { name: "Properties", href: "/properties" },
    { name: "Contact", href: "/#contact" },
  ];

  const serviceLinks = [
    { name: "Property Sales & Rentals", href: "/sale-rentals" },
    { name: "Brokerage Services", href: "/broker" },
    { name: "Loans & Legal", href: "/loans-legal" },
    { name: "Redevelopment & Commercial", href: "/redevelopment-commercial" },
  ];

  return (
    <footer className="bg-[#d6a243] text-white">
      {/* Main Footer */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">PropertyVerse</h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Your trusted partner in real estate. We help you find the perfect property 
              with expert guidance and transparent processes.
            </p>
            <div className="mt-4">
              <p className="text-sm text-white/80">
                📍 Mumbai, Maharashtra, India
              </p>
              <p className="text-sm text-white/80">
                ✉️ contact@propertyverse.com
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map((service) => (
                <li key={service.name}>
                  <Link
                    href={service.href}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 my-8"></div>

        {/* Copyright and Social Links */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/70">
            © {currentYear} PropertyVerse & Consultancy. All rights reserved.
          </p>
          
          {/* Social Links */}
          <div className="flex space-x-4">
            <a
              href="https://wa.me/918948869808"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12c0 1.93.56 3.73 1.52 5.26L2.5 21.5l4.24-1.02C8.27 21.44 10.07 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.62 0-3.12-.45-4.41-1.23l-.33-.2-2.82.68.68-2.82-.2-.33C4.45 15.12 4 13.62 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M16.34 14.34c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.28-.74 0-1.02l.28-.28c.28-.28.28-.74 0-1.02l-1.32-1.32c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.28-.74 0-1.02l.28-.28c.28-.28.28-.74 0-1.02L8.66 6.66c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.28.74 0 1.02l1.32 1.32c.28.28.74.28 1.02 0l.28-.28c.28-.28.74-.28 1.02 0l1.32 1.32c.28.28.28.74 0 1.02l-.28.28c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.28.74 0 1.02l1.32 1.32c.28.28.74.28 1.02 0l.28-.28c.28-.28.74-.28 1.02 0l1.32 1.32c.28.28.28.74 0 1.02l-.28.28c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.74.28-1.02 0l-1.32-1.32c-.28-.28-.74-.28-1.02 0l-.28.28c-.28.28-.28.74 0 1.02l1.32 1.32c.28.28.74.28 1.02 0l.28-.28c.28-.28.74-.28 1.02 0l1.32 1.32c.28.28.28.74 0 1.02l-.28.28z"/>
              </svg>
            </a>
            <a
              href="mailto:contact@propertyverse.com"
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Email"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.7 0 3.7.01 5 .07 3.3.19 4.74 1.65 4.93 4.93.06 1.3.07 2.3.07 5s-.01 3.7-.07 5c-.19 3.3-1.63 4.74-4.93 4.93-1.3.06-2.3.07-5 .07s-3.7-.01-5-.07c-3.3-.19-4.74-1.63-4.93-4.93-.06-1.3-.07-2.3-.07-5s.01-3.7.07-5c.19-3.3 1.63-4.74 4.93-4.93C8.3 2.01 9.3 2 12 2zm0 3c-2.2 0-3.3.01-4.5.07-2.2.13-3.3 1.17-3.43 3.43C4.01 9.7 4 10.8 4 12s.01 2.3.07 3.5c.13 2.2 1.23 3.3 3.43 3.43C8.7 18.99 9.8 19 12 19s2.3-.01 3.5-.07c2.2-.13 3.3-1.23 3.43-3.43.06-1.2.07-2.3.07-3.5s-.01-2.3-.07-3.5c-.13-2.2-1.23-3.3-3.43-3.43C15.3 5.01 14.2 5 12 5zm0 4.5c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5-3.5-1.57-3.5-3.5 1.57-3.5 3.5-3.5zm0 1.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
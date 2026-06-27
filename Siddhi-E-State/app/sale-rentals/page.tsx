"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/navabar/page";
import Footer from "../components/footer/page";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type Property = {
  _id: string;
  title: string;
  type: "flat" | "office" | "industrial" | "plot";
  location: string;
  city: string;
  originalPrice: number;
  discountedPrice: number;
  area: number;
  areaUnit: "sqft" | "sqm" | "acre";
  bedrooms: number;
  bathrooms: number;
  image: string;
  availability: "available" | "sold" | "pending";
  featured?: boolean;
  description?: string;
  discountPercentage?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export default function SaleRentalsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Property["type"]>("flat");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10]);
  const [locationFilter, setLocationFilter] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Fetch properties with filters
  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: ITEMS_PER_PAGE,
        sortBy: "createdAt",
        sortOrder: "desc",
        type: activeTab,
        availability: "available", // Only show available properties on public page
      };
      
      // Add price filter (convert Cr to INR)
      if (priceRange[1] > 0) {
        params.maxPrice = priceRange[1] * 10000000; // Convert Cr to INR
      }
      
      // Add location filter
      if (locationFilter) {
        params.city = locationFilter;
      }

      const response = await axios.get<ApiResponse<Property[]>>(
        `${API_BASE}/properties`,
        { params }
      );
      
      if (response.data.success && response.data.data) {
        setProperties(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages);
          setCurrentPage(response.data.meta.page);
        }
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error fetching properties", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unique cities for filter
  const fetchCities = async () => {
    try {
      const response = await axios.get<ApiResponse<string[]>>(`${API_BASE}/properties/cities`);
      if (response.data.success && response.data.data) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching cities", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProperties(1);
    fetchCities();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProperties(1);
  }, [activeTab, priceRange[1], locationFilter]);

  // Format price from INR to Crores/Lakhs
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(1)} Lac`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Calculate discount percentage
  const getDiscountPercent = (original: number, discounted: number) => {
    if (original === 0) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  // Get property type label
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      flat: "Flats",
      office: "Offices",
      industrial: "Industrial",
      plot: "Plots"
    };
    return labels[type] || type;
  };

  // Get availability badge color
  const getAvailabilityColor = (availability: string) => {
    switch(availability) {
      case "available": return "bg-green-100 text-green-700";
      case "sold": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch(availability) {
      case "available": return "Ready to Move";
      case "sold": return "Sold Out";
      case "pending": return "Booking Open";
      default: return availability;
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <div className="bg-[#f9f1dd] py-4 px-4 sm:px-6 text-gray-900">
        <Navbar />

        <div className="relative h-96 w-full mt-8">
          <Image
            src="/our-approach.png"
            alt="Hero Banner"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#d6a243]/80 flex items-center justify-center text-center px-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Discover the Perfect Property
              </h1>
              <p className="text-lg md:text-xl text-white">
                Flats, offices, plots & more — curated for your needs
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Property Type Filter */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "flat", label: "Flats" },
                    { value: "office", label: "Offices" },
                    { value: "industrial", label: "Industrial" },
                    { value: "plot", label: "Plots" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveTab(tab.value as Property["type"])}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                        activeTab === tab.value
                          ? "bg-[#d6a243] text-white"
                          : "bg-[#faeebf] text-[#d6a243] hover:bg-[#f5e6b6]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-2">
                  Max Price (in Cr.)
                </h2>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseFloat(e.target.value)])
                  }
                  className="w-full accent-[#d6a243]"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0 Cr</span>
                  <span>Up to {priceRange[1]} Cr</span>
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-2">
                  Location
                </h2>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
                >
                  <option value="">All Locations</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 mb-4">
            <p className="text-sm text-gray-600">
              Showing {properties.length} properties
              {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
            </p>
          </div>

          {/* Properties Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d6a243]"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.map((prop) => (
                  <div
                    key={prop._id}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition flex flex-col h-full"
                  >
                    <div className="relative h-48 w-full">
                      <Image
                        src={prop.image}
                        alt={prop.title}
                        fill
                        className="object-cover"
                      />
                      {/* Discount Badge */}
                      {prop.discountedPrice < prop.originalPrice && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                          {getDiscountPercent(prop.originalPrice, prop.discountedPrice)}% OFF
                        </div>
                      )}
                      {/* Availability Badge */}
                      <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded font-medium shadow-sm ${getAvailabilityColor(prop.availability)}`}>
                        {getAvailabilityLabel(prop.availability)}
                      </span>
                      {/* Featured Badge */}
                      {prop.featured && (
                        <div className="absolute bottom-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-[#d6a243] mb-1">
                        {prop.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {prop.location}, {prop.city}
                      </p>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(prop.discountedPrice)}
                          </span>
                          {prop.discountedPrice < prop.originalPrice && (
                            <span className="text-xs line-through text-gray-400 ml-2">
                              {formatPrice(prop.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {prop.area} {prop.areaUnit}
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600 mb-3">
                        {prop.type === "flat" && prop.bedrooms > 0 && (
                          <span>{prop.bedrooms} BHK</span>
                        )}
                        {prop.bathrooms > 0 && (
                          <span>{prop.bathrooms} Bath</span>
                        )}
                        <span className="capitalize">{getTypeLabel(prop.type)}</span>
                      </div>
                      <div className="mt-auto">
                        <Link
                          href={`/schedule-visit?property=${prop._id}`}
                          className="block w-full text-center bg-[#d6a243] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#bb8d2f] transition"
                        >
                          Schedule Visit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(prev - 1, 1));
                      fetchProperties(currentPage - 1);
                    }}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-[#d6a243] text-[#d6a243] rounded-md disabled:opacity-50 hover:bg-[#faeebf] transition"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(prev + 1, totalPages));
                      fetchProperties(currentPage + 1);
                    }}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-[#d6a243] text-white rounded-md disabled:opacity-50 hover:bg-[#bb8d2f] transition"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* No Results Message */}
              {properties.length === 0 && (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No properties found
                  </h3>
                  <p className="text-gray-600">Try changing your filters above.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
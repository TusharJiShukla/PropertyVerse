"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/navabar/page";
import Footer from "../components/footer/page";
import PropertyMap from "../../components/PropertyMap";
import api from "@/utils/api";

type Property = {
  _id: string;
  title: string;
  location: string;
  city?: string;
  originalPrice: number;
  discountedPrice: number;
  area: number;
  areaUnit: string;
  type: "flat" | "office" | "industrial" | "plot";
  bedrooms: number;
  bathrooms: number;
  availability: "available" | "sold" | "pending";
  image: string;
  featured?: boolean;
  description?: string;
};

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

type PropertiesContentProps = {
  initialProperties: Property[];
  initialAllProperties: Property[];
  initialCities: string[];
  initialTotalPages: number;
};

export default function PropertiesContent({ initialProperties, initialAllProperties, initialCities, initialTotalPages }: PropertiesContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isMounted = useRef(false);

  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [allProperties, setAllProperties] = useState<Property[]>(initialAllProperties);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [cities, setCities] = useState<string[]>(initialCities);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    minPrice: "",
    maxPrice: searchParams.get("max") || "",
  });

  // Fetch properties with pagination and filters
  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 6,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (filters.city) params.city = filters.city;
      if (filters.type) params.type = filters.type;
      if (filters.bedrooms) params.bedrooms = parseInt(filters.bedrooms);
      if (filters.minPrice)
        params.minPrice = parseInt(filters.minPrice) * 100000;
      if (filters.maxPrice)
        params.maxPrice = parseInt(filters.maxPrice) * 100000;

      const response = await api.get<ApiResponse<Property[]>>("/properties", {
        params,
      });

      if (response.data.success && response.data.data) {
        setProperties(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages);
          setCurrentPage(response.data.meta.page);
        }
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    
    // Update URL query parameters for Server-Side sync
    const query = new URLSearchParams();
    if (filters.city) query.append("city", filters.city);
    if (filters.type) query.append("type", filters.type);
    if (filters.bedrooms) query.append("bedrooms", filters.bedrooms);
    if (filters.minPrice) query.append("minPrice", filters.minPrice);
    if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
    
    router.replace(`/properties?${query.toString()}`, { scroll: false });
    
    fetchProperties(1);
  }, [filters]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProperties(page);
    }
  };

  // Format price in Crores/Lakhs
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

  const renderCitySection = (city: string) => {
    // ADDED: Extra safety check for city
    if (!city || city.trim() === "") return null;
    
    const cityProperties = allProperties
      .filter((p) => p.city && p.city.toLowerCase() === city.toLowerCase())
      .slice(0, 3);

    if (cityProperties.length === 0) return null;

    return (
      <div key={city} className="bg-white p-6 rounded-xl shadow mb-12">
        <h2 className="text-2xl font-bold mb-4 text-[#d6a243]">
          Properties in {city}
        </h2>
        <div className="flex gap-8 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {cityProperties.map((property, index) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white min-w-[300px] rounded-xl overflow-hidden shadow hover:shadow-lg transition relative"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              {property.originalPrice > property.discountedPrice && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                  {getDiscountPercent(
                    property.originalPrice,
                    property.discountedPrice,
                  )}
                  % OFF
                </div>
              )}
              <div
                className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded z-10 ${
                  property.availability === "available"
                    ? "bg-green-500 text-white"
                    : property.availability === "sold"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-400 text-black"
                }`}
              >
                {property.availability === "available"
                  ? "Ready to move"
                  : property.availability}
              </div>
              <div className="p-3">
                <h3 className="text-md font-semibold text-[#d6a243]">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-700">{property.location}</p>
                <p className="text-sm text-gray-700">
                  {property.area} {property.areaUnit}
                </p>
                <p className="text-sm font-semibold text-green-700">
                  {formatPrice(property.discountedPrice)}
                </p>
                <p className="text-sm text-gray-600">
                  {property.bedrooms} BHK | {property.type} |{" "}
                  {property.bathrooms} bath
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f9f1dd] text-gray-900">
      <div className="bg-[#f9f1dd] py-4 px-4 sm:px-6 text-gray-900">
        <Navbar />

        <div className="w-full h-[70vh] relative mb-20 mt-10 rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/properties-banner.png"
            alt="Properties Banner"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#d6a243]/60 flex items-center justify-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white text-center">
              Explore Our Properties
            </h1>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="max-w-5xl mx-auto mb-12 bg-white p-6 rounded-xl shadow space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#d6a243]">
              Smart Filters
            </h2>
            <div className="flex bg-gray-100 rounded-lg p-1 border">
              <button 
                onClick={() => setViewMode("list")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${viewMode === "list" ? "bg-white shadow text-[#d6a243]" : "text-gray-500 hover:text-gray-700"}`}
              >
                List View
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${viewMode === "map" ? "bg-white shadow text-[#d6a243]" : "text-gray-500 hover:text-gray-700"}`}
              >
                Map View
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <select
              name="city"
              value={filters.city}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
              suppressHydrationWarning
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
              suppressHydrationWarning
            >
              <option value="">Property Type</option>
              <option value="flat">Flat/Apartment</option>
              <option value="office">Office</option>
              <option value="industrial">Industrial</option>
              <option value="plot">Plot/Land</option>
            </select>

            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleChange}
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
              suppressHydrationWarning
            >
              <option value="">Bedrooms</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4+ BHK</option>
            </select>

            <input
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              type="number"
              placeholder="Min Price (Lacs)"
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
              suppressHydrationWarning
            />

            <input
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              type="number"
              placeholder="Max Price (Lacs)"
              className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#d6a243]"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#d6a243]"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600">
              Try adjusting your filters to find more properties.
            </p>
          </div>
        ) : viewMode === "map" ? (
          <div className="max-w-6xl mx-auto mb-20 z-0 relative">
            <PropertyMap properties={properties} />
          </div>
        ) : (
          <>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
              {properties.map((property, index) => (
                <motion.div
                  key={property._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition relative group cursor-pointer"
                >
                  <Link href={`/properties/${property._id}`} className="block h-full w-full">
                    <div className="relative h-56 w-full">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {property.originalPrice > property.discountedPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10">
                      {getDiscountPercent(
                        property.originalPrice,
                        property.discountedPrice,
                      )}
                      % OFF
                    </div>
                  )}

                  <div
                    className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded z-10 ${
                      property.availability === "available"
                        ? "bg-green-500 text-white"
                        : property.availability === "sold"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-400 text-black"
                    }`}
                  >
                    {property.availability === "available"
                      ? "Available"
                      : property.availability}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#d6a243]">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-700">
                      {property.location}
                      {property.city ? `, ${property.city}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      {property.area} {property.areaUnit}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-green-700">
                        {formatPrice(property.discountedPrice)}
                      </span>
                      {property.originalPrice > property.discountedPrice && (
                        <span className="line-through text-red-400 text-sm">
                          {formatPrice(property.originalPrice)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {property.bedrooms} BHK | {property.type} |{" "}
                      {property.bathrooms} bath
                    </p>
                    {property.featured && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        Featured
                      </span>
                    )}
                  </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4 mb-20">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-[#d6a243] text-[#d6a243] rounded-lg disabled:opacity-50 hover:bg-[#faeebf] transition"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#d6a243] text-white rounded-lg disabled:opacity-50 hover:bg-[#b48735] transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* City Sections - FIXED: Filter out null cities before mapping */}
        {cities.length > 0 && (
          <div className="max-w-6xl mx-auto">
            {cities.slice(0, 3).map((city) => renderCitySection(city))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import DashboardCard from "../../components/dashboard/DashboardCard";

type Property = {
  _id?: string;
  title: string;
  location: string;
  city: string;
  originalPrice: number;
  discountedPrice: number;
  area: number;
  areaUnit: "sqft" | "sqm" | "acre";
  type: "flat" | "office" | "industrial" | "plot";
  bedrooms: number;
  bathrooms: number;
  availability: "available" | "sold" | "pending";
  image: string;
  images?: string[];
  description?: string;
  featured?: boolean;
  yearBuilt?: number;
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Helper function to convert file to base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

interface PropertyClientProps {
  initialProperties: Property[];
  initialTotalPages: number;
  initialStats: any;
}

const AdminPropertyPage = ({ initialProperties, initialTotalPages, initialStats }: PropertyClientProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [stats, setStats] = useState<any>(initialStats);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const isMounted = useRef(false);

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Property[]>>(
        `${API_BASE}/properties?page=${page}&limit=9&sortBy=createdAt&sortOrder=desc`,
      );
      if (response.data.success && response.data.data) {
        setProperties(response.data.data);
        if (response.data.meta) {
          setTotalPages(response.data.meta.totalPages);
          setCurrentPage(response.data.meta.page);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get<ApiResponse<any>>(
        `${API_BASE}/properties/stats`,
      );
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    fetchProperties(currentPage);
    fetchStats();
  }, [currentPage]);

  const filteredProperties = properties.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this property?"))
        return;
      const response = await axios.delete<ApiResponse<any>>(
        `${API_BASE}/properties/${id}`,
      );
      if (response.data.success) {
        fetchProperties(currentPage);
        fetchStats();
        alert("Property deleted successfully");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete property");
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setImagePreview(property.image);
  };

  // Handle image file upload and convert to base64 (only file upload, no URL option)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const base64 = await convertToBase64(file);
      setImagePreview(base64);
      if (editingProperty) {
        setEditingProperty({ ...editingProperty, image: base64 });
      }
    } catch (error) {
      console.error("Error converting image:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingProperty) return;

    // Convert all numeric fields to proper numbers
    const originalPrice = Number(editingProperty.originalPrice);
    const discountedPrice = Number(editingProperty.discountedPrice);
    const area = Number(editingProperty.area);
    const bedrooms = Number(editingProperty.bedrooms);
    const bathrooms = Number(editingProperty.bathrooms);
    const yearBuilt = editingProperty.yearBuilt
      ? Number(editingProperty.yearBuilt)
      : undefined;

    console.log("=== SAVING PROPERTY ===");
    console.log(
      "Original Price:",
      originalPrice,
      "Type:",
      typeof originalPrice,
    );
    console.log(
      "Discounted Price:",
      discountedPrice,
      "Type:",
      typeof discountedPrice,
    );
    console.log("Is discounted > original?", discountedPrice > originalPrice);

    // Validation
    if (discountedPrice > originalPrice) {
      alert(
        `Discounted price (${discountedPrice}) cannot exceed original price (${originalPrice})`,
      );
      return;
    }

    if (discountedPrice < 0 || originalPrice < 0) {
      alert("Prices cannot be negative");
      return;
    }

    if (!editingProperty.image) {
      alert("Please upload an image for the property");
      return;
    }

    // Create clean object with proper number types
    const propertyToSave = {
      ...editingProperty,
      originalPrice: originalPrice,
      discountedPrice: discountedPrice,
      area: area,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      yearBuilt: yearBuilt,
    };

    console.log("Sending to backend:", JSON.stringify(propertyToSave, null, 2));

    try {
      if (editingProperty._id) {
        const response = await axios.put<ApiResponse<Property>>(
          `${API_BASE}/properties/${editingProperty._id}`,
          propertyToSave,
        );
        if (response.data.success) {
          fetchProperties(currentPage);
          fetchStats();
          alert("Property updated successfully");
          setEditingProperty(null);
          setImagePreview("");
        } else {
          alert(response.data.message || "Update failed");
        }
      } else {
        const response = await axios.post<ApiResponse<Property>>(
          `${API_BASE}/properties`,
          propertyToSave,
        );
        if (response.data.success) {
          fetchProperties(1);
          fetchStats();
          alert("Property created successfully");
          setEditingProperty(null);
          setImagePreview("");
        } else {
          alert(response.data.message || "Creation failed");
        }
      }
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMsg =
        error.response?.data?.message || error.message || "Save failed";
      alert(errorMsg);
    }
  };

  return (
    <div>
      <section>
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <DashboardCard title="Total Properties" value={stats.total || 0} />
            <DashboardCard
              title="Available"
              value={stats.byAvailability?.available || 0}
            />
            <DashboardCard
              title="Sold"
              value={stats.byAvailability?.sold || 0}
            />
            <DashboardCard
              title="Avg Price"
              value={`₹${((stats.priceStats?.avgPrice || 0) / 100000).toFixed(1)}L`}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0 bg-gradient-to-r from-yellow-50 to-red-50 px-4 py-3 rounded-md shadow-sm border border-red-100 text-amber-600">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-red-700">
              Property Management
            </h2>
            <button
              onClick={() => {
                setEditingProperty({
                  title: "",
                  location: "",
                  city: "",
                  originalPrice: 0,
                  discountedPrice: 0,
                  area: 0,
                  areaUnit: "sqft",
                  type: "flat",
                  bedrooms: 0,
                  bathrooms: 1,
                  availability: "available",
                  image: "",
                  description: "",
                  featured: false,
                });
                setImagePreview("");
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-lg font-bold shadow-md"
            >
              +
            </button>
          </div>
          <input
            type="text"
            placeholder="Search properties..."
            className="px-4 py-2 border border-yellow-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-900 bg-white placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Edit/Create Form */}
        {editingProperty && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-amber-700 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              {editingProperty._id ? "Edit Property" : "Add New Property"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title*</label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      title: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Location*
                </label>
                <input
                  type="text"
                  value={editingProperty.location}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      location: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City*</label>
                <input
                  type="text"
                  value={editingProperty.city}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      city: e.target.value,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                  placeholder="e.g., Mumbai, Delhi, Bangalore"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Property Type*
                </label>
                <select
                  value={editingProperty.type}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      type: e.target.value as any,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="flat">Flat/Apartment</option>
                  <option value="office">Office/Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="plot">Plot/Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Original Price (₹)*
                </label>
                <input
                  type="number"
                  value={editingProperty.originalPrice}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      originalPrice: Number(e.target.value),
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Discounted Price (₹)*
                </label>
                <input
                  type="number"
                  value={editingProperty.discountedPrice}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      discountedPrice: Number(e.target.value),
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Area*</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editingProperty.area}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        area: Number(e.target.value),
                      })
                    }
                    className="border px-3 py-2 rounded flex-1"
                    required
                  />
                  <select
                    value={editingProperty.areaUnit}
                    onChange={(e) =>
                      setEditingProperty({
                        ...editingProperty,
                        areaUnit: e.target.value as any,
                      })
                    }
                    className="border px-3 py-2 rounded w-24"
                  >
                    <option value="sqft">sq.ft</option>
                    <option value="sqm">sq.m</option>
                    <option value="acre">acre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bedrooms*
                </label>
                <input
                  type="number"
                  value={editingProperty.bedrooms}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      bedrooms: Number(e.target.value),
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Bathrooms
                </label>
                <input
                  type="number"
                  value={editingProperty.bathrooms}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      bathrooms: Number(e.target.value),
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Availability
                </label>
                <select
                  value={editingProperty.availability}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      availability: e.target.value as any,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={editingProperty.description || ""}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Detailed description of the property..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Year Built
                </label>
                <input
                  type="number"
                  value={editingProperty.yearBuilt || ""}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      yearBuilt: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                  placeholder="e.g., 2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Featured Property
                </label>
                <select
                  value={editingProperty.featured ? "true" : "false"}
                  onChange={(e) =>
                    setEditingProperty({
                      ...editingProperty,
                      featured: e.target.value === "true",
                    })
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>

              {/* Image Upload Section - Only file upload, like redevelopment */}
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Property Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="border px-3 py-2 rounded w-full"
                />
                {uploadingImage && (
                  <p className="text-xs text-blue-500 mt-1">
                    Processing image...
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Upload a clear image of the property (JPEG, PNG, max 5MB)
                </p>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Preview
                  </label>
                  <div className="relative w-48 h-32">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover rounded shadow border"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleSave}
                disabled={uploadingImage}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingProperty(null);
                  setImagePreview("");
                }}
                className="border border-gray-400 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {loading ? (
          <div className="text-center py-12">Loading properties...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProperties.map((p) => (
                <div
                  key={p._id}
                  className="bg-[#f9f4de] text-[#d6a243] border border-red-200 rounded-xl p-4 shadow hover:shadow-md transition"
                >
                  <div className="relative w-full h-40 mb-3">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-red-700 mb-1">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {p.location}, {p.city}
                  </p>
                  <p className="text-sm text-gray-700">
                    {p.type} • {p.bedrooms} BHK • {p.area} {p.areaUnit}
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    ₹{p.discountedPrice.toLocaleString()}{" "}
                    <span className="line-through text-red-400 text-xs">
                      ₹{p.originalPrice.toLocaleString()}
                    </span>
                  </p>
                  <p
                    className={`mt-1 inline-block px-2 py-1 text-xs rounded-full font-semibold ${
                      p.availability === "available"
                        ? "bg-green-100 text-green-700"
                        : p.availability === "sold"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {p.availability}
                  </p>
                  {p.featured && (
                    <p className="mt-1 inline-block ml-2 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Featured
                    </p>
                  )}
                  <div className="mt-3 flex justify-between">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id!)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded ${
                      currentPage === i + 1
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default AdminPropertyPage;

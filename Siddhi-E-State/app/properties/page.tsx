import { Suspense } from "react";
import PropertiesContent from "./PropertiesContent";

export default async function PropertiesPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  
  // Construct query string for initial load
  const query = new URLSearchParams();
  if (searchParams.city) query.append("city", searchParams.city);
  if (searchParams.type) query.append("type", searchParams.type);
  if (searchParams.bedrooms) query.append("bedrooms", searchParams.bedrooms);
  if (searchParams.minPrice) query.append("minPrice", (parseInt(searchParams.minPrice) * 100000).toString());
  if (searchParams.maxPrice) query.append("maxPrice", (parseInt(searchParams.maxPrice) * 100000).toString());
  
  query.append("limit", "6");
  query.append("sortBy", "createdAt");
  query.append("sortOrder", "desc");
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
  
  try {
    const [propsRes, allPropsRes, citiesRes] = await Promise.all([
      fetch(`${baseUrl}/properties?${query.toString()}`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/properties?limit=100`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/properties/cities`, { next: { revalidate: 3600 } })
    ]);
    
    const propertiesData = await propsRes.json();
    const allPropertiesData = await allPropsRes.json();
    const citiesData = await citiesRes.json();

    const validCities = (citiesData.data || []).filter((city: string) => city && city.trim() !== "");

    return (
      <Suspense fallback={<div className="text-center py-20 text-2xl font-bold text-[#d6a243]">Loading Properties...</div>}>
        <PropertiesContent 
          initialProperties={propertiesData.data || []}
          initialAllProperties={allPropertiesData.data || []}
          initialCities={validCities}
          initialTotalPages={propertiesData.meta?.totalPages || 1}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch initial properties", error);
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <PropertiesContent 
          initialProperties={[]}
          initialAllProperties={[]}
          initialCities={[]}
          initialTotalPages={1}
        />
      </Suspense>
    );
  }
}
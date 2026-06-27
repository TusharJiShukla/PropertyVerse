import React, { Suspense } from "react";
import PropertyClient from "./PropertyClient";

export default async function AdminPropertyPage() {
  const baseUrl = "http://localhost:5000/api/v1";
  
  try {
    const [propertiesRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/properties?page=1&limit=9&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' }),
      fetch(`${baseUrl}/properties/stats`, { cache: 'no-store' })
    ]);
    
    const propertiesData = await propertiesRes.json();
    const statsData = await statsRes.json();

    return (
      <Suspense fallback={<div className="text-center py-20 font-bold text-red-600">Loading Properties...</div>}>
        <PropertyClient 
          initialProperties={propertiesData.data || []}
          initialTotalPages={propertiesData.meta?.totalPages || 1}
          initialStats={statsData.data || null}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch admin properties", error);
    return (
      <Suspense fallback={<div className="text-center py-20 text-red-600">Error Loading Properties</div>}>
        <PropertyClient 
          initialProperties={[]}
          initialTotalPages={1}
          initialStats={null}
        />
      </Suspense>
    );
  }
}

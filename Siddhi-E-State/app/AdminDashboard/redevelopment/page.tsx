import React, { Suspense } from "react";
import RedevelopmentClient from "./RedevelopmentClient";

export default async function AdminRedevelopmentPage() {
  const baseUrl = "http://localhost:5000/api/v1";
  
  try {
    const [projectsRes, statsRes] = await Promise.all([
      fetch(`${baseUrl}/redevelopment?page=1&limit=9&sortBy=createdAt&sortOrder=desc`, { cache: 'no-store' }),
      fetch(`${baseUrl}/redevelopment/stats`, { cache: 'no-store' })
    ]);
    
    const projectsData = await projectsRes.json();
    const statsData = await statsRes.json();

    return (
      <Suspense fallback={<div className="text-center py-20 font-bold text-red-600">Loading Projects...</div>}>
        <RedevelopmentClient 
          initialProjects={projectsData.data || []}
          initialTotalPages={projectsData.meta?.totalPages || 1}
          initialStats={statsData.data || null}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Failed to fetch admin redevelopment projects", error);
    return (
      <Suspense fallback={<div className="text-center py-20 text-red-600">Error Loading Projects</div>}>
        <RedevelopmentClient 
          initialProjects={[]}
          initialTotalPages={1}
          initialStats={null}
        />
      </Suspense>
    );
  }
}

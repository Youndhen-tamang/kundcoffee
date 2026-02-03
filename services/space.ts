import { ApiResponse, Space, spaceType } from "@/lib/types";

// fetch/space.ts
export async function getSpaces(): Promise<spaceType[]> {
  try {
    const res = await fetch('/api/spaces', { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return [];
  }
}

export async function addSpace(name: string, description?: string): Promise<spaceType | null> {
  try {
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error adding space:", error);
    return null;
  }
}


export async function updateSpace(data:Partial<Space>) {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const  res = await fetch("/api/spaces",{
      method:"PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const updateSpace  =  await res.json()
    return {success:true,data:updateSpace}  as ApiResponse;
  } catch (error) {
    console.error("Failed to update combo:", error);
    return { success: false, message: "Network error" };
  }
}
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
export async function addSpace(
  name: string,
  description?: string
): Promise<ApiResponse<spaceType>> {
  try {
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });

    const data: ApiResponse<spaceType> = await res.json();
    return data;
  } catch (error) {
    return {
      success: false,
      message: "Network error. Please try again.",
    };
  }
}



export async function updateSpace(data:Partial<Space>):Promise<ApiResponse<Space>> {
  if (!data.id) return { success: false, message: "ID required" };
  try {
    const  res = await fetch(`/api/spaces/${data.id}`,{
      method:"PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const updatedSpace:ApiResponse<spaceType> = await res.json();
    return updatedSpace;
  } catch (error) {
    console.error("Failed to update combo:", error);
    return { success: false, message: "Network error" };
  }
}
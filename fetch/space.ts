import { spaceType } from "@/lib/types";

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

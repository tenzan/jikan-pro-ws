import { prisma } from '@/lib/prisma';

export function generateSlug(name: string): string {
  // Convert to lowercase and replace spaces with hyphens
  const baseSlug = name
    .toLowerCase()
    // Replace special characters with empty string
    .replace(/[^a-z0-9\s-]/g, '')
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  return baseSlug;
}

export async function generateUniqueBusinessSlug(name: string): Promise<string> {
  const baseSlug = generateSlug(name);
  
  // Check if the base slug exists
  const existingBusiness = await prisma.business.findUnique({
    where: { slug: baseSlug },
  });
  
  if (!existingBusiness) {
    return baseSlug;
  }
  
  // If exists, add a number suffix
  let counter = 1;
  let newSlug = `${baseSlug}-${counter}`;
  
  while (true) {
    const exists = await prisma.business.findUnique({
      where: { id: newSlug },
    });
    
    if (!exists) {
      return newSlug;
    }
    
    counter++;
    newSlug = `${baseSlug}-${counter}`;
  }
}

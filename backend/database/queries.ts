import { sqlite } from "https://esm.town/v/stevekrouse/sqlite";
import { PROPERTIES_TABLE, PROPERTY_IMAGES_TABLE, ADMIN_USERS_TABLE } from "./migrations.ts";
import { Property, PropertyImage, PropertyWithImages } from "../../shared/types.ts";

// Property queries
export async function getAllProperties(): Promise<Property[]> {
  const result = await sqlite.execute(`SELECT * FROM ${PROPERTIES_TABLE} ORDER BY created_at DESC`);
  return result.rows as Property[];
}

export async function getFeaturedProperties(): Promise<Property[]> {
  const result = await sqlite.execute(
    `SELECT * FROM ${PROPERTIES_TABLE} WHERE featured = 1 ORDER BY created_at DESC LIMIT 6`
  );
  return result.rows as Property[];
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const result = await sqlite.execute(
    `SELECT * FROM ${PROPERTIES_TABLE} WHERE id = ?`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0] as Property;
}

export async function getPropertiesByCategory(category: string): Promise<Property[]> {
  const result = await sqlite.execute(
    `SELECT * FROM ${PROPERTIES_TABLE} WHERE category = ? ORDER BY created_at DESC`,
    [category]
  );
  return result.rows as Property[];
}

export async function searchProperties(
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  location?: string
): Promise<Property[]> {
  let query = `SELECT * FROM ${PROPERTIES_TABLE} WHERE 1=1`;
  const params: any[] = [];
  
  if (category) {
    query += ` AND category = ?`;
    params.push(category);
  }
  
  if (minPrice !== undefined) {
    query += ` AND price >= ?`;
    params.push(minPrice);
  }
  
  if (maxPrice !== undefined) {
    query += ` AND price <= ?`;
    params.push(maxPrice);
  }
  
  if (location) {
    query += ` AND location LIKE ?`;
    params.push(`%${location}%`);
  }
  
  query += ` ORDER BY created_at DESC`;
  
  const result = await sqlite.execute(query, params);
  return result.rows as Property[];
}

export async function createProperty(property: Omit<Property, "id" | "created_at" | "updated_at">): Promise<number> {
  const result = await sqlite.execute(
    `INSERT INTO ${PROPERTIES_TABLE} (
      title, description, price, location, category, 
      bedrooms, bathrooms, area, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id`,
    [
      property.title,
      property.description,
      property.price,
      property.location,
      property.category,
      property.bedrooms,
      property.bathrooms,
      property.area,
      property.featured ? 1 : 0
    ]
  );
  
  return result.rows[0].id;
}

export async function updateProperty(
  id: number,
  property: Partial<Omit<Property, "id" | "created_at" | "updated_at">>
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];
  
  Object.entries(property).forEach(([key, value]) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (fields.length === 0) {
    return false;
  }
  
  fields.push(`updated_at = datetime('now')`);
  
  const query = `UPDATE ${PROPERTIES_TABLE} SET ${fields.join(", ")} WHERE id = ?`;
  values.push(id);
  
  const result = await sqlite.execute(query, values);
  return result.rowsAffected > 0;
}

export async function deleteProperty(id: number): Promise<boolean> {
  const result = await sqlite.execute(
    `DELETE FROM ${PROPERTIES_TABLE} WHERE id = ?`,
    [id]
  );
  
  return result.rowsAffected > 0;
}

// Property images queries
export async function getPropertyImages(propertyId: number): Promise<PropertyImage[]> {
  const result = await sqlite.execute(
    `SELECT * FROM ${PROPERTY_IMAGES_TABLE} WHERE property_id = ? ORDER BY is_primary DESC`,
    [propertyId]
  );
  
  return result.rows as PropertyImage[];
}

export async function addPropertyImage(
  propertyId: number,
  imageUrl: string,
  isPrimary: boolean = false
): Promise<number> {
  // If this is a primary image, reset other primary images
  if (isPrimary) {
    await sqlite.execute(
      `UPDATE ${PROPERTY_IMAGES_TABLE} SET is_primary = 0 WHERE property_id = ?`,
      [propertyId]
    );
  }
  
  const result = await sqlite.execute(
    `INSERT INTO ${PROPERTY_IMAGES_TABLE} (property_id, image_url, is_primary)
     VALUES (?, ?, ?)
     RETURNING id`,
    [propertyId, imageUrl, isPrimary ? 1 : 0]
  );
  
  return result.rows[0].id;
}

export async function deletePropertyImage(id: number): Promise<boolean> {
  const result = await sqlite.execute(
    `DELETE FROM ${PROPERTY_IMAGES_TABLE} WHERE id = ?`,
    [id]
  );
  
  return result.rowsAffected > 0;
}

export async function getPropertiesWithImages(): Promise<PropertyWithImages[]> {
  const properties = await getAllProperties();
  const propertiesWithImages: PropertyWithImages[] = [];
  
  for (const property of properties) {
    const images = await getPropertyImages(property.id);
    propertiesWithImages.push({
      ...property,
      images
    });
  }
  
  return propertiesWithImages;
}

export async function getPropertyWithImages(id: number): Promise<PropertyWithImages | null> {
  const property = await getPropertyById(id);
  
  if (!property) {
    return null;
  }
  
  const images = await getPropertyImages(property.id);
  
  return {
    ...property,
    images
  };
}

// Admin authentication
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  const result = await sqlite.execute(
    `SELECT * FROM ${ADMIN_USERS_TABLE} WHERE username = ? AND password_hash = ?`,
    [username, password]
  );
  
  return result.rows.length > 0;
}

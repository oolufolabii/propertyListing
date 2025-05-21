import { Hono } from "https://esm.sh/hono@3.11.7";
import { 
  getAllProperties, 
  getPropertyById, 
  getPropertiesByCategory,
  searchProperties,
  getPropertiesWithImages,
  getPropertyWithImages
} from "../database/queries.ts";
import { ApiResponse, Property, PropertyWithImages } from "../../shared/types.ts";

const app = new Hono();

// Get all properties
app.get("/", async (c) => {
  try {
    const properties = await getAllProperties();
    return c.json<ApiResponse<Property[]>>({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to fetch properties"
    }, 500);
  }
});

// Get all properties with images
app.get("/with-images", async (c) => {
  try {
    const properties = await getPropertiesWithImages();
    return c.json<ApiResponse<PropertyWithImages[]>>({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching properties with images:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to fetch properties with images"
    }, 500);
  }
});

// Get property by ID
app.get("/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid property ID"
      }, 400);
    }
    
    const property = await getPropertyById(id);
    
    if (!property) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Property not found"
      }, 404);
    }
    
    return c.json<ApiResponse<Property>>({
      success: true,
      data: property
    });
  } catch (error) {
    console.error("Error fetching property:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to fetch property"
    }, 500);
  }
});

// Get property by ID with images
app.get("/:id/with-images", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid property ID"
      }, 400);
    }
    
    const property = await getPropertyWithImages(id);
    
    if (!property) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Property not found"
      }, 404);
    }
    
    return c.json<ApiResponse<PropertyWithImages>>({
      success: true,
      data: property
    });
  } catch (error) {
    console.error("Error fetching property with images:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to fetch property with images"
    }, 500);
  }
});

// Get properties by category
app.get("/category/:category", async (c) => {
  try {
    const category = c.req.param("category");
    const properties = await getPropertiesByCategory(category);
    
    return c.json<ApiResponse<Property[]>>({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error("Error fetching properties by category:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to fetch properties by category"
    }, 500);
  }
});

// Search properties
app.get("/search", async (c) => {
  try {
    const { category, minPrice, maxPrice, location } = c.req.query();
    
    const properties = await searchProperties(
      category,
      minPrice ? parseFloat(minPrice) : undefined,
      maxPrice ? parseFloat(maxPrice) : undefined,
      location
    );
    
    return c.json<ApiResponse<Property[]>>({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error("Error searching properties:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to search properties"
    }, 500);
  }
});

export default app;

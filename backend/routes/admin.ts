import { Hono } from "https://esm.sh/hono@3.11.7";
import { 
  createProperty, 
  updateProperty, 
  deleteProperty,
  addPropertyImage,
  deletePropertyImage,
  verifyAdminCredentials
} from "../database/queries.ts";
import { ApiResponse, PropertyFormData } from "../../shared/types.ts";
import { blob } from "https://esm.town/v/std/blob";

const app = new Hono();

// Middleware to check admin authentication
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Unauthorized"
    }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    // Verify the token (simple implementation)
    const tokenData = await blob.getJSON(`admin_token_${token}`);
    
    if (!tokenData || !tokenData.username || tokenData.expires < Date.now()) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Unauthorized or expired token"
      }, 401);
    }
    
    // Add user info to context
    c.set("adminUser", tokenData.username);
    await next();
  } catch (error) {
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Authentication failed"
    }, 401);
  }
};

// Login endpoint
app.post("/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Username and password are required"
      }, 400);
    }
    
    const isValid = await verifyAdminCredentials(username, password);
    
    if (!isValid) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid credentials"
      }, 401);
    }
    
    // Generate a token (simple implementation)
    const token = crypto.randomUUID();
    const expiresIn = 24 * 60 * 60 * 1000; // 24 hours
    
    await blob.setJSON(`admin_token_${token}`, {
      username,
      expires: Date.now() + expiresIn
    });
    
    return c.json<ApiResponse<{ token: string }>>({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Login failed"
    }, 500);
  }
});

// Protected routes
app.use("/*", authMiddleware);

// Create property
app.post("/properties", async (c) => {
  try {
    const propertyData: PropertyFormData = await c.req.json();
    
    // Validate required fields
    if (!propertyData.title || !propertyData.description || 
        !propertyData.price || !propertyData.location || 
        !propertyData.category) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Missing required property fields"
      }, 400);
    }
    
    const propertyId = await createProperty(propertyData);
    
    return c.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: propertyId }
    }, 201);
  } catch (error) {
    console.error("Error creating property:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to create property"
    }, 500);
  }
});

// Update property
app.put("/properties/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid property ID"
      }, 400);
    }
    
    const propertyData: Partial<PropertyFormData> = await c.req.json();
    const updated = await updateProperty(id, propertyData);
    
    if (!updated) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Property not found or no changes made"
      }, 404);
    }
    
    return c.json<ApiResponse<{ success: boolean }>>({
      success: true,
      data: { success: true }
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to update property"
    }, 500);
  }
});

// Delete property
app.delete("/properties/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid property ID"
      }, 400);
    }
    
    const deleted = await deleteProperty(id);
    
    if (!deleted) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Property not found"
      }, 404);
    }
    
    return c.json<ApiResponse<{ success: boolean }>>({
      success: true,
      data: { success: true }
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to delete property"
    }, 500);
  }
});

// Add property image
app.post("/properties/:id/images", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid property ID"
      }, 400);
    }
    
    const { imageUrl, isPrimary } = await c.req.json();
    
    if (!imageUrl) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Image URL is required"
      }, 400);
    }
    
    const imageId = await addPropertyImage(id, imageUrl, isPrimary);
    
    return c.json<ApiResponse<{ id: number }>>({
      success: true,
      data: { id: imageId }
    }, 201);
  } catch (error) {
    console.error("Error adding property image:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to add property image"
    }, 500);
  }
});

// Delete property image
app.delete("/images/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    
    if (isNaN(id)) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Invalid image ID"
      }, 400);
    }
    
    const deleted = await deletePropertyImage(id);
    
    if (!deleted) {
      return c.json<ApiResponse<any>>({
        success: false,
        error: "Image not found"
      }, 404);
    }
    
    return c.json<ApiResponse<{ success: boolean }>>({
      success: true,
      data: { success: true }
    });
  } catch (error) {
    console.error("Error deleting property image:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Failed to delete property image"
    }, 500);
  }
});

// Logout endpoint
app.post("/logout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      await blob.delete(`admin_token_${token}`);
    }
    
    return c.json<ApiResponse<{ success: boolean }>>({
      success: true,
      data: { success: true }
    });
  } catch (error) {
    console.error("Logout error:", error);
    return c.json<ApiResponse<any>>({
      success: false,
      error: "Logout failed"
    }, 500);
  }
});

export default app;

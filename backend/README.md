# Backend API

This directory contains the backend API for the property listing website.

## Structure

- `index.ts` - Main entry point for the API
- `/database` - Database schema and queries
- `/routes` - API routes for properties and admin functionality

## API Endpoints

### Properties

- `GET /api/properties` - Get all properties
- `GET /api/properties/with-images` - Get all properties with their images
- `GET /api/properties/:id` - Get a specific property by ID
- `GET /api/properties/:id/with-images` - Get a specific property with its images
- `GET /api/properties/category/:category` - Get properties by category
- `GET /api/properties/search` - Search properties with filters

### Admin

- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/properties` - Create a new property
- `PUT /api/admin/properties/:id` - Update a property
- `DELETE /api/admin/properties/:id` - Delete a property
- `POST /api/admin/properties/:id/images` - Add an image to a property
- `DELETE /api/admin/images/:id` - Delete a property image

## Authentication

Admin routes are protected with a Bearer token authentication. The token is obtained by logging in with valid admin credentials.

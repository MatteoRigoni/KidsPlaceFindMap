import { z } from "zod";

export const venueTypeSchema = z.enum([
  'playground',
  'park', 
  'museum',
  'gallery',
  'science_center',
  'planetarium',
  'swimming_pool'
]);

export const venueSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: venueTypeSchema,
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  description: z.string().optional(),
  tags: z.record(z.string()).optional()
});

export const locationSchema = z.object({
  query: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  displayName: z.string()
});

export const venueSearchRequestSchema = z.object({
  bounds: z.object({
    north: z.number(),
    south: z.number(),
    east: z.number(),
    west: z.number()
  }),
  venueTypes: z.array(venueTypeSchema)
});

export const locationSearchRequestSchema = z.object({
  query: z.string().min(1)
});

// User schema for storage
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().optional(),
  createdAt: z.date().optional()
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });

export type VenueType = z.infer<typeof venueTypeSchema>;
export type Venue = z.infer<typeof venueSchema>;
export type Location = z.infer<typeof locationSchema>;
export type VenueSearchRequest = z.infer<typeof venueSearchRequestSchema>;
export type LocationSearchRequest = z.infer<typeof locationSearchRequestSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const VENUE_TYPE_CONFIG = {
  playground: { 
    query: 'leisure=playground', 
    icon: 'baby', 
    color: '#34C759',
    name: 'Playgrounds'
  },
  park: { 
    query: 'leisure=park', 
    icon: 'trees', 
    color: '#34C759',
    name: 'Parks'
  },
  museum: { 
    query: 'tourism=museum', 
    icon: 'building', 
    color: '#AF52DE',
    name: 'Museums'
  },
  gallery: { 
    query: 'tourism=gallery', 
    icon: 'palette', 
    color: '#FF9500',
    name: 'Art Galleries'
  },
  science_center: { 
    query: 'amenity=science_centre', 
    icon: 'atom', 
    color: '#007AFF',
    name: 'Science Centers'
  },
  planetarium: { 
    query: 'amenity=planetarium', 
    icon: 'globe', 
    color: '#1C1C1E',
    name: 'Planetariums'
  },
  swimming_pool: { 
    query: 'leisure=swimming_pool', 
    icon: 'waves', 
    color: '#007AFF',
    name: 'Swimming Pools'
  }
} as const;

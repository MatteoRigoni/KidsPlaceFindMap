import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  venueSearchRequestSchema, 
  locationSearchRequestSchema,
  insertUserFavoriteSchema,
  insertUserVisitedSchema,
  VENUE_TYPE_CONFIG,
  type Venue,
  type Location
} from "@shared/schema";
import { z } from "zod";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth middleware
  await setupAuth(app);
  
  // Search for venues using Overpass API
  app.post("/api/venues/search", async (req, res) => {
    try {
      const { bounds, venueTypes } = venueSearchRequestSchema.parse(req.body);
      
      if (venueTypes.length === 0) {
        return res.json([]);
      }

      const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
      
      // Build query for active filters
      const queries = venueTypes.map(type => {
        const config = VENUE_TYPE_CONFIG[type];
        return `(
          node[${config.query}](${bbox});
          way[${config.query}](${bbox});
          relation[${config.query}](${bbox});
        );`;
      }).join('\n');

      const overpassQuery = `
        [out:json][timeout:25];
        (
          ${queries}
        );
        out geom;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'data=' + encodeURIComponent(overpassQuery)
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Overpass data to our venue format
      const venues: Venue[] = data.elements
        .map((element: any) => {
          let lat, lng;
          
          if (element.lat && element.lon) {
            lat = element.lat;
            lng = element.lon;
          } else if (element.center) {
            lat = element.center.lat;
            lng = element.center.lon;
          } else if (element.geometry && element.geometry.length > 0) {
            lat = element.geometry[0].lat;
            lng = element.geometry[0].lon;
          } else {
            return null;
          }

          // Determine venue type from tags
          const tags = element.tags || {};
          let venueType = 'playground'; // default
          
          if (tags.leisure === 'playground') venueType = 'playground';
          else if (tags.leisure === 'park') venueType = 'park';
          else if (tags.tourism === 'museum') venueType = 'museum';
          else if (tags.tourism === 'gallery') venueType = 'gallery';
          else if (tags.amenity === 'science_centre') venueType = 'science_center';
          else if (tags.amenity === 'planetarium') venueType = 'planetarium';
          else if (tags.leisure === 'swimming_pool') venueType = 'swimming_pool';

          const name = tags.name || 'Unnamed Location';
          const address = tags['addr:full'] || tags['addr:street'] || undefined;
          const description = tags.description || tags.amenity || tags.leisure || tags.tourism || undefined;

          return {
            id: element.id.toString(),
            name,
            type: venueType,
            lat,
            lng,
            address,
            description,
            tags
          };
        })
        .filter(Boolean);

      res.json(venues);
      
    } catch (error) {
      console.error('Error searching venues:', error);
      res.status(500).json({ error: 'Failed to search venues' });
    }
  });

  // Search for locations using Nominatim
  app.post("/api/locations/search", async (req, res) => {
    try {
      const { query } = locationSearchRequestSchema.parse(req.body);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KidFriendlyMaps/1.0 (contact@example.com)',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://replit.com'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const results = await response.json();
      
      const locations: Location[] = results.map((result: any) => ({
        query,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name
      }));

      res.json(locations);
      
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(500).json({ error: 'Failed to search locations' });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favoriteData = insertUserFavoriteSchema.parse({
        ...req.body,
        userId
      });
      
      const favorite = await storage.addUserFavorite(favoriteData);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:venueId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { venueId } = req.params;
      
      await storage.removeUserFavorite(userId, venueId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Visited routes
  app.get('/api/visited', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const visited = await storage.getUserVisited(userId);
      res.json(visited);
    } catch (error) {
      console.error("Error fetching visited:", error);
      res.status(500).json({ message: "Failed to fetch visited places" });
    }
  });

  app.post('/api/visited', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const visitedData = insertUserVisitedSchema.parse({
        ...req.body,
        userId
      });
      
      const visited = await storage.addUserVisited(visitedData);
      res.json(visited);
    } catch (error) {
      console.error("Error adding visited:", error);
      res.status(500).json({ message: "Failed to add visited place" });
    }
  });

  app.delete('/api/visited/:venueId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { venueId } = req.params;
      
      await storage.removeUserVisited(userId, venueId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing visited:", error);
      res.status(500).json({ message: "Failed to remove visited place" });
    }
  });

  // Check if venue is favorite or visited
  app.get('/api/venue/:venueId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { venueId } = req.params;
      
      const [isFavorite, isVisited] = await Promise.all([
        storage.isUserFavorite(userId, venueId),
        storage.isUserVisited(userId, venueId),
      ]);
      
      res.json({ isFavorite, isVisited });
    } catch (error) {
      console.error("Error checking venue status:", error);
      res.status(500).json({ message: "Failed to check venue status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

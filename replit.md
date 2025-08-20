# Overview

KidFriendly Maps is a location-based web application that helps parents and caregivers discover kid-friendly venues in their area. The app provides an interactive map interface showing various types of child-friendly locations including playgrounds, parks, museums, galleries, science centers, planetariums, and swimming pools. Users can search for locations, filter venue types, and view detailed information about each venue on an interactive map.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Mapping**: Leaflet with React-Leaflet for interactive map functionality
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful API endpoints for venue and location search
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Storage**: In-memory storage with plans for PostgreSQL session store
- **Development**: Hot reload with Vite integration in development mode

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **ORM**: Drizzle with schema-first approach and automatic type generation
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Drizzle Kit for database schema migrations
- **Session Storage**: Currently in-memory with connect-pg-simple for PostgreSQL sessions

## Authentication and Authorization
- **Current State**: Basic user storage interface implemented but not actively used
- **Storage Interface**: Abstract storage layer supporting both in-memory and database implementations
- **Future Plans**: User authentication system with PostgreSQL-backed sessions

## External Service Integrations
- **Overpass API**: Primary data source for venue information from OpenStreetMap
- **Nominatim**: Planned integration for location search and geocoding services
- **Map Tiles**: OpenStreetMap tiles via Leaflet for map visualization

## Key Design Patterns
- **Shared Types**: Common TypeScript interfaces and Zod schemas shared between client and server
- **API Layer**: Centralized API request handling with error management and type safety
- **Component Architecture**: Modular UI components with clear separation of concerns
- **Responsive Design**: Mobile-first approach with conditional sidebar behavior
- **Error Handling**: Comprehensive error boundaries and user feedback systems

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Drizzle ORM**: Type-safe database operations and migrations

## Map and Location Services  
- **Overpass API**: OpenStreetMap data querying for venue discovery
- **Leaflet**: Interactive map rendering and user interaction
- **OpenStreetMap**: Base map tiles and geographical data

## Development and Build Tools
- **Vite**: Fast development server and optimized production builds
- **Replit**: Development environment integration with error overlay and cartographer

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first styling with custom design system variables
- **Lucide React**: Consistent icon system throughout the application

## State and Data Management
- **TanStack Query**: Server state caching, synchronization, and background updates
- **Zod**: Runtime type validation and schema definition
- **React Hook Form**: Form state management with validation integration
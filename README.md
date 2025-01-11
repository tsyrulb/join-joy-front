[![Matching API](https://img.shields.io/badge/GitHub-Matching%20API-yellow?style=for-the-badge)](https://github.com/tsyrulb/joinjoy-matching)
[![Backend](https://img.shields.io/badge/GitHub-Backend-blue?style=for-the-badge)](https://github.com/tsyrulb/joinjoy)
---

# JoinJoy Frontend

Welcome to the **JoinJoy** frontend repository! This is the Angular-based single-page application (SPA) that powers the user interface of JoinJoy, a platform designed to intelligently match users with activities, events, and other participants that align with their interests.

## Table of Contents

- [About the Project](#about-the-project)
- [Key Features](#key-features)
- [Architecture & Technologies](#architecture--technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Build & Deployment](#build--deployment)
- [Environment Configuration](#environment-configuration)
- [Integration with Backend Services](#integration-with-backend-services)


## About the Project

JoinJoy aims to help users discover activities and events that truly resonate with them by leveraging advanced NLP embeddings, vector similarity searches, and personalized recommendations. Rather than just listing events by proximity or keyword, JoinJoy understands nuanced interests and evolving preferences.

The frontend provides a modern, responsive user interface that allows users to:

- Log in / register and manage profiles.
- Browse recommended activities and matches.
- Interact with other participants via conversation feeds.
- Suggest activities based on user-submitted criteria and location data.

## Key Features

- **JWT Authentication:** Secure login and signup flows that integrate with the backend's JWT authentication.
- **Dynamic Recommendations:** Activities and matches are personalized based on embeddings fetched from backend services.
- **Search & Filter UI:** Flexible filters and search inputs to refine suggestions.
- **Real-Time Notifications:** Leverages SignalR for real-time updates in conversation and messaging views.
- **Responsive Design:** Optimized for desktop and mobile viewports.

## Architecture & Technologies

- **Framework:** Angular 18.x (Using standalone components and modern Angular tooling)
- **State Management:** Utilizing Angular services and RxJS streams for stateful data flow.
- **HTTP Clients:** Angular HttpClient for RESTful API calls.
- **UI Components & Styling:** Angular Material, custom SCSS styling, and Leaflet for map integration.
- **NLP & Vector Search (Backend Dependent):** Frontend fetches data from a .NET Web API and a Flask microservice that uses embedding-based recommendations (Milvus/Zilliz Cloud, Azure SQL, Redis).

## Getting Started

### Prerequisites

- **Node.js:** Version 18.x or above recommended.
- **NPM:** Comes with Node.js
- **Angular CLI:** `npm install -g @angular/cli` (optional if using npx commands)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/joinjoy-frontend.git
   cd joinjoy-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running Locally

To start a local development server with hot reloading:
```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser to view the app.

## Build & Deployment

To create a production build:
```bash
npm run build -- --configuration production
```

This will output a minified and optimized production build in the `dist/join-joy-front` folder. These files can be served by any static file server, such as Nginx or an online PaaS service.

## Environment Configuration

API endpoints, authentication keys, and other config values can be set in `src/environments/environment.ts` and `src/environments/environment.prod.ts`. Adjust these before building for production.

Example:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  flaskApiUrl: 'http://localhost:5001',
  // Add other configs as needed
};
```

## Integration with Backend Services

- **Web API (ASP.NET Core):** Handles authentication, user data, and orchestrates embedding-based recommendations via the Flask API.
- **Flask API:** Provides advanced similarity and recommendation logic using sentence embeddings and vector database queries.
- **SignalR:** For real-time messaging and notifications.
- **Azure Blob Storage:** For serving user-uploaded images such as profile photos.

This frontend expects these services to be running and accessible at the configured `apiUrl` and `flaskApiUrl`. Ensure CORS and authentication configurations are correctly set up on the backend.

## Testing

Unit tests can be run with:
```bash
npm test
```

Integration and end-to-end tests (if configured via `ng e2e`) can be run similarly:
```bash
ng e2e
```

Adjust configurations in `karma.conf.js` and `angular.json` as needed.


---

Thank you for checking out the JoinJoy frontend! We hope this inspires a richer, more intelligent matching experience for activities and social events.

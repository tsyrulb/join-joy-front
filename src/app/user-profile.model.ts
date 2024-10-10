export interface UserProfile {
    id: string;
    name: string;
    email: string;
    interests: string[];
    hobbies: string[];
    preferredDestinations: string[];
    availability: string; // e.g., 'Morning', 'Afternoon', 'Evening'
    distanceWillingToTravel: number; // e.g., in kilometers
  }
  
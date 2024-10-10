export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    profilePhoto?: string;
    dateOfBirth?: Date;
    isAdmin?: boolean;
    location?: Location;  // You can define a Location interface if needed
    userSubcategories?: UserSubcategory[];
    userAvailabilities?: UserAvailability[];
    distanceWillingToTravel?: number;
    userActivities?: UserActivity[];
    matches?: Match[];
    sentMessages?: Message[];
    receivedMessages?: Message[];
    feedbacks?: Feedback[];
    createdActivities?: Activity[];
    sentChatMessages?: ChatMessage[];
    receivedChatMessages?: ChatMessage[];
  }
  
  // Define other related models (Location, UserSubcategory, etc.) similarly
  // Define placeholders for the other types
export interface Location {
    latitude: number;
    longitude: number;
    address?: string;
  }
  
  export interface UserSubcategory {
    subcategoryId: number;
    userId: number;
  }
  
  export interface UserAvailability {
    availabilityId: number;
    userId: number;
  }
  
  export interface UserActivity {
    activityId: number;
    userId: number;
  }
  
  export interface Match {
    matchId: number;
    userId: number;
  }
  
  export interface Message {
    messageId: number;
    content: string;
  }
  
  export interface Activity {
    activityId: number;
    name: string;
  }
  
  export interface ChatMessage {
    chatMessageId: number;
    content: string;
  }

  export interface Feedback {
    feedbackId: number;
    content: string;
  }

  export interface UpdateUserRequest {
    name?: string;
    email?: string;
    password?: string;
    profilePhoto?: string;
    dateOfBirth?: string;  // Ensure dateOfBirth is a string to match the API
    address?: string;
  }
  
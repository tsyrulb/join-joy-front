export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  address: string;
  placeId?: string; // Optional if it can be null
  activities?: any; // Adjust this type based on your actual data structure
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  profilePhoto?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  isAdmin?: boolean;
  locationId?: number; // Foreign key linking to Location
  location?: Location; // Full location object
  distanceWillingToTravel?: number;
  unavailableDay?: number;
  unavailableStartTime?: string; // Matches SQL `time(7)`
  unavailableEndTime?: string;
  userSubcategories?: UserSubcategory[];
  userAvailabilities?: UserAvailability[];
  userActivities?: UserActivity[];
  matches?: Match[];
  sentMessages?: Message[];
  receivedMessages?: Message[];
  feedbacks?: Feedback[];
  createdActivities?: Activity[];
  sentChatMessages?: ChatMessage[];
  receivedChatMessages?: ChatMessage[];
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  userSubcategories?: UserSubcategory[];
}

export interface Category {
  id: number;
  name: string;
  subcategories?: Subcategory[]; // Make optional if loaded conditionally
}

export interface UserSubcategory {
  userId: number;
  user?: User;
  subcategoryId: number;
  subcategory?: Subcategory;
  weight: number;
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
  dateOfBirth?: Date; // Ensure dateOfBirth is a string to match the API
  address?: string;
  gender?: string;
}

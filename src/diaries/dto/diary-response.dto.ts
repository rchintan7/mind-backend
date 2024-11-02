export class DiaryResponse {
  success: boolean;
  diary?: any; // Use a specific type for diary details if available
  chatEntry?: any; // Use a specific type for chat entry details if available
  question?: string; // Current question for the user
  options?: string[]; // Options related to the current question
  message: string; // Message for the response
}

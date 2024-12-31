// Standard API response format
export interface ApiResponse {
	success: boolean;
	message: string;
	data?: {
		text?: string;
	};
}

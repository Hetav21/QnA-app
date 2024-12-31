import { ApiResponse } from './ApiResponse';

// Response to the client
export function response(
	msg: ApiResponse,
	status: number,
	env: {
		AI: Ai;
		ALLOW_ORIGIN?: string;
		ALLOW_METHODS?: string;
		ALLOW_HEADERS?: string;
	},
) {
	return Response.json(msg, {
		status,
		// Headers to allow CORS
		headers: {
			// Allow all origins, or specify allowed origins
			'Access-Control-Allow-Origin': env.ALLOW_ORIGIN || '*',
			// Allowed methods
			'Access-Control-Allow-Methods': env.ALLOW_METHODS || 'POST',
			// Allowed headers
			'Access-Control-Allow-Headers': env.ALLOW_HEADERS || 'Content-Type',
		},
	});
}

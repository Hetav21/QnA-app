export interface Env {
	AI: Ai;
	AI_MODEL: any;
}

import { response } from './response';

// Send a ApiResponse to the client
export default {
	async fetch(request, env): Promise<Response> {
		if (request.method !== 'POST') {
			return response(
				{
					success: false,
					message: 'Method Not Allowed',
				},
				405,
				env,
			);
		}

		// Fetching the prompt from the request body
		const body: {
			prompt: string;
		} = await request.json();

		const prompt = body.prompt;

		// Initializing the worker AI
		const res = await env.AI.run(env.AI_MODEL, {
			prompt,
		});

		// Sending the response back to the client
		return response(
			{
				success: true,
				message: 'AI response',
				data: {
					text: JSON.stringify(res),
				},
			},
			200,
			env,
		);
	},
} satisfies ExportedHandler<Env>;

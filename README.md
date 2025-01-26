## Description

A messaging platform that allows users to ask questions anonymously. Users can create accounts, generate unique usernames, and interact with an intelligent response mechanism that provides contextual and helpful replies. The platform focuses on privacy, allowing individuals to seek information or advice without revealing their identity. Built with modern web technologies like Next.js, React, and powered by AI, the application offers a seamless, secure, and intuitive communication experience.

## Setup

To set up the environment, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/Hetav21/QnA-app.git
   cd QnA-app
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy `.env` from `.env.example`:
   ```sh
   cp env/.env.example .env
   ```
4. Populate `.env`:
   ```sh
   vim .env
   ```

## Dev Setup

To run the development environment:

```sh
npm run dev
```

## Build for Production

To build the project for production, run the following command:

```sh
npm run build
```

## Libraries Used

- **Frontend**: React, NextJS, Tailwind CSS, Shadcn/UI
- **Authentication & Forms**: AuthJS, React Hook Forms, Zod
- **Backend & Database**: Mongoose, bcryptjs
- **API & Communication**: Vercel AI SDK - OpenAI Provider, Axios
- **Emails**: Resend, React Email Components
- **Utilities**: Lucide React, usehooks-ts

## Project Structure

The project structure is organized as follows:

```text
.
├── api-testing/              # Contains API testing configurations for bruno
├── emails/                   # Email templates
├── env/                      # Example env configuration
├── public/                   # Contains privacy policy and terms of service
├── src/                      # Website's source code, contains db schema, ui component, etc.
│   ├── app/                  # Contains application specific code, react page templates
│   │   ├── (app)/            # Pages related to user actions after logging in
│   │   ├── (auth)/           # Auth related pages like auth/error, sign-in, sign-up and verify
│   │   ├── (public)/         # Public pages that do not require user authentication like sending questions and reading responses
│   │   ├── api/              # Apis to support user actions
│   ├── components/           # Reusable UI components
│   ├── context/              # React context providers
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions and libraries
│   ├── model/                # Database models
│   ├── models/               # Support for llm models
│   ├── schemas/              # Validation schemas
│   ├── static/               # Static data and assets
│   │   ├── prompts/          # Prompts for llm models
│   └── types/                # TypeScript type definitions
├── styles/                   # Various CSS Files
└── workers-ai/               # Cloudflare Workers AI configurations
```

## Acknowledgement:

<a href="https://icons8.com/icons/set/favicon">icons8.com</a> for favicon <br />
<a href="https://www.privacypolicies.com/">PrivacyPolicies</a> for privacy policy <br />
<a href="https://termly.io/">Termly</a> for terms of service <br />

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

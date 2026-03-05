# Edufly Overseas - Corporate International Education Platform

## Project Overview
Edufly Overseas is a premium corporate education consultancy website designed to guide students through their international education journey.

## Features
- **Global Destinations**: Detailed information on top study destinations like UK, USA, Singapore, etc.
- **Program Categories**: Explore programs by discipline (Engineering, Medicine, Arts, etc.).
- **Lead Management**: Capture and manage student inquiries.
- **Admin Dashboard**: (Internal) Manage leads, destinations, and content.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Drizzle ORM)
- **Deployment**: Render (configuration included)

## Folder Structure
- `client/`: Frontend React application
- `server/`: Backend Node.js/Express application
- `shared/`: Shared types and schemas (Drizzle/Zod)
- `render.yaml`: Deployment configuration for Render

## Setup & Run
1. Install dependencies: `npm install`
2. Setup database: Ensure PostgreSQL is running and `DATABASE_URL` is set.
3. Push schema: `npm run db:push`
4. Start development server: `npm run dev`

## Deployment
This project is configured for deployment on Render.
1. Push this repository to GitHub/GitLab.
2. Link the repository to Render.
3. Render will automatically detect `render.yaml` and provision the web service and database.

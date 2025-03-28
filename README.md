# Jikan Pro

A Next.js-based appointment scheduling system for small businesses in Japan.

## Features

- Public booking page for customers
- Admin dashboard for business owners
- Staff management
- Appointment scheduling and management
- Email notifications via Mailgun
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 14 with TypeScript
- Neon (PostgreSQL)
- Prisma ORM
- NextAuth.js for authentication
- Tailwind CSS for styling
- Mailgun for transactional emails
- Vercel for deployment

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Required environment variables:

- `DATABASE_URL`: Neon PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- `NEXTAUTH_SECRET`: Random string for session encryption
- `MAILGUN_API_KEY`: Your Mailgun API key
- `MAILGUN_DOMAIN`: Your Mailgun domain
- `MAILGUN_FROM`: Sender email address

## Project Structure

```
src/
├── app/
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── book/           # Public booking pages
│   ├── dashboard/      # Admin dashboard
│   ├── components/     # Shared components
│   └── lib/           # Utility functions
├── prisma/
│   └── schema.prisma  # Database schema
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Welcome to My Next.js 13 App Router App</h1>
      <p>This is the home page using the new App Router.</p>
      <Link href="/about" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go to About Page
      </Link>
    </div>
  );
}


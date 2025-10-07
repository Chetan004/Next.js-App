import Link from 'next/link';

export default function About() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>About Page</h1>
      <p>This is a simple About page using App Router.</p>
      <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Back to Home
      </Link>
    </div>
  );
}


import Link from 'next/link';
import Header from '@/components/Header';

// Страница для отображения при ошибке 404
export default function NotFound() {
  return (
    <main style={{ width: '100%', minHeight: '100vh' }}>
      <Header title='Го сюда' />
      <section style={{ flex: 1, padding: 24, textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 64, lineHeight: 1 }}>404</h2>
        <p style={{ maxWidth: 420, margin: '16px auto 24px' }}>
          Такой страницы или опроса не существует.
        </p>
        <Link
          href='/'
          style={{
            display: 'inline-flex',
            minHeight: 40,
            alignItems: 'center',
            borderRadius: 6,
            background: '#6813df',
            color: '#fff',
            padding: '0 18px',
            textDecoration: 'none',
          }}
        >
          На главную
        </Link>
      </section>
    </main>
  );
}

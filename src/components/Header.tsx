type HeaderProps = {
  title: string;
};

// Компонент для отображения заголовка страницы
export default function Header({ title }: HeaderProps) {
  return (
    <header className='header'>
      <h1>{title}</h1>
    </header>
  );
}

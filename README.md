# 🎉 Go tuda

**Помоги друзьям выбрать идеальное место для встречи без споров и переписок!**

Go tuda — это веб-приложение, которое делает планирование совместных выходов простым и наглядным.

Пользователь может:

- 🗺 Создать список мест, куда он хочет сходить
- 👥 Добавить список друзей
- 📝 Сформировать интерактивную форму с выбором мест

После того как друзья заполнят форму, приложение автоматически создаёт итоговую страницу с таблицей, где видно, кто и куда хочет пойти.

**Зачем это нужно?**  
Больше никаких длинных переписок в мессенджерах или споров о месте встречи - вы видите предпочтения всех друзей сразу и легко выбираете общее место для встречи.

---

## 🚀 Ключевые функции

- Создание списка мест и друзей
- Формирование уникальной формы для друзей
- Автоматическое создание итоговой таблицы с выбором всех участников
- Интуитивно понятный и быстрый интерфейс

---

## 🛠 Технологии

- Frontend: [![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![Ant Design](https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=antdesign&logoColor=white)](https://ant.design/)
  [![Bun](https://img.shields.io/badge/Bun-FF4500?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)

## 💻 Установка

1. Клонируем репозиторий:

```bash
git clone https://github.com/SamHeatfield1199/tuda_suda.git
cd tuda_suda
```

2. Устанавливаем зависимости:

```bash
bun install
```

3. Запускаем проект:

```bash
bun dev
```

## 🐳 Запуск через Docker

Перед запуском убедись, что Docker Desktop запущен.

1. Собрать образ и запустить приложение:

```bash
docker compose up --build
```

После запуска приложение будет доступно на:

```bash
http://localhost:3000
```

2. Запустить контейнер в фоне:

```bash
docker compose up -d --build
```

3. Посмотреть логи:

```bash
docker compose logs -f app
```

4. Остановить контейнеры:

```bash
docker compose down
```

5. Пересобрать контейнер, если менялись зависимости или Dockerfile:

```bash
docker compose build --no-cache
docker compose up
```

В Docker база SQLite хранится в папке `data` проекта и подключается как `/app/data/app.db` внутри контейнера. Если нужно начать с чистой базы, останови контейнеры и удали файл `data/app.db`.

## Server API

Серверные методы живут прямо внутри проекта на Next.js App Router.

- `src/app/api/survey/route.ts` - HTTP endpoint
- `src/server/forms/service.ts` - валидация и серверная бизнес-логика
- `src/server/forms/repository.ts` - запись формы в SQLite
- `src/server/db.ts` - подключение к базе и инициализация таблиц

Схема работы:

1. Клиент отправляет запрос на `/api/survey`
2. Route handler принимает JSON
3. Service валидирует входные данные
4. Repository хранит методы работы с SQLite

Переменные окружения:

```bash
DATABASE_URL=./data/app.db
```

Пример запроса:

```bash
curl -X POST http://localhost:3000/api/survey \
  -H "Content-Type: application/json" \
  -d '{"places":["Кафе","Музей"],"people":["Аня","Илья"]}'
```

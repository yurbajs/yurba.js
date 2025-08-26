# Yurba.js REST API Tests

Комплексна система тестування для всіх методів REST API клієнта з автоматичною перевіркою типів.

## Налаштування

### 1. Створення конфігурації

```bash
# Створити приклад .env файлу
node tests/test.js --create-env

# Скопіювати та налаштувати
cp .env.example .env
```

### 2. Налаштування .env файлу

```env
# Категорії тестів (встановіть 'true' для увімкнення)
TEST_AUTH=false          # Тести авторизації
TEST_USERS=true          # Тести користувачів
TEST_POSTS=true          # Тести постів
TEST_DIALOGS=false       # Тести діалогів
TEST_PHOTOS=false        # Тести фото
TEST_FILES=false         # Тести файлів
TEST_VIDEO=false         # Тести відео
TEST_MUSEBASE=false      # Тести музики
TEST_SEARCH=false        # Тести пошуку
TEST_SHOP=false          # Тести магазину
TEST_APPS=false          # Тести додатків

# Обов'язкові параметри
YURBA_TOKEN=y.your_token_here

# Опціональні параметри для тестів авторизації
TEST_EMAIL=your_email@example.com
TEST_PASSWORD=your_password

# ID для тестування (опціонально, буде використано @me якщо не вказано)
TEST_USER_ID=12345
TEST_POST_ID=67890
TEST_PHOTO_ID=11111
TEST_VIDEO_ID=22222
TEST_TRACK_ID=33333

# Параметри додатків
TEST_APP_ID=44444
TEST_APP_SECRET=your_app_secret_here
```

## Запуск тестів

### Швидкий старт
```bash
# Встановити залежності
npm install dotenv

# Створити конфігурацію
node tests/run-tests.js --env

# Налаштувати .env файл
cp .env.example .env
# Відредагувати .env з вашим токеном

# Запустити базові тести
node tests/run-tests.js basic
```

### Пресети тестів
```bash
# Базові тести (тільки користувачі)
node tests/run-tests.js basic

# Контент тести (користувачі + медіа)
node tests/run-tests.js content

# Соціальні тести (користувачі + пости + діалоги)
node tests/run-tests.js social

# Всі тести
node tests/run-tests.js full

# Показати доступні пресети
node tests/run-tests.js --list
```

### Ручний запуск
```bash
# Запустити всі тести з .env конфігурацією
node tests/test.js

# Створити приклад конфігурації
node tests/test.js --create-env
```

## Функції

### 🧪 Категорійне тестування
- Увімкнення/вимкнення окремих категорій тестів
- Гнучке налаштування через змінні середовища

### 📊 Автоматична перевірка типів
- Запис типів відповідей API в `tests/expected-types.json`
- Порівняння з очікуваними типами при повторних запусках
- Виявлення змін в API

### 🔍 Детальна звітність
- Кількість пройдених/провалених/пропущених тестів
- Детальні повідомлення про помилки
- Збереження типів для майбутніх перевірок

## Структура тестів

### Auth (Авторизація)
- `account.login` - Вхід в акаунт
- `account.getTokens` - Отримання токенів

### Users (Користувачі)
- `users.me` - Поточний користувач
- `users.get` - Інформація про користувача
- `users.getFollowers` - Підписники
- `users.getFollowing` - Підписки

### Posts (Пости)
- `posts.create` - Створення поста
- `posts.get` - Отримання постів
- `posts.getComments` - Коментарі до поста

### Dialogs (Діалоги)
- `dialogs.get` - Список діалогів

### Photos (Фото)
- `photos.get` - Фото користувача

### Files (Файли)
- `files.get` - Файли користувача

### Video (Відео)
- `video.get` - Відео користувача

### Musebase (Музика)
- `musebase.getTracks` - Треки користувача
- `musebase.getAlbums` - Альбоми користувача

### Search (Пошук)
- `search.users` - Пошук користувачів
- `search.posts` - Пошук постів

### Shop (Магазин)
- `shop.getProducts` - Товари магазину

### Apps (Додатки)
- `apps.get` - Список додатків
- `apps.getById` - Додаток за ID

## Приклад виводу

```
🚀 Starting yurba.js REST API tests

🧪 Testing users.me...
📝 Recording new type for users.me: { type: 'object', properties: { ID: 'number', Name: 'string', ... } }
✅ users.me passed

🧪 Testing posts.create...
✅ Type match for posts.create
✅ posts.create passed

📊 Test Summary:
✅ Passed: 8
❌ Failed: 0
⏭️  Skipped: 5

💾 Types saved to /path/to/tests/expected-types.json
```

## Розробка

Для додавання нових тестів:

1. Додайте нову категорію в `TEST_CONFIG.categories`
2. Додайте відповідну змінну середовища в `.env.example`
3. Створіть тест в `runAllTests()` функції
4. Запустіть тести для запису нових типів
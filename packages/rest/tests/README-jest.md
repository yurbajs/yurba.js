# Jest Tests for Yurba.js REST API

Професійні Jest тести для всіх компонентів REST API клієнта.

## Встановлення

```bash
# Встановити залежності
cd tests
npm install

# Або з основної директорії
npm install --prefix tests
```

## Налаштування

### 1. Створити .env файл

```bash
# Скопіювати приклад
cp .env.example .env

# Налаштувати змінні
YURBA_TOKEN=y.your_token_here
TEST_USER_ID=1111
TEST_POST_ID=3378
TEST_PHOTO_ID=3385
TEST_VIDEO_ID=28
TEST_TRACK_ID=6422
TEST_FILE_ID=684
TEST_DIALOG_ID=123
```

## Запуск тестів

```bash
# Запустити всі тести
npm test

# Запустити з покриттям коду
npm run test:coverage

# Запустити в режимі спостереження
npm run test:watch

# Запустити для CI/CD
npm run test:ci

# Запустити конкретний тест
npm test users.test.ts

# Запустити тести з фільтром
npm test -- --testNamePattern="should get current user"
```

## Структура тестів

### 📁 Файли тестів

- `users.test.ts` - Тести UserResource
- `posts.test.ts` - Тести PostResource  
- `photos.test.ts` - Тести PhotosResource
- `search.test.ts` - Тести SearchResource
- `base-client.test.ts` - Тести BaseClient

### 🔧 Конфігурація

- `jest.config.js` - Налаштування Jest
- `setup.ts` - Глобальні налаштування та кастомні матчери
- `package.json` - Залежності та скрипти

## Кастомні матчери

```typescript
// Перевірка валідної відповіді API
expect(response).toBeValidYurbaResponse();

// Перевірка наявності Yurba ID
expect(user).toHaveYurbaId();
```

## Категорії тестів

### 🧪 UserResource
- Основні методи (me, get)
- Методи друзів (friends, getFriends)
- Методи подарунків (gifts, getGifts)
- Обробка помилок

### 📝 PostResource
- CRUD операції з постами
- Робота з коментарями
- Прикріплення медіа
- Валідація даних

### 🖼️ PhotosResource
- Отримання фото
- Завантаження фото
- Пагінація
- Приватні фото

### 🔍 SearchResource
- Пошук користувачів
- Пошук треків
- Пошук діалогів
- Фільтрація результатів

### ⚙️ BaseClient
- Ініціалізація клієнта
- Доступ до ресурсів
- Rate limiting
- Управління запитами

## Особливості

### 🔒 Безпека
- Автоматичний пропуск тестів без токена
- Обробка очікуваних помилок (приватні дані)
- Валідація параметрів

### 📊 Покриття коду
- Детальні звіти покриття
- HTML звіти в папці `coverage/`
- Виключення тестових файлів з покриття

### 🚀 Продуктивність
- Максимум 1 воркер (rate limiting)
- Таймаут 30 секунд для API запитів
- Кешування результатів

## Приклад виводу

```
 PASS  tests/users.test.ts
  UserResource
    Core Methods
      ✓ should get current user info (234ms)
      ✓ should get user by identifier (156ms)
      ✓ should get user by @me (123ms)
    Friends Methods
      ✓ should get current user friends (89ms)
      ⚠ should handle private friends list (45ms)

Test Suites: 5 passed, 5 total
Tests:       23 passed, 2 skipped, 25 total
Snapshots:   0 total
Time:        12.34s
Coverage:    85.67% Statements 234/273
             82.14% Branches 23/28
             90.00% Functions 18/20
             85.67% Lines 234/273
```

## Налагодження

### Пропуск тестів
Тести автоматично пропускаються якщо:
- Не надано YURBA_TOKEN
- Недоступні тестові дані (ID)

### Очікувані помилки
Деякі тести можуть "провалитися" через:
- Приватні налаштування користувача
- Rate limiting API
- Недоступні ресурси

Це нормально і обробляється в тестах.

### Логування
Увімкніть детальне логування:
```bash
DEBUG=yurba:* npm test
```

## CI/CD Integration

```yaml
# GitHub Actions приклад
- name: Run Jest Tests
  run: |
    cd packages/rest/tests
    npm ci
    npm run test:ci
  env:
    YURBA_TOKEN: ${{ secrets.YURBA_TOKEN }}
```
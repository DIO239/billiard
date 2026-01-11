# Документация API для внешних сервисов

Полная документация по использованию API из внешних приложений: Telegram боты, VK боты, мобильные приложения и другие сервисы.

## Содержание

1. [Базовые настройки](#базовые-настройки)
2. [Аутентификация](#аутентификация)
3. [Эндпоинты API](#эндпоинты-api)
4. [Примеры интеграции](#примеры-интеграции)
5. [Обработка ошибок](#обработка-ошибок)

---

## Базовые настройки

### Базовый URL

```
https://your-domain.com/api
```

### Формат запросов

- **Content-Type**: `application/json`
- **Методы**: `GET`, `POST`, `PATCH`, `DELETE`
- **Кодировка**: UTF-8

### CORS

API поддерживает CORS запросы. По умолчанию разрешены запросы с любого origin.

Для ограничения доступа к конкретным доменам, установите переменную окружения:
```env
ALLOWED_ORIGINS=https://example.com,https://another-domain.com
```

---

## Аутентификация

### Получение JWT токена

Для работы с защищенными эндпоинтами необходимо получить JWT токен через логин.

#### Логин

**Запрос:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Успешный вход",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE2OTk5OTk5OTl9...",
  "cart": {
    "id": 1,
    "items": []
  }
}
```

**Ошибки:**
- `400` - Неверный email или пароль
- `403` - Email не подтверждён
- `400` - Для этого аккаунта вход по паролю недоступен (OAuth аккаунт)

### Использование токена

После получения токена, передавайте его в заголовке `Authorization` для всех защищенных запросов:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

**Важно:** Токен действителен до истечения срока (обычно 7 дней). При получении ошибки `401` необходимо повторно выполнить логин.

---

## Эндпоинты API

### Публичные эндпоинты (не требуют аутентификации)

#### 1. Получить список товаров

```http
GET /api/products?skip=0&take=20&typeId=1&priceMin=1000&priceMax=5000&sortBy=price&sortOrder=asc
```

**Параметры запроса:**
- `skip` (number, опционально) - количество пропущенных записей (по умолчанию: 0)
- `take` (number, опционально) - количество записей (по умолчанию: 20)
- `all` (boolean, опционально) - загрузить все товары (`all=true`)
- `search` (string, опционально) - поиск по названию и описанию
- `typeId` (number, опционально) - фильтр по типу товара
- `priceMin` (number, опционально) - минимальная цена
- `priceMax` (number, опционально) - максимальная цена
- `visible` (boolean, опционально) - фильтр по видимости (по умолчанию: только видимые)
- `sortBy` (string, опционально) - сортировка: `title` или `price`
- `sortOrder` (string, опционально) - порядок: `asc` или `desc`

**Ответ (200):**
```json
{
  "products": [
    {
      "id": 1,
      "title": "Кий профессиональный",
      "description": "Описание товара",
      "price": 15000,
      "count": 5,
      "visible": true,
      "typeId": 1,
      "type": {
        "id": 1,
        "value": "cues",
        "name": "Кии"
      },
      "media": [
        {
          "id": 1,
          "type": "image",
          "name": "/static/products/1/image.jpg",
          "showOnMain": true
        }
      ],
      "characteristic": {
        "id": 1,
        "attributes": {
          "height": 145,
          "weight": 18.5
        }
      }
    }
  ]
}
```

#### 2. Получить товар по ID

```http
GET /api/products/1
```

**Ответ (200):**
```json
{
  "id": 1,
  "title": "Кий профессиональный",
  "description": "Описание товара",
  "price": 15000,
  "count": 5,
  "visible": true,
  "typeId": 1,
  "type": { ... },
  "media": [ ... ],
  "characteristic": { ... }
}
```

**Ошибки:**
- `404` - Товар не найден
- `400` - Некорректный ID

#### 3. Поиск товаров

```http
GET /api/products/search?search=кий&limit=10
```

**Параметры:**
- `search` (string, обязательно) - поисковый запрос
- `limit` (number, опционально) - максимальное количество результатов (по умолчанию: 10)

**Ответ (200):**
```json
{
  "products": [
    {
      "id": 1,
      "title": "Кий профессиональный",
      ...
    }
  ]
}
```

#### 4. Получить список типов товаров

```http
GET /api/types
```

**Ответ (200):**
```json
[
  {
    "id": 1,
    "value": "cues",
    "name": "Кии",
    "characteristicFields": [
      {
        "key": "height",
        "label": "Высота (см)",
        "type": "number",
        "placeholder": "Введите высоту"
      }
    ]
  }
]
```

#### 5. Регистрация пользователя

```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Иван Иванов",
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (201):**
```json
{
  "message": "Пользователь зарегистрирован. Проверьте почту для подтверждения."
}
```

**Ошибки:**
- `400` - Все поля обязательны
- `400` - Пароль должен быть не менее 6 символов
- `400` - Пользователь с таким email уже существует

#### 6. Подтверждение email

```http
POST /api/auth/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Ответ (200):**
```json
{
  "message": "Email подтверждён"
}
```

#### 7. Запрос сброса пароля

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Ответ (200):**
```json
{
  "message": "Письмо с инструкциями отправлено на email"
}
```

#### 8. Сброс пароля

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

**Ответ (200):**
```json
{
  "message": "Пароль успешно изменён"
}
```

---

### Защищенные эндпоинты (требуют аутентификации)

#### 9. Получить информацию о текущем пользователе

```http
GET /api/auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "fullName": "Иван Иванов",
  "role": "USER"
}
```

**Ошибки:**
- `401` - Не авторизован

#### 10. Выход

```http
POST /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "message": "Выход выполнен"
}
```

#### 11. Получить корзину

```http
GET /api/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "product": {
        "id": 1,
        "title": "Кий профессиональный",
        "price": 15000,
        "media": [...]
      }
    }
  ]
}
```

#### 12. Добавить товар в корзину

```http
POST /api/cart/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}
```

**Ответ (200):**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "product": { ... }
    }
  ]
}
```

**Ошибки:**
- `400` - Неверные данные
- `404` - Товар не найден

#### 13. Обновить количество товара в корзине

```http
POST /api/cart/update
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1,
  "quantity": 3
}
```

**Ответ (200):**
```json
{
  "id": 1,
  "items": [ ... ]
}
```

#### 14. Удалить товар из корзины

```http
POST /api/cart/remove
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "productId": 1
}
```

**Ответ (200):**
```json
{
  "id": 1,
  "items": [ ... ]
}
```

#### 15. Очистить корзину

```http
POST /api/cart/clear
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
{
  "id": 1,
  "items": []
}
```

#### 16. Создать заказ

```http
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "fullName": "Иван Иванов",
  "email": "user@example.com",
  "phone": "+79999999999",
  "address": "г. Москва, ул. Примерная, д. 1",
  "deliveryMethodId": 1,
  "comment": "Комментарий к заказу"
}
```

**Ответ (201):**
```json
{
  "id": 1,
  "orderNumber": "ORD-2024-001",
  "fullName": "Иван Иванов",
  "email": "user@example.com",
  "phone": "+79999999999",
  "address": "г. Москва, ул. Примерная, д. 1",
  "deliveryMethodId": 1,
  "deliveryMethod": {
    "id": 1,
    "name": "Курьерская доставка",
    "description": "Доставка курьером",
    "active": true
  },
  "comment": "Комментарий к заказу",
  "status": "PENDING",
  "totalAmount": 30000,
  "items": [
    {
      "id": 1,
      "productId": 1,
      "quantity": 2,
      "price": 15000,
      "product": { ... }
    }
  ],
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Ошибки:**
- `400` - Неверные данные
- `400` - Корзина пуста

#### 17. Получить список заказов пользователя

```http
GET /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (200):**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-2024-001",
    "status": "PENDING",
    "totalAmount": 30000,
    "items": [ ... ],
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

**Примечание:** Пользователи видят только свои заказы. Администраторы видят все заказы.

---

### Административные эндпоинты (требуют роль ADMIN)

#### 18. Создать товар

```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Новый товар",
  "description": "Описание товара",
  "price": 10000,
  "count": 10,
  "visible": true,
  "typeId": 1
}
```

**Ответ (201):**
```json
{
  "id": 1,
  "title": "Новый товар",
  ...
}
```

#### 19. Обновить товар

```http
PATCH /api/products/1
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Обновленное название",
  "price": 12000
}
```

**Ответ (200):**
```json
{
  "id": 1,
  "title": "Обновленное название",
  "price": 12000,
  ...
}
```

#### 20. Удалить товар

```http
DELETE /api/products/1
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ответ (204):** Без тела ответа

#### 21. Массовое удаление товаров

```http
POST /api/products/delete-many
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

[1, 2, 3]
```

**Ответ (200):**
```json
{
  "count": 3
}
```

---

## Примеры интеграции

### Telegram бот (Node.js)

```javascript
const axios = require('axios');
const TelegramBot = require('node-telegram-bot-api');

const API_BASE_URL = 'https://your-domain.com/api';
const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', { polling: true });

// Хранилище токенов пользователей
const userTokens = new Map();

// Функция для логина пользователя
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка входа');
  }
}

// Функция для получения товаров
async function getProducts(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.typeId) params.append('typeId', filters.typeId);
    if (filters.priceMin) params.append('priceMin', filters.priceMin);
    if (filters.priceMax) params.append('priceMax', filters.priceMax);
    
    const response = await axios.get(`${API_BASE_URL}/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.products;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка получения товаров');
  }
}

// Команда /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Добро пожаловать! Используйте /login для входа.');
});

// Команда /login
bot.onText(/\/login (.+) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const email = match[1];
  const password = match[2];
  
  try {
    const token = await loginUser(email, password);
    userTokens.set(chatId, token);
    bot.sendMessage(chatId, '✅ Вы успешно вошли!');
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
});

// Команда /products
bot.onText(/\/products/, async (msg) => {
  const chatId = msg.chat.id;
  const token = userTokens.get(chatId);
  
  if (!token) {
    return bot.sendMessage(chatId, '❌ Сначала выполните /login');
  }
  
  try {
    const products = await getProducts(token);
    
    if (products.length === 0) {
      return bot.sendMessage(chatId, 'Товары не найдены');
    }
    
    // Отправляем первые 10 товаров
    const message = products.slice(0, 10).map(p => 
      `🛍 ${p.title}\n💰 ${p.price.toLocaleString('ru-RU')} ₽\n📦 В наличии: ${p.count}`
    ).join('\n\n');
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
});

// Команда /search
bot.onText(/\/search (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = userTokens.get(chatId);
  const query = match[1];
  
  if (!token) {
    return bot.sendMessage(chatId, '❌ Сначала выполните /login');
  }
  
  try {
    const products = await getProducts(token, { search: query });
    
    if (products.length === 0) {
      return bot.sendMessage(chatId, 'Товары не найдены');
    }
    
    const message = products.map(p => 
      `🛍 ${p.title}\n💰 ${p.price.toLocaleString('ru-RU')} ₽`
    ).join('\n\n');
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
});

// Команда /cart
bot.onText(/\/cart/, async (msg) => {
  const chatId = msg.chat.id;
  const token = userTokens.get(chatId);
  
  if (!token) {
    return bot.sendMessage(chatId, '❌ Сначала выполните /login');
  }
  
  try {
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const cart = response.data;
    
    if (cart.items.length === 0) {
      return bot.sendMessage(chatId, '🛒 Корзина пуста');
    }
    
    const total = cart.items.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    const message = cart.items.map(item => 
      `🛍 ${item.product.title}\n   Количество: ${item.quantity}\n   Цена: ${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽`
    ).join('\n\n') + `\n\n💰 Итого: ${total.toLocaleString('ru-RU')} ₽`;
    
    bot.sendMessage(chatId, message);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
});

// Команда /add
bot.onText(/\/add (\d+) (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = userTokens.get(chatId);
  const productId = parseInt(match[1]);
  const quantity = parseInt(match[2]);
  
  if (!token) {
    return bot.sendMessage(chatId, '❌ Сначала выполните /login');
  }
  
  try {
    await axios.post(`${API_BASE_URL}/cart/add`, {
      productId,
      quantity
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    bot.sendMessage(chatId, '✅ Товар добавлен в корзину!');
  } catch (error) {
    bot.sendMessage(chatId, `❌ Ошибка: ${error.response?.data?.error || error.message}`);
  }
});
```

### VK бот (Node.js)

```javascript
const axios = require('axios');
const vk = require('@vkontakte/api');

const API_BASE_URL = 'https://your-domain.com/api';
const VK_TOKEN = 'YOUR_VK_BOT_TOKEN';

// Хранилище токенов пользователей
const userTokens = new Map();

// Функция для логина
async function loginUser(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка входа');
  }
}

// Функция для получения товаров
async function getProducts(token, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.typeId) params.append('typeId', filters.typeId);
    
    const response = await axios.get(`${API_BASE_URL}/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.products;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Ошибка получения товаров');
  }
}

// Обработка сообщений
async function handleMessage(message) {
  const userId = message.from_id;
  const text = message.text.toLowerCase();
  
  // Команда /start
  if (text === '/start' || text === 'начать') {
    await vk.messages.send({
      access_token: VK_TOKEN,
      user_id: userId,
      message: 'Добро пожаловать! Используйте /login email password для входа.'
    });
    return;
  }
  
  // Команда /login
  if (text.startsWith('/login ')) {
    const parts = message.text.split(' ');
    if (parts.length < 3) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: '❌ Используйте: /login email password'
      });
      return;
    }
    
    const email = parts[1];
    const password = parts[2];
    
    try {
      const token = await loginUser(email, password);
      userTokens.set(userId, token);
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: '✅ Вы успешно вошли!'
      });
    } catch (error) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: `❌ Ошибка: ${error.message}`
      });
    }
    return;
  }
  
  // Команда /products
  if (text === '/products' || text === 'товары') {
    const token = userTokens.get(userId);
    
    if (!token) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: '❌ Сначала выполните /login'
      });
      return;
    }
    
    try {
      const products = await getProducts(token);
      
      if (products.length === 0) {
        await vk.messages.send({
          access_token: VK_TOKEN,
          user_id: userId,
          message: 'Товары не найдены'
        });
        return;
      }
      
      const message = products.slice(0, 10).map(p => 
        `🛍 ${p.title}\n💰 ${p.price.toLocaleString('ru-RU')} ₽\n📦 В наличии: ${p.count}`
      ).join('\n\n');
      
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message
      });
    } catch (error) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: `❌ Ошибка: ${error.message}`
      });
    }
    return;
  }
  
  // Команда /search
  if (text.startsWith('/search ') || text.startsWith('найти ')) {
    const token = userTokens.get(userId);
    const query = message.text.replace(/^\/search |^найти /i, '');
    
    if (!token) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: '❌ Сначала выполните /login'
      });
      return;
    }
    
    try {
      const products = await getProducts(token, { search: query });
      
      if (products.length === 0) {
        await vk.messages.send({
          access_token: VK_TOKEN,
          user_id: userId,
          message: 'Товары не найдены'
        });
        return;
      }
      
      const message = products.map(p => 
        `🛍 ${p.title}\n💰 ${p.price.toLocaleString('ru-RU')} ₽`
      ).join('\n\n');
      
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message
      });
    } catch (error) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: `❌ Ошибка: ${error.message}`
      });
    }
    return;
  }
  
  // Команда /cart
  if (text === '/cart' || text === 'корзина') {
    const token = userTokens.get(userId);
    
    if (!token) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: '❌ Сначала выполните /login'
      });
      return;
    }
    
    try {
      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const cart = response.data;
      
      if (cart.items.length === 0) {
        await vk.messages.send({
          access_token: VK_TOKEN,
          user_id: userId,
          message: '🛒 Корзина пуста'
        });
        return;
      }
      
      const total = cart.items.reduce((sum, item) => 
        sum + (item.product.price * item.quantity), 0
      );
      
      const message = cart.items.map(item => 
        `🛍 ${item.product.title}\n   Количество: ${item.quantity}\n   Цена: ${(item.product.price * item.quantity).toLocaleString('ru-RU')} ₽`
      ).join('\n\n') + `\n\n💰 Итого: ${total.toLocaleString('ru-RU')} ₽`;
      
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message
      });
    } catch (error) {
      await vk.messages.send({
        access_token: VK_TOKEN,
        user_id: userId,
        message: `❌ Ошибка: ${error.message}`
      });
    }
    return;
  }
}

// Запуск бота
async function startBot() {
  // Настройка long polling или webhook
  // Пример с long polling
  setInterval(async () => {
    try {
      const updates = await vk.messages.getLongPollHistory({
        access_token: VK_TOKEN,
        ts: lastTs,
        wait: 25
      });
      
      if (updates.messages) {
        for (const message of updates.messages.items) {
          if (message.out === 0) { // Входящее сообщение
            await handleMessage(message);
          }
        }
      }
      
      lastTs = updates.ts;
    } catch (error) {
      console.error('Ошибка получения сообщений:', error);
    }
  }, 1000);
}

startBot();
```

### Python пример

```python
import requests
from typing import Optional, Dict, List

class BilliardAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token: Optional[str] = None
    
    def login(self, email: str, password: str) -> bool:
        """Авторизация пользователя"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"email": email, "password": password}
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("token")
            return True
        else:
            print(f"Ошибка входа: {response.json().get('error')}")
            return False
    
    def _get_headers(self) -> Dict[str, str]:
        """Получить заголовки с токеном"""
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers
    
    def get_products(self, search: Optional[str] = None, 
                    type_id: Optional[int] = None,
                    price_min: Optional[float] = None,
                    price_max: Optional[float] = None) -> List[Dict]:
        """Получить список товаров"""
        params = {}
        if search:
            params["search"] = search
        if type_id:
            params["typeId"] = type_id
        if price_min:
            params["priceMin"] = price_min
        if price_max:
            params["priceMax"] = price_max
        
        response = requests.get(
            f"{self.base_url}/products",
            params=params,
            headers=self._get_headers()
        )
        
        if response.status_code == 200:
            return response.json().get("products", [])
        else:
            raise Exception(f"Ошибка: {response.json().get('error')}")
    
    def get_product(self, product_id: int) -> Dict:
        """Получить товар по ID"""
        response = requests.get(
            f"{self.base_url}/products/{product_id}",
            headers=self._get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Ошибка: {response.json().get('error')}")
    
    def get_cart(self) -> Dict:
        """Получить корзину"""
        response = requests.get(
            f"{self.base_url}/cart",
            headers=self._get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Ошибка: {response.json().get('error')}")
    
    def add_to_cart(self, product_id: int, quantity: int = 1) -> Dict:
        """Добавить товар в корзину"""
        response = requests.post(
            f"{self.base_url}/cart/add",
            json={"productId": product_id, "quantity": quantity},
            headers=self._get_headers()
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Ошибка: {response.json().get('error')}")
    
    def create_order(self, full_name: str, email: str, phone: str,
                    address: str, delivery_method_id: int,
                    comment: Optional[str] = None) -> Dict:
        """Создать заказ"""
        response = requests.post(
            f"{self.base_url}/orders",
            json={
                "fullName": full_name,
                "email": email,
                "phone": phone,
                "address": address,
                "deliveryMethodId": delivery_method_id,
                "comment": comment
            },
            headers=self._get_headers()
        )
        
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Ошибка: {response.json().get('error')}")

# Использование
api = BilliardAPI("https://your-domain.com/api")

# Логин
if api.login("user@example.com", "password123"):
    print("Успешный вход!")
    
    # Получить товары
    products = api.get_products(search="кий")
    for product in products:
        print(f"{product['title']} - {product['price']} ₽")
    
    # Добавить в корзину
    api.add_to_cart(product_id=1, quantity=2)
    
    # Получить корзину
    cart = api.get_cart()
    print(f"Товаров в корзине: {len(cart['items'])}")
    
    # Создать заказ
    order = api.create_order(
        full_name="Иван Иванов",
        email="user@example.com",
        phone="+79999999999",
        address="г. Москва, ул. Примерная, д. 1",
        delivery_method_id=1
    )
    print(f"Заказ создан: {order['orderNumber']}")
```

---

## Обработка ошибок

### Формат ошибок

Все ошибки возвращаются в формате:

```json
{
  "error": "Сообщение об ошибке"
}
```

### Коды статусов HTTP

- `200` - Успешный запрос
- `201` - Ресурс создан
- `204` - Успешный запрос без тела ответа
- `400` - Неверный запрос (неверные данные)
- `401` - Не авторизован (отсутствует или неверный токен)
- `403` - Доступ запрещён (недостаточно прав)
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

### Примеры обработки ошибок

**JavaScript:**
```javascript
try {
  const response = await axios.get(`${API_BASE_URL}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (response.status === 401) {
    // Токен истек, нужно перелогиниться
    const newToken = await loginUser(email, password);
    // Повторить запрос с новым токеном
  }
  
  return response.data;
} catch (error) {
  if (error.response) {
    // Сервер вернул ошибку
    console.error('Ошибка API:', error.response.data.error);
    console.error('Статус:', error.response.status);
  } else {
    // Ошибка сети
    console.error('Ошибка сети:', error.message);
  }
  throw error;
}
```

**Python:**
```python
try:
    response = requests.get(
        f"{self.base_url}/cart",
        headers=self._get_headers()
    )
    
    if response.status_code == 401:
        # Токен истек, нужно перелогиниться
        self.login(email, password)
        # Повторить запрос
        response = requests.get(
            f"{self.base_url}/cart",
            headers=self._get_headers()
        )
    
    response.raise_for_status()
    return response.json()
except requests.exceptions.HTTPError as e:
    error_data = e.response.json()
    print(f"Ошибка API: {error_data.get('error')}")
    raise
except requests.exceptions.RequestException as e:
    print(f"Ошибка сети: {e}")
    raise
```

---

## Дополнительная информация

### Preflight запросы (OPTIONS)

API автоматически обрабатывает preflight запросы (OPTIONS) для CORS. Вам не нужно делать ничего дополнительно.

### Таймауты

Рекомендуется устанавливать таймауты для запросов:
- **Обычные запросы**: 10-30 секунд
- **Загрузка файлов**: 60+ секунд

### Rate Limiting

В текущей версии API не реализован rate limiting. При необходимости, ограничьте количество запросов на стороне клиента.

### Безопасность

- **Никогда не храните токены в открытом виде**
- **Используйте HTTPS для всех запросов**
- **Не передавайте токены в URL параметрах**
- **Регулярно обновляйте токены**

---

## Поддержка

При возникновении проблем:
1. Проверьте формат запроса и заголовки
2. Убедитесь, что токен действителен
3. Проверьте коды ошибок и сообщения
4. Убедитесь, что используете правильный базовый URL

---

**Версия документации:** 1.0  
**Последнее обновление:** 2024

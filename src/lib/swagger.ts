// OpenAPI 3.0 спецификация для API

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Billiard Shop API',
    version: '1.0.0',
    description: 'API для интернет-магазина бильярдного оборудования',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT токен, полученный при логине',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Сообщение об ошибке',
          },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', format: 'float' },
          count: { type: 'integer' },
          visible: { type: 'boolean' },
          typeId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          type: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              value: { type: 'string' },
              name: { type: 'string' },
            },
          },
          media: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                type: { type: 'string' },
                name: { type: 'string' },
                showOnMain: { type: 'boolean' },
              },
            },
          },
          characteristic: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              attributes: { type: 'object' },
            },
          },
        },
      },
      ProductCreate: {
        type: 'object',
        required: ['title', 'description', 'price', 'count', 'visible', 'typeId'],
        properties: {
          title: { type: 'string', example: 'Кий профессиональный' },
          description: { type: 'string', example: 'Описание товара' },
          price: { type: 'number', example: 15000 },
          count: { type: 'integer', example: 10 },
          visible: { type: 'boolean', example: true },
          typeId: { type: 'integer', example: 1 },
        },
      },
      ProductsList: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: { $ref: '#/components/schemas/Product' },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          email: { type: 'string' },
          fullName: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          token: { type: 'string', description: 'JWT токен для авторизации' },
          cart: { type: 'object' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['fullName', 'email', 'password'],
        properties: {
          fullName: { type: 'string', example: 'Иван Иванов' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 6, example: 'password123' },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          productId: { type: 'integer' },
          quantity: { type: 'integer' },
          price: { type: 'number' },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer', nullable: true },
          sessionToken: { type: 'string', nullable: true },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
          totalAmount: { type: 'number' },
        },
      },
      AddToCartRequest: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', minimum: 1, example: 2 },
          userId: { type: 'integer', nullable: true },
          sessionToken: { type: 'string', nullable: true },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          orderNumber: { type: 'string' },
          userId: { type: 'integer', nullable: true },
          fullName: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          address: { type: 'string' },
          comment: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['PENDING', 'SUCCEEDED', 'CANCELLED', 'IN_TRANSIT'] },
          totalAmount: { type: 'number' },
          deliveryMethodId: { type: 'integer', nullable: true },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'integer' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
              },
            },
          },
        },
      },
      OrderCreate: {
        type: 'object',
        required: ['items', 'fullName', 'email', 'phone', 'address', 'deliveryMethodId'],
        properties: {
          items: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['productId', 'quantity'],
              properties: {
                productId: { type: 'integer', example: 1 },
                quantity: { type: 'integer', minimum: 1, example: 2 },
              },
            },
          },
          fullName: { type: 'string', example: 'Иван Иванов' },
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          phone: { type: 'string', example: '+7 (999) 123-45-67' },
          address: { type: 'string', example: 'г. Москва, ул. Примерная, д. 1' },
          comment: { type: 'string', nullable: true, example: 'Позвонить за час до доставки' },
          deliveryMethodId: { type: 'integer', example: 1 },
          userId: { type: 'integer', nullable: true },
        },
      },
      Type: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          value: { type: 'string' },
          name: { type: 'string' },
          characteristicFields: { type: 'object', nullable: true },
        },
      },
      Media: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          type: { type: 'string' },
          name: { type: 'string' },
          publicId: { type: 'string', nullable: true },
          showOnMain: { type: 'boolean' },
          productId: { type: 'integer' },
        },
      },
      DeliveryMethod: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход в систему',
        description: 'Авторизация пользователя по email и паролю. Возвращает JWT токен.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              example: {
                email: 'user@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
                example: {
                  message: 'Успешный вход',
                  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                  cart: {},
                },
              },
            },
          },
          '400': {
            description: 'Неверные данные',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Email не подтверждён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация нового пользователя',
        description: 'Создание нового аккаунта. На email будет отправлен код подтверждения.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              example: {
                fullName: 'Иван Иванов',
                email: 'user@example.com',
                password: 'password123',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Пользователь зарегистрирован',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Подтверждение email',
        description: 'Подтверждение email по коду, отправленному при регистрации.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'code'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  code: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email подтверждён',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Неверный код',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Получить информацию о текущем пользователе',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Информация о пользователе',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Выход из системы',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Выход выполнен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Запрос сброса пароля',
        description: 'Отправка ссылки для сброса пароля на email.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Инструкция отправлена (если email зарегистрирован)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Сброс пароля',
        description: 'Установка нового пароля по токену из ссылки.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string', example: 'abc123...' },
                  password: { type: 'string', minLength: 6, example: 'newpassword123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Пароль успешно сброшен',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Неверный или истёкший токен',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Получить список товаров',
        description: 'Получение списка товаров с фильтрацией, сортировкой и пагинацией.',
        parameters: [
          {
            name: 'skip',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Количество пропущенных записей',
          },
          {
            name: 'take',
            in: 'query',
            schema: { type: 'integer', default: 20 },
            description: 'Количество записей для получения',
          },
          {
            name: 'typeId',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Фильтр по типу товара',
          },
          {
            name: 'priceMin',
            in: 'query',
            schema: { type: 'number' },
            description: 'Минимальная цена',
          },
          {
            name: 'priceMax',
            in: 'query',
            schema: { type: 'number' },
            description: 'Максимальная цена',
          },
          {
            name: 'sortBy',
            in: 'query',
            schema: { type: 'string', enum: ['title', 'price'] },
            description: 'Поле для сортировки',
          },
          {
            name: 'sortOrder',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'] },
            description: 'Порядок сортировки',
          },
        ],
        responses: {
          '200': {
            description: 'Список товаров',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductsList' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Products'],
        summary: 'Создать товар',
        description: 'Создание нового товара. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductCreate' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Товар создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '401': {
            description: 'Не авторизован',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Получить товар по ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID товара',
          },
        ],
        responses: {
          '200': {
            description: 'Информация о товаре',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '404': {
            description: 'Товар не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Products'],
        summary: 'Обновить товар',
        description: 'Обновление информации о товаре. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  count: { type: 'integer' },
                  visible: { type: 'boolean' },
                  typeId: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Товар обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Products'],
        summary: 'Удалить товар',
        description: 'Удаление товара. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Товар удалён',
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/types': {
      get: {
        tags: ['Types'],
        summary: 'Получить список типов товаров',
        responses: {
          '200': {
            description: 'Список типов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Type' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Types'],
        summary: 'Создать тип товара',
        description: 'Создание нового типа товара. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['value', 'name'],
                properties: {
                  value: { type: 'string', example: 'cues' },
                  name: { type: 'string', example: 'Кии' },
                  characteristicFields: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Тип создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Type' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Получить корзину',
        description: 'Получение корзины текущего пользователя или гостя.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Корзина',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
        },
      },
    },
    '/api/cart/add': {
      post: {
        tags: ['Cart'],
        summary: 'Добавить товар в корзину',
        description: 'Добавление товара в корзину. Можно использовать userId для авторизованных пользователей или sessionToken для гостей.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddToCartRequest' },
              example: {
                productId: 1,
                quantity: 2,
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Товар добавлен в корзину',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/cart/update': {
      post: {
        tags: ['Cart'],
        summary: 'Обновить количество товара в корзине',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId', 'quantity'],
                properties: {
                  productId: { type: 'integer', example: 1 },
                  quantity: { type: 'integer', minimum: 0, example: 3 },
                  userId: { type: 'integer', nullable: true },
                  sessionToken: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Количество обновлено',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
          '404': {
            description: 'Товар не найден в корзине',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/cart/remove': {
      post: {
        tags: ['Cart'],
        summary: 'Удалить товар из корзины',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'integer', example: 1 },
                  userId: { type: 'integer', nullable: true },
                  sessionToken: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Товар удалён из корзины',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
        },
      },
    },
    '/api/cart/clear': {
      post: {
        tags: ['Cart'],
        summary: 'Очистить корзину',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  userId: { type: 'integer', nullable: true },
                  sessionToken: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Корзина очищена',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Получить список заказов',
        description: 'Получение списка всех заказов. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Список заказов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Order' },
                },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Создать заказ',
        description: 'Создание нового заказа из корзины.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OrderCreate' },
              example: {
                items: [
                  { productId: 1, quantity: 2 },
                  { productId: 3, quantity: 1 },
                ],
                fullName: 'Иван Иванов',
                email: 'user@example.com',
                phone: '+7 (999) 123-45-67',
                address: 'г. Москва, ул. Примерная, д. 1',
                comment: 'Позвонить за час до доставки',
                deliveryMethodId: 1,
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Заказ создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Получить заказ по ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Информация о заказе',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          '404': {
            description: 'Заказ не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Orders'],
        summary: 'Обновить заказ',
        description: 'Обновление заказа. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['PENDING', 'SUCCEEDED', 'CANCELLED', 'IN_TRANSIT'] },
                  trackingCode: { type: 'string', nullable: true },
                  deliveryMethodId: { type: 'integer', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Заказ обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Order' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/types/{id}': {
      get: {
        tags: ['Types'],
        summary: 'Получить тип товара по ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Информация о типе',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Type' },
              },
            },
          },
          '404': {
            description: 'Тип не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Types'],
        summary: 'Обновить тип товара',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  value: { type: 'string' },
                  name: { type: 'string' },
                  characteristicFields: { type: 'object' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Тип обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Type' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Types'],
        summary: 'Удалить тип товара',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Тип удалён',
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/media': {
      get: {
        tags: ['Media'],
        summary: 'Получить список медиа файлов',
        parameters: [
          {
            name: 'productId',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Фильтр по ID товара',
          },
        ],
        responses: {
          '200': {
            description: 'Список медиа файлов',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Media' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Media'],
        summary: 'Создать медиа файл',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['type', 'name', 'productId'],
                properties: {
                  type: { type: 'string', example: 'image' },
                  name: { type: 'string', example: '/static/products/image.jpg' },
                  publicId: { type: 'string', nullable: true },
                  showOnMain: { type: 'boolean', example: false },
                  productId: { type: 'integer', example: 1 },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Медиа файл создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/media/{id}': {
      get: {
        tags: ['Media'],
        summary: 'Получить медиа файл по ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Информация о медиа файле',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '404': {
            description: 'Медиа файл не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Media'],
        summary: 'Обновить медиа файл',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  showOnMain: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Медиа файл обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Media'],
        summary: 'Удалить медиа файл',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Медиа файл удалён',
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/media/upload': {
      post: {
        tags: ['Media'],
        summary: 'Загрузить медиа файл',
        description: 'Загрузка медиа файла на сервер. Требуются права администратора.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'productId'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Файл для загрузки',
                  },
                  productId: {
                    type: 'integer',
                    description: 'ID товара',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Файл загружен',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Media' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/media/delete-many': {
      post: {
        tags: ['Media'],
        summary: 'Удалить несколько медиа файлов',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Файлы удалены',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/characteristics': {
      get: {
        tags: ['Characteristics'],
        summary: 'Получить список характеристик',
        parameters: [
          {
            name: 'productId',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Фильтр по ID товара',
          },
        ],
        responses: {
          '200': {
            description: 'Список характеристик',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      attributes: { type: 'object' },
                      productId: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Characteristics'],
        summary: 'Создать характеристику',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'integer', example: 1 },
                  attributes: { type: 'object', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Характеристика создана',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    attributes: { type: 'object' },
                    productId: { type: 'integer' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/characteristics/{id}': {
      get: {
        tags: ['Characteristics'],
        summary: 'Получить характеристику по ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Информация о характеристике',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    attributes: { type: 'object' },
                    productId: { type: 'integer' },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Характеристика не найдена',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Characteristics'],
        summary: 'Обновить характеристику',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  attributes: { type: 'object', nullable: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Характеристика обновлена',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer' },
                    attributes: { type: 'object' },
                    productId: { type: 'integer' },
                  },
                },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Characteristics'],
        summary: 'Удалить характеристику',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Характеристика удалена',
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/delivery-methods': {
      get: {
        tags: ['Delivery Methods'],
        summary: 'Получить список способов доставки',
        responses: {
          '200': {
            description: 'Список способов доставки',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DeliveryMethod' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Delivery Methods'],
        summary: 'Создать способ доставки',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'СДЭК' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Способ доставки создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeliveryMethod' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/delivery-methods/{id}': {
      get: {
        tags: ['Delivery Methods'],
        summary: 'Получить способ доставки по ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '200': {
            description: 'Информация о способе доставки',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeliveryMethod' },
              },
            },
          },
          '404': {
            description: 'Способ доставки не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Delivery Methods'],
        summary: 'Обновить способ доставки',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Способ доставки обновлён',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DeliveryMethod' },
              },
            },
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Delivery Methods'],
        summary: 'Удалить способ доставки',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          '204': {
            description: 'Способ доставки удалён',
          },
          '403': {
            description: 'Требуются права администратора',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/cart/merge': {
      post: {
        tags: ['Cart'],
        summary: 'Объединить корзины',
        description: 'Объединение корзины гостя с корзиной пользователя при авторизации.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'sessionToken'],
                properties: {
                  userId: { type: 'integer', example: 1 },
                  sessionToken: { type: 'string', example: 'guest-session-token' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Корзины объединены',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
          '400': {
            description: 'Ошибка валидации',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },
};

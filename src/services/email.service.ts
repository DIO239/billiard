import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.yandex.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.YANDEX_USER,
    pass: process.env.YANDEX_PASS,
  },
});

export class EmailService {
  /**
   * Отправляет email менеджеру о новом заказе
   */
  static async sendOrderNotificationToManager(orderData: {
    orderNumber: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    comment?: string | null;
    deliveryMethod?: string | null;
    items: Array<{
      product: { title: string; price: number } | null;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  }) {
    const managerEmail = process.env.MANAGER_EMAIL || process.env.YANDEX_USER;
    
    if (!managerEmail) {
      console.warn('MANAGER_EMAIL не настроен, email не будет отправлен');
      return;
    }

    // Формируем HTML таблицу с товарами
    const itemsTable = orderData.items.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.product?.title || 'Товар удален'}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.price.toLocaleString('ru-RU')} ₽</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.price * item.quantity).toLocaleString('ru-RU')} ₽</td>
      </tr>
    `).join('');

    const html = `
      <h2>Новый заказ #${orderData.orderNumber}</h2>
      <h3>Данные покупателя:</h3>
      <ul>
        <li><strong>ФИО:</strong> ${orderData.fullName}</li>
        <li><strong>Email:</strong> ${orderData.email}</li>
        <li><strong>Телефон:</strong> ${orderData.phone}</li>
        <li><strong>Адрес доставки:</strong> ${orderData.address}</li>
        ${orderData.deliveryMethod ? `<li><strong>Способ доставки:</strong> ${orderData.deliveryMethod}</li>` : ''}
        ${orderData.comment ? `<li><strong>Комментарий:</strong> ${orderData.comment}</li>` : ''}
      </ul>
      
      <h3>Товары в заказе:</h3>
      <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Товар</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Количество</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Цена за единицу</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Сумма</th>
          </tr>
        </thead>
        <tbody>
          ${itemsTable}
        </tbody>
        <tfoot>
          <tr style="background-color: #f2f2f2; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">Итого:</td>
            <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${orderData.totalAmount.toLocaleString('ru-RU')} ₽</td>
          </tr>
        </tfoot>
      </table>
    `;

    const text = `
Новый заказ #${orderData.orderNumber}

Данные покупателя:
- ФИО: ${orderData.fullName}
- Email: ${orderData.email}
- Телефон: ${orderData.phone}
- Адрес доставки: ${orderData.address}
${orderData.deliveryMethod ? `- Способ доставки: ${orderData.deliveryMethod}` : ''}
${orderData.comment ? `- Комментарий: ${orderData.comment}` : ''}

Товары в заказе:
${orderData.items.map(item => `- ${item.product?.title || 'Товар удален'}: ${item.quantity} шт. × ${item.price} ₽ = ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`).join('\n')}

Итого: ${orderData.totalAmount.toLocaleString('ru-RU')} ₽
    `;

    try {
      await transporter.sendMail({
        from: `"Billiard Shop" <${process.env.YANDEX_USER}>`,
        to: managerEmail,
        subject: `Новый заказ #${orderData.orderNumber}`,
        text,
        html,
      });
      console.log(`Email о заказе #${orderData.orderNumber} отправлен менеджеру на ${managerEmail}`);
    } catch (error) {
      console.error('Ошибка отправки email менеджеру:', error);
      // Не прерываем процесс оформления заказа, если email не отправился
    }
  }
}

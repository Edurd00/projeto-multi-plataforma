import { api } from './api.js';

export const orderService = {
  async createOrder({ name, phone, address, payment, deliveryType, cartItems, tenant }) {
    try {
      const { data: order, error } = await api.orders.create({
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        payment_method: payment,
        delivery_type: deliveryType,
        cartItems
      });

      if (error) throw error;

      // Monta a mensagem formatada para o WhatsApp do lojista
      let text = `*📦 NOVO PEDIDO RECEBIDO - #${order.id.slice(0, 8)}*\n\n`;
      text += `*👤 CLIENTE:* ${name}\n`;
      text += `*📞 TELEFONE:* ${phone}\n`;
      text += `*📍 ENDEREÇO:* ${address}\n`;
      text += `*🚚 ENTREGA:* ${deliveryType}\n`;
      text += `*💳 PAGAMENTO:* ${payment}\n\n`;
      text += `*🛒 ITENS DO PEDIDO:*\n`;

      let total = 0;
      cartItems.forEach(item => {
        const itemPrice = item.promo_price || item.price;
        const subtotal = itemPrice * item.quantity;
        total += subtotal;

        let optionStr = '';
        if (item.selectedOptions?.size) optionStr += ` (${item.selectedOptions.size})`;
        if (item.selectedOptions?.color) optionStr += ` [${item.selectedOptions.color}]`;

        text += `• ${item.quantity}x ${item.title}${optionStr} - R$ ${subtotal.toFixed(2)}\n`;
      });

      text += `\n*💰 RESUMO DOS VALORES:*\n`;
      text += `*Subtotal:* R$ ${total.toFixed(2)}\n`;
      text += `*TOTAL:* R$ ${total.toFixed(2)}\n`;

      const merchantPhone = tenant?.phone ? tenant.phone.replace(/\D/g, '') : '5511999999999';
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/${merchantPhone}?text=${encodedText}`;

      // Abre a API do Whatsapp em uma nova guia
      window.open(whatsappUrl, '_blank');

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error('Erro ao registrar pedido:', error.message);
      return { success: false, error: error.message };
    }
  }
};

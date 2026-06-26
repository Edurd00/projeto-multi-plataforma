import { supabase } from '../config/supabase.js';

export const orderService = {
  async createOrder({ customerName, customerPhone, deliveryAddress, paymentMethod, cartItems, tenant }) {
    try {
      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      const deliveryFee = cartItems.reduce((max, item) => {
        const rawShipping = item.shipping_fee ?? item.product?.shipping_fee ?? 0;
        return rawShipping > max ? rawShipping : max;
      }, 0);

      const subtotal = cartItems.reduce((sum, item) => {
        const prod = item.product || item;
        const price = prod.promo_price && prod.promo_price < prod.price ? prod.promo_price : prod.price;
        return sum + (price * item.quantity);
      }, 0);

      const totalAmount = subtotal + deliveryFee;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select().single();

      if (orderError) throw orderError;

      const itemsToInsert = cartItems.map(item => {
        const prod = item.product || item;
        const unitPrice = prod.promo_price && prod.promo_price < prod.price ? prod.promo_price : prod.price;
        return {
          order_id: order.id,
          product_id: prod.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          selected_attributes: item.selectedAttributes || {}
        };
      });

      await supabase.from('order_items').insert(itemsToInsert);

      let text = `*📦 NOVO PEDIDO RECEBIDO*\n`;
      text += `----------------------------------------\n`;
      text += `*Cliente:* ${customerName}\n`;
      text += `*Telefone:* ${customerPhone}\n`;
      text += `----------------------------------------\n`;
      text += `*🛒 ITENS DO PEDIDO:*\n`;

      cartItems.forEach(item => {
        const prod = item.product || item;
        const unitPrice = prod.promo_price && prod.promo_price < prod.price ? prod.promo_price : prod.price;
        text += `${item.quantity}x ${prod.title} - ${formatCurrency(unitPrice)}\n`;
        if (item.selectedAttributes?.size) text += `- Tamanho selecionado: ${item.selectedAttributes.size}\n`;
        if (item.selectedAttributes?.color) text += `- Cor selecionada: ${item.selectedAttributes.color}\n`;
      });

      text += `----------------------------------------\n`;
      text += `*💰 RESUMO DOS VALORES:*\n`;
      text += `Subtotal: ${formatCurrency(subtotal)}\n`;
      text += `Taxa de Entrega: ${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}\n`;
      text += `*TOTAL DO PEDIDO: ${formatCurrency(totalAmount)}*\n`;
      text += `----------------------------------------\n`;
      text += `*📍 DADOS DE ENTREGA / PAGAMENTO:*\n`;
      text += `Forma de Pagamento: ${paymentMethod}\n`;
      text += `Tipo: ${deliveryAddress ? 'Delivery' : 'Retirada'}\n`;
      text += `Endereço: ${deliveryAddress || 'Retirada no Local'}\n`;

      const cleanPhone = tenant.whatsapp_number.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error(error);
      alert("Erro ao processar pedido.");
      return { success: false };
    }
  }
};

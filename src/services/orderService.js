import { supabase } from '../config/supabase.js';

export const orderService = {
  /**
   * Persiste o pedido de forma transacional e dispara para o WhatsApp do lojista
   */
  async createOrder({ customerName, customerPhone, deliveryAddress, paymentMethod, cartItems, tenant }) {
    try {
      const formatCurrency = (value) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

      // 1. LÓGICA DINÂMICA: Varre o carrinho e encontra o MAIOR frete cadastrado entre os itens
      const deliveryFee = cartItems.reduce((max, item) => {
        // Fallback seguro caso o campo venha do objeto raiz ou de dentro da propriedade .product
        const rawShipping = item.shipping_fee ?? item.product?.shipping_fee ?? 0;
        const itemShipping = parseFloat(rawShipping) || 0;
        return itemShipping > max ? itemShipping : max;
      }, 0);

      // 2. Calcula o subtotal dos produtos considerando preços promocionais ativos
      const subtotal = cartItems.reduce((sum, item) => {
        const productData = item.product || item; // Garante o mapeamento correto do objeto
        const price = productData.promo_price && productData.promo_price < productData.price
          ? productData.promo_price
          : productData.price;
        return sum + (price * item.quantity);
      }, 0);

      // Soma o subtotal ao maior frete encontrado para gerar o montante final
      const totalAmount = subtotal + deliveryFee;

      // 3. Insere o registro central na tabela 'orders'
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
        .select()
        .single();

      if (orderError) throw orderError;

      // 4. Prepara o lote de inserção (Bulk Insert) na tabela 'order_items'
      const itemsToInsert = cartItems.map(item => {
        const productData = item.product || item;
        const unitPrice = productData.promo_price && productData.promo_price < productData.price
          ? productData.promo_price
          : productData.price;

        return {
          order_id: order.id,
          product_id: productData.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          selected_attributes: item.selectedAttributes || {}
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 5. SERIALIZAÇÃO E MONTAGEM DO COMPROVANTE DO WHATSAPP
      let text = `*NOVO PEDIDO CONFIRMADO!* 🚀\n\n`;
      text += `*Cliente:* ${customerName}\n`;
      text += `*Telefone:* ${customerPhone}\n`;
      text += `*Endereço:* ${deliveryAddress || 'Retirada no Local'}\n`;
      text += `*Pagamento:* ${paymentMethod}\n`;
      text += `----------------------------------\n`;
      text += `*ITENS DO PEDIDO:*\n`;

      cartItems.forEach(item => {
        const productData = item.product || item;
        const unitPrice = productData.promo_price && productData.promo_price < productData.price
          ? productData.promo_price
          : productData.price;

        // Verifica se existem atributos (como o tamanho)
        let attrsText = "";
        if (item.selectedAttributes && Object.keys(item.selectedAttributes).length > 0) {
          attrsText = Object.entries(item.selectedAttributes)
            .map(([k, v]) => `(${v})`)
            .join(' ');
        }

        text += `• ${item.quantity}x ${productData.title} ${attrsText} - ${formatCurrency(unitPrice * item.quantity)}\n`;
      });

      // Configuração inteligente do texto do frete no comprovante do lojista
      const deliveryText = deliveryFee > 0
        ? formatCurrency(deliveryFee)
        : 'A combinar / Grátis via Chat 💬';

      text += `----------------------------------\n`;
      text += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
      text += `*Taxa de Entrega:* ${deliveryText}\n`;
      text += `*TOTAL:* ${formatCurrency(totalAmount)}\n\n`;
      text += `_Pedido registrado automaticamente sob ID: ${order.id.slice(0, 8).toUpperCase()}_`;

      // 6. REDIRECIONAMENTO VIA ENCODING URL SEGURO
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${tenant.whatsapp_number}&text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');

      return { success: true, orderId: order.id };
    } catch (error) {
      console.error("Falha na transação do pedido:", error.message);
      alert("Houve um erro interno ao processar seu pedido. Tente novamente.");
      return { success: false };
    }
  }
};
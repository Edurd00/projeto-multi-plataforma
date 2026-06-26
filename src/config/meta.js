export function updateMetaTags(tenant) {
  if (!tenant) return;

  const title = `${tenant.store_name || 'Loja'} | Catálogo Digital & Pedidos via WhatsApp`;
  const description = "Confira nossos produtos e faça seu pedido online direto pelo WhatsApp de forma rápida e segura!";
  const image = tenant.logo_url || tenant.hero_image_url || "";

  document.title = title;

  const metaTags = {
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:type': 'website',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  };

  Object.entries(metaTags).forEach(([property, content]) => {
    let element = document.querySelector(`meta[property="${property}"]`) ||
                  document.querySelector(`meta[name="${property}"]`);

    if (!element) {
      element = document.createElement('meta');
      if (property.startsWith('og:')) {
        element.setAttribute('property', property);
      } else {
        element.setAttribute('name', property);
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  });
}

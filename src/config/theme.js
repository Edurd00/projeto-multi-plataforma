export const injectTheme = (primaryHex, secondaryHex) => {
  const root = document.documentElement;
  
  if (primaryHex) {
    root.style.setProperty('--color-primary', primaryHex);
  }
  if (secondaryHex) {
    root.style.setProperty('--color-secondary', secondaryHex);
  }
};


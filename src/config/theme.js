export const injectTheme = (primaryHex, secondaryHex) => {
  const root = document.documentElement;
  
  if (primaryHex) {
    root.style.setProperty('--color-primary', primaryHex);
    root.style.setProperty('--cor-primaria', primaryHex);
  }
  if (secondaryHex) {
    root.style.setProperty('--color-secondary', secondaryHex);
    root.style.setProperty('--cor-secondary', secondaryHex);
  }
};

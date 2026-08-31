export const Toast = {
  container: null,

  init() {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-xs w-full pointer-events-none px-4 sm:px-0';
    document.body.appendChild(this.container);
  },

  show(message, type = 'success', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 transform translate-y-4 opacity-0 ${
      type === 'success' ? 'bg-emerald-900/90 text-white border-emerald-700 backdrop-blur-md' :
      type === 'info' ? 'bg-gray-900/90 text-white border-gray-700 backdrop-blur-md' :
      'bg-red-900/90 text-white border-red-700 backdrop-blur-md'
    }`;

    const icon = type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '⚠';

    toast.innerHTML = `
      <span class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold shrink-0">${icon}</span>
      <span class="flex-1 text-xs sm:text-sm leading-tight">${message}</span>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
};

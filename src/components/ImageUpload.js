import { supabase } from '../config/supabase.js';

export const ImageUpload = {
  render(id, currentUrl = '', label = 'Carregar Imagem') {
    return `
      <div class="space-y-2" id="container-${id}">
        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">${label}</label>
        <div class="flex items-center gap-4">
          <div class="relative w-20 h-20 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group">
            ${currentUrl
              ? `<img src="${currentUrl}" id="preview-${id}" class="w-full h-full object-cover" />`
              : `<div id="placeholder-${id}" class="text-gray-300">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </div>`
            }
            <div id="loading-${id}" class="absolute inset-0 bg-white/80 items-center justify-center hidden">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-lojaPrimaria border-t-transparent"></div>
            </div>
          </div>
          <div class="flex-grow space-y-2">
            <input type="file" id="input-${id}" accept="image/*" class="hidden" />
            <button type="button" onclick="document.getElementById('input-${id}').click()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2 px-4 rounded-lg transition">
              Selecionar Arquivo
            </button>

            <div id="progress-container-${id}" class="hidden w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
               <div id="progress-bar-${id}" class="bg-lojaPrimaria h-full w-0 transition-all duration-300"></div>
            </div>

            <p class="text-[10px] text-gray-400 mt-1">PNG, JPG ou WEBP. Auto-compressão ativa.</p>
            <input type="hidden" id="url-${id}" value="${currentUrl}" />
          </div>
        </div>
      </div>
    `;
  },

  async compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1080;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.75);
        };
      };
    });
  },

  bindEvents(id, onUploadComplete) {
    const input = document.getElementById(`input-${id}`);
    const loading = document.getElementById(`loading-${id}`);
    const previewContainer = document.getElementById(`container-${id}`).querySelector('.relative');
    const urlInput = document.getElementById(`url-${id}`);
    const progressContainer = document.getElementById(`progress-container-${id}`);
    const progressBar = document.getElementById(`progress-bar-${id}`);

    if (input) {
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        loading.classList.remove('hidden');
        loading.classList.add('flex');
        progressContainer.classList.remove('hidden');
        progressBar.style.width = '20%';

        try {
          const compressedBlob = await this.compressImage(file);
          progressBar.style.width = '50%';

          const fileName = `${Math.random().toString(36).substring(2)}.jpg`;
          const filePath = `uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('loja')
            .upload(filePath, compressedBlob);

          if (uploadError) throw uploadError;

          progressBar.style.width = '100%';
          const { data: { publicUrl } } = supabase.storage
            .from('loja')
            .getPublicUrl(filePath);

          urlInput.value = publicUrl;

          previewContainer.innerHTML = `
            <img src="${publicUrl}" id="preview-${id}" class="w-full h-full object-cover" />
            <div id="loading-${id}" class="absolute inset-0 bg-white/80 items-center justify-center hidden">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-lojaPrimaria border-t-transparent"></div>
            </div>
          `;

          if (onUploadComplete) onUploadComplete(publicUrl);

        } catch (error) {
          console.error('Erro no upload:', error.message);
          alert('Erro ao carregar imagem: ' + error.message);
        } finally {
          loading.classList.add('hidden');
          loading.classList.remove('flex');
          setTimeout(() => {
            progressContainer.classList.add('hidden');
            progressBar.style.width = '0%';
          }, 1000);
        }
      };
    }
  }
};

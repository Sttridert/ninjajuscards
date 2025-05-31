<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <header class="modal-header">
        <h3>Create New Deck</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </header>

      <form @submit.prevent="createDeck" class="deck-form">
        <div class="form-group">
          <label for="deck-name">Deck Name</label>
          <input
            id="deck-name"
            v-model="form.name"
            type="text"
            placeholder="Enter deck name..."
            required
            autofocus
          >
        </div>

        <div class="form-group">
          <label for="deck-description">Description (optional)</label>
          <textarea
            id="deck-description"
            v-model="form.description"
            placeholder="Describe what this deck covers..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="folder-select">Folder</label>
          <select id="folder-select" v-model="form.folderId" required>
            <option value="">Select a folder</option>
            <option 
              v-for="folder in folders" 
              :key="folder.id" 
              :value="folder.id"
            >
              {{ folder.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Deck Color</label>
          <div class="color-picker">
            <div
              v-for="color in colorOptions"
              :key="color.value"
              class="color-option"
              :class="{ active: form.color === color.value }"
              :style="{ backgroundColor: color.value }"
              @click="form.color = color.value"
              :title="color.name"
            >
              <i v-if="form.color === color.value" class="fas fa-check"></i>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn secondary">
            Cancel
          </button>
          <button type="submit" :disabled="!isFormValid || creating" class="btn primary">
            <i v-if="creating" class="fas fa-spinner fa-spin"></i>
            {{ creating ? 'Creating...' : 'Create Deck' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useStudyStore } from '../stores/index.js'

export default {
  name: 'DeckForm',
  props: {
    folders: {
      type: Array,
      required: true
    }
  },

  emits: ['close', 'created'],

  data() {
    return {
      form: {
        name: '',
        description: '',
        folderId: '',
        color: '#E3F2FD'
      },
      creating: false,
      colorOptions: [
        { name: 'Light Blue', value: '#E3F2FD' },
        { name: 'Light Purple', value: '#F3E5F5' },
        { name: 'Light Green', value: '#E8F5E8' },
        { name: 'Light Orange', value: '#FFF3E0' },
        { name: 'Light Pink', value: '#FCE4EC' },
        { name: 'Light Cyan', value: '#E0F2F1' },
        { name: 'Light Yellow', value: '#FFFDE7' },
        { name: 'Light Gray', value: '#F5F5F5' }
      ]
    }
  },

  computed: {
    isFormValid() {
      return this.form.name.trim() && this.form.folderId
    }
  },

  mounted() {
    this.store = useStudyStore()
  },

  methods: {
    async createDeck() {
      if (!this.isFormValid || this.creating) return

      this.creating = true

      try {
        await this.store.createDeck({
          name: this.form.name.trim(),
          description: this.form.description.trim(),
          folder_id: parseInt(this.form.folderId),
          color: this.form.color
        })

        this.$emit('created')
      } catch (error) {
        alert('Failed to create deck: ' + error.message)
      } finally {
        this.creating = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 10px 30px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border-200);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-900);
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--gray-100);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-600);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--gray-200);
  color: var(--text-900);
}

.deck-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-900);
  font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-200);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
  background: var(--gray-50);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(138, 173, 244, 0.1);
}

.form-group textarea {
  resize: vertical;
  line-height: 1.5;
}

.color-picker {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.color-option {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 3px solid transparent;
  position: relative;
}

.color-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-option.active {
  border-color: var(--primary-500);
  transform: scale(1.1);
}

.color-option i {
  color: var(--text-700);
  font-size: 1.2rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--border-200);
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn.secondary {
  background: var(--gray-200);
  color: var(--text-700);
}

.btn.secondary:hover {
  background: var(--gray-300);
  color: var(--text-900);
}

.btn.primary {
  background: var(--primary-600);
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: var(--primary-700);
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal {
    margin: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 16px;
  }
  
  .deck-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .color-picker {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>

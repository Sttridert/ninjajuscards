<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <header class="modal-header">
        <h3>{{ editingCard ? 'Edit Card' : 'Add New Card' }}</h3>
        <button @click="$emit('close')" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </header>

      <form @submit.prevent="saveCard" class="card-form">
        <div class="form-group">
          <label for="front">Front Side</label>
          <textarea
            id="front"
            v-model="form.front"
            placeholder="Enter the question or prompt..."
            rows="4"
            required
            autofocus
          ></textarea>
          <small class="form-help">
            Tip: Use **bold** and *italic* for formatting
          </small>
        </div>

        <div class="form-group">
          <label for="back">Back Side</label>
          <textarea
            id="back"
            v-model="form.back"
            placeholder="Enter the answer or explanation..."
            rows="4"
            required
          ></textarea>
        </div>

        <!-- Preview -->
        <div v-if="form.front || form.back" class="card-preview">
          <h4>Preview</h4>
          <div class="preview-container">
            <StudyCard
              :card="previewCard"
              :interactive="false"
              :show-back="showPreviewBack"
              @flip="showPreviewBack = !showPreviewBack"
            />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn secondary">
            Cancel
          </button>
          <button type="submit" :disabled="!isFormValid" class="btn primary">
            {{ editingCard ? 'Save Changes' : 'Create Card' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { useStudyStore } from '../stores/index.js'
import StudyCard from './StudyCard.vue'

export default {
  name: 'CardForm',
  components: {
    StudyCard
  },
  
  props: {
    deckId: {
      type: Number,
      required: true
    },
    editingCard: {
      type: Object,
      default: null
    }
  },

  emits: ['close', 'saved'],

  data() {
    return {
      form: {
        front: '',
        back: ''
      },
      showPreviewBack: false,
      saving: false
    }
  },

  computed: {
    isFormValid() {
      return this.form.front.trim() && this.form.back.trim()
    },

    previewCard() {
      return {
        id: 0,
        front: this.form.front || 'Front side preview...',
        back: this.form.back || 'Back side preview...',
        deck_id: this.deckId
      }
    }
  },

  mounted() {
    this.store = useStudyStore()
    
    // If editing, populate form with existing card data
    if (this.editingCard) {
      this.form.front = this.editingCard.front
      this.form.back = this.editingCard.back
    }
  },

  methods: {
    async saveCard() {
      if (!this.isFormValid || this.saving) return

      this.saving = true
      
      try {
        if (this.editingCard) {
          // Update existing card
          await this.store.updateCard(this.editingCard.id, {
            front: this.form.front.trim(),
            back: this.form.back.trim()
          })
        } else {
          // Create new card
          await this.store.createCard({
            deck_id: this.deckId,
            front: this.form.front.trim(),
            back: this.form.back.trim()
          })
        }

        this.$emit('saved')
      } catch (error) {
        alert('Failed to save card: ' + error.message)
      } finally {
        this.saving = false
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

.card-form {
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

.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-200);
  border-radius: 12px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;
  font-family: inherit;
  background: var(--gray-50);
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  background: white;
  box-shadow: 0 0 0 3px rgba(138, 173, 244, 0.1);
}

.form-help {
  display: block;
  margin-top: 6px;
  font-size: 0.8rem;
  color: var(--text-600);
  font-style: italic;
}

.card-preview {
  margin-bottom: 24px;
  padding: 20px;
  background: var(--primary-25);
  border-radius: 12px;
  border: 1px solid var(--primary-100);
}

.card-preview h4 {
  margin: 0 0 16px 0;
  font-size: 1rem;
  color: var(--text-900);
  font-weight: 600;
}

.preview-container {
  display: flex;
  justify-content: center;
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

.btn.primary:hover {
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
    max-height: calc(100vh - 20px);
  }
  
  .modal-header {
    padding: 20px 20px 16px;
  }
  
  .card-form {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

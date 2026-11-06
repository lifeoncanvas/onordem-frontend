import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CreationDraft, CreationFormState, CreationType } from "@/types/create";

const STORAGE_KEY = "@honour-your-mentor/creation-drafts";
type Listener = () => void;

class CreationDraftService {
  private drafts: CreationDraft[] = [];
  private listeners = new Set<Listener>();
  private initializePromise: Promise<void> | null = null;
  private persistenceQueue: Promise<void> = Promise.resolve();

  initialize(): Promise<void> {
    if (!this.initializePromise) {
      this.initializePromise = AsyncStorage.getItem(STORAGE_KEY)
        .then((stored) => {
          if (!stored) return;
          const parsed: unknown = JSON.parse(stored);
          if (!Array.isArray(parsed) || !parsed.every(isCreationDraft)) {
            throw new Error("The saved creation drafts are invalid.");
          }
          this.drafts = parsed;
          this.notify();
        })
        .catch((error: unknown) => {
          this.initializePromise = null;
          throw error;
        });
    }
    return this.initializePromise;
  }

  getDrafts(): CreationDraft[] {
    return this.drafts.map(cloneDraft);
  }

  getDraftById(id: string): CreationDraft | undefined {
    const draft = this.drafts.find((item) => item.id === id);
    return draft ? cloneDraft(draft) : undefined;
  }

  saveDraft(draft: CreationDraft): Promise<void> {
    const index = this.drafts.findIndex((item) => item.id === draft.id);
    if (index >= 0) this.drafts[index] = draft;
    else this.drafts.unshift(draft);
    this.notify();
    return this.persist();
  }

  removeDraft(id: string): Promise<void> {
    this.drafts = this.drafts.filter((draft) => draft.id !== id);
    this.notify();
    return this.persist();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Error in CreationDraftService listener:", error);
      }
    });
  }

  private persist(): Promise<void> {
    const serialized = JSON.stringify(this.drafts);
    this.persistenceQueue = this.persistenceQueue
      .catch(() => undefined)
      .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));
    return this.persistenceQueue;
  }
}

function isCreationDraft(value: unknown): value is CreationDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<CreationDraft>;
  return (
    typeof draft.id === "string" &&
    isCreationType(draft.type) &&
    typeof draft.title === "string" &&
    typeof draft.mentorName === "string" &&
    typeof draft.previewText === "string" &&
    typeof draft.lastEdited === "string" &&
    (draft.formData === undefined || isCreationFormState(draft.formData))
  );
}

function isCreationFormState(value: unknown): value is CreationFormState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const form = value as Partial<CreationFormState>;
  return (
    isCreationType(form.type) &&
    typeof form.mentorName === "string" &&
    typeof form.relationship === "string" &&
    typeof form.title === "string" &&
    typeof form.body === "string" &&
    (form.decorations === undefined ||
      (Array.isArray(form.decorations) &&
        form.decorations.every((item) => typeof item === "string")))
  );
}

function cloneDraft(draft: CreationDraft): CreationDraft {
  return {
    ...draft,
    formData: draft.formData
      ? {
          ...draft.formData,
          decorations: draft.formData.decorations
            ? [...draft.formData.decorations]
            : undefined,
        }
      : undefined,
  };
}

function isCreationType(value: unknown): value is CreationType {
  return value === "tribute" || value === "memory" || value === "letter" || value === "lesson";
}

export const creationDraftService = new CreationDraftService();

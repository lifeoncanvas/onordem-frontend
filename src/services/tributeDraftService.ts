import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TributeDesignState,
  TributeDraft,
  TributePayload,
  TributeRelationship,
} from "@/types/create";
import { api } from "./api";

let currentPayload: TributePayload | null = null;
let currentDesignState: TributeDesignState | null = null;
const savedKeepsakes: TributeDesignState[] = [];
const tributeDrafts: TributeDraft[] = [];
const listeners = new Set<() => void>();
const STORAGE_KEY = "@honour-your-mentor/tributes";
let initializePromise: Promise<void> | null = null;
let persistenceQueue: Promise<void> = Promise.resolve();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const copyDesign = (design: TributeDesignState): TributeDesignState => ({
  ...design,
  decorations: [...design.decorations],
});

export const tributeDraftService = {
  initialize(): Promise<void> {
    if (!initializePromise) {
      initializePromise = AsyncStorage.getItem(STORAGE_KEY)
        .then((stored) => {
          if (!stored) return;
          const parsed: unknown = JSON.parse(stored);
          if (!parsed || typeof parsed !== "object") {
            throw new Error("The saved tribute collection is invalid.");
          }
          const data = parsed as {
            keepsakes?: unknown;
            drafts?: unknown;
          };
          if (
            (data.keepsakes !== undefined &&
              (!Array.isArray(data.keepsakes) ||
                !data.keepsakes.every(isTributeDesignState))) ||
            (data.drafts !== undefined &&
              (!Array.isArray(data.drafts) ||
                !data.drafts.every(isTributeDraft)))
          ) {
            throw new Error("The saved tribute collection is invalid.");
          }
          const keepsakes = (data.keepsakes ?? []) as TributeDesignState[];
          const drafts = (data.drafts ?? []) as TributeDraft[];
          savedKeepsakes.splice(0, savedKeepsakes.length, ...keepsakes);
          tributeDrafts.splice(0, tributeDrafts.length, ...drafts);
          notify();
        })
        .catch((error: unknown) => {
          initializePromise = null;
          throw error;
        });
    }
    return initializePromise;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // Input payload from Create Tribute Details
  setPayload(payload: TributePayload) {
    currentPayload = { ...payload };
  },

  getPayload(): TributePayload | null {
    return currentPayload;
  },

  clearPayload() {
    currentPayload = null;
  },

  // Active design state in Tribute Design Studio & Preview
  setDesignState(design: TributeDesignState) {
    currentDesignState = copyDesign(design);
  },

  getDesignState(): TributeDesignState | null {
    return currentDesignState;
  },

  // Completed & Saved Keepsakes
  async saveCompletedTribute(tribute: TributeDesignState): Promise<void> {
    await this.initialize();
    const existingIndex = savedKeepsakes.findIndex((k) => k.id === tribute.id);
    const previousKeepsakes = [...savedKeepsakes];
    const previousDrafts = [...tributeDrafts];
    if (existingIndex >= 0) {
      savedKeepsakes[existingIndex] = copyDesign(tribute);
    } else {
      savedKeepsakes.unshift(copyDesign(tribute));
    }
    const draftIndex = tributeDrafts.findIndex((draft) => draft.id === tribute.id);
    if (draftIndex >= 0) tributeDrafts.splice(draftIndex, 1);
    try {
      await persistCollections();
    } catch (error) {
      savedKeepsakes.splice(0, savedKeepsakes.length, ...previousKeepsakes);
      tributeDrafts.splice(0, tributeDrafts.length, ...previousDrafts);
      throw error;
    }
    notify();

    // Asynchronously synchronize to Spring Boot backend + Neon DB
    api.tributes
      .create({
        mentorName: tribute.mentorName,
        kind: "tribute",
        title: tribute.customTitle || `In Honour of ${tribute.mentorName}`,
        relationship: tribute.relationship,
        photoUri: tribute.photoUri,
        quote: tribute.quote,
        story: tribute.story,
        templateId: tribute.templateId,
        frameStyle: tribute.frameStyle,
        typographyStyle: tribute.typographyStyle,
        privacy: "PUBLIC",
      })
      .catch((err) => {
        console.debug("Completed tribute backend sync:", err);
      });
  },

  getSavedKeepsakes(): TributeDesignState[] {
    return savedKeepsakes.map(copyDesign);
  },

  getSavedKeepsakeById(id: string): TributeDesignState | undefined {
    const keepsake = savedKeepsakes.find((item) => item.id === id);
    return keepsake ? copyDesign(keepsake) : undefined;
  },

  updateSavedKeepsake(
    id: string,
    updates: Partial<Pick<TributeDesignState, "customTitle" | "story" | "quote">>
  ): boolean {
    const index = savedKeepsakes.findIndex((item) => item.id === id);
    if (index < 0) return false;
    savedKeepsakes[index] = { ...savedKeepsakes[index], ...updates };
    persistInBackground();
    notify();
    return true;
  },

  updateMentorReferences(
    previousName: string,
    name: string,
    relationship?: TributeRelationship
  ): void {
    const previous = previousName.trim().toLowerCase();
    let changed = false;
    const updatePayload = (payload: TributePayload): TributePayload => {
      if (payload.mentorName.trim().toLowerCase() !== previous) return payload;
      changed = true;
      return {
        ...payload,
        mentorName: name,
        relationship: relationship || payload.relationship,
      };
    };
    const updateDesign = (
      design: TributeDesignState | null
    ): TributeDesignState | null => {
      if (!design || design.mentorName.trim().toLowerCase() !== previous) return design;
      changed = true;
      return {
        ...design,
        mentorName: name,
        relationship: relationship || design.relationship,
      };
    };

    if (currentPayload) currentPayload = updatePayload(currentPayload);
    if (currentDesignState) currentDesignState = updateDesign(currentDesignState);
    for (const keepsake of savedKeepsakes) {
      const updated = updateDesign(keepsake);
      if (updated) Object.assign(keepsake, updated);
    }
    for (const draft of tributeDrafts) {
      draft.payload = updatePayload(draft.payload);
      draft.designState = updateDesign(draft.designState);
    }
    if (changed) {
      persistInBackground();
      notify();
    }
  },

  removeSavedKeepsake(id: string): boolean {
    const index = savedKeepsakes.findIndex((item) => item.id === id);
    if (index < 0) return false;
    savedKeepsakes.splice(index, 1);
    persistInBackground();
    notify();
    return true;
  },

  async saveDraft(
    payload: TributePayload,
    designState?: TributeDesignState | null
  ): Promise<TributeDraft> {
    await this.initialize();
    const previousDrafts = [...tributeDrafts];
    const draft: TributeDraft = {
      id: payload.id,
      payload: { ...payload },
      designState: designState ? copyDesign(designState) : null,
      updatedAt: new Date().toISOString(),
    };
    const index = tributeDrafts.findIndex((item) => item.id === draft.id);
    if (index >= 0) {
      tributeDrafts[index] = draft;
    } else {
      tributeDrafts.unshift(draft);
    }
    try {
      await persistCollections();
    } catch (error) {
      tributeDrafts.splice(0, tributeDrafts.length, ...previousDrafts);
      throw error;
    }
    notify();
    return { ...draft, payload: { ...draft.payload } };
  },

  getDrafts(): TributeDraft[] {
    return tributeDrafts.map((draft) => ({
      ...draft,
      payload: { ...draft.payload },
      designState: draft.designState ? copyDesign(draft.designState) : null,
    }));
  },

  getDraftById(id: string): TributeDraft | undefined {
    const draft = tributeDrafts.find((item) => item.id === id);
    return draft
      ? {
          ...draft,
          payload: { ...draft.payload },
          designState: draft.designState ? copyDesign(draft.designState) : null,
        }
      : undefined;
  },

  removeDraft(id: string): boolean {
    const index = tributeDrafts.findIndex((item) => item.id === id);
    if (index < 0) return false;
    tributeDrafts.splice(index, 1);
    persistInBackground();
    notify();
    return true;
  },
};

async function persistCollections(): Promise<void> {
  const serialized = JSON.stringify({
    keepsakes: savedKeepsakes,
    drafts: tributeDrafts,
  });
  persistenceQueue = persistenceQueue
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized));
  await persistenceQueue;
}

function persistInBackground(): void {
  persistCollections().catch((error: unknown) => {
    console.error("Unable to persist tribute collection changes:", error);
  });
}

function isTributeDesignState(value: unknown): value is TributeDesignState {
  if (!value || typeof value !== "object") return false;
  const tribute = value as Partial<TributeDesignState>;
  return (
    typeof tribute.id === "string" &&
    typeof tribute.mentorName === "string" &&
    typeof tribute.relationship === "string" &&
    typeof tribute.photoUri === "string" &&
    typeof tribute.story === "string" &&
    Array.isArray(tribute.decorations) &&
    typeof tribute.createdAt === "string"
  );
}

function isTributeDraft(value: unknown): value is TributeDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<TributeDraft>;
  return (
    typeof draft.id === "string" &&
    typeof draft.updatedAt === "string" &&
    !!draft.payload &&
    typeof draft.payload.mentorName === "string" &&
    typeof draft.payload.story === "string"
  );
}

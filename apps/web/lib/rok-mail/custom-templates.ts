// Officer-managed mail templates, shared kingdom-wide.
//
// Stored as ONE JSON array in the existing dkp_config key-value table
// (row id 'mail-templates') — reuses proven read/write helpers and RLS, so
// no new table or migration is needed. Volume is tiny (a few dozen text
// templates), so last-write-wins on the whole array is acceptable.

import { loadConfigRow, saveConfigRow } from '@/app/dkp/data';
import type { MailTemplate, TemplateCategory } from './templates';

const ROW_ID = 'mail-templates';

export interface CustomMailTemplate extends MailTemplate {
  custom: true;
  createdAt: string;
}

interface Store {
  templates: CustomMailTemplate[];
}

export async function loadCustomTemplates(): Promise<CustomMailTemplate[]> {
  try {
    const store = await loadConfigRow<Store>(ROW_ID);
    return store?.templates ?? [];
  } catch (e) {
    console.error('loadCustomTemplates failed', e);
    return [];
  }
}

/** Add a template and persist. Returns the updated list (or an error). */
export async function addCustomTemplate(data: {
  name: string;
  description: string;
  category: TemplateCategory;
  content: string;
}): Promise<{ templates: CustomMailTemplate[] | null; error: string | null }> {
  try {
    const existing = await loadCustomTemplates();
    const tpl: CustomMailTemplate = {
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      content: data.content,
      custom: true,
      createdAt: new Date().toISOString(),
    };
    const templates = [...existing, tpl];
    await saveConfigRow<Store>(ROW_ID, { templates });
    return { templates, error: null };
  } catch (e) {
    return { templates: null, error: e instanceof Error ? e.message : 'save failed' };
  }
}

/** Delete a custom template by id and persist. Returns the updated list. */
export async function deleteCustomTemplate(
  id: string,
): Promise<{ templates: CustomMailTemplate[] | null; error: string | null }> {
  try {
    const existing = await loadCustomTemplates();
    const templates = existing.filter((t) => t.id !== id);
    await saveConfigRow<Store>(ROW_ID, { templates });
    return { templates, error: null };
  } catch (e) {
    return { templates: null, error: e instanceof Error ? e.message : 'delete failed' };
  }
}

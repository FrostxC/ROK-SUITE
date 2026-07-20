'use client';

import { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, BookmarkPlus } from 'lucide-react';
import {
  MAIL_TEMPLATES,
  TEMPLATE_CATEGORY_LABELS,
  type MailTemplate,
  type TemplateCategory,
} from '@/lib/rok-mail/templates';
import {
  loadCustomTemplates,
  addCustomTemplate,
  deleteCustomTemplate,
  type CustomMailTemplate,
} from '@/lib/rok-mail/custom-templates';
import { useAuthRole, meetsRole } from '@/lib/auth-role';
import { RokMailPreview } from './RokMailPreview';

interface TemplateSelectorProps {
  onClose: () => void;
  onLoadTemplate: (content: string) => void;
  /** Current editor content — what "Save as template" captures. */
  currentContent?: string;
}

export function TemplateSelector({ onClose, onLoadTemplate, currentContent }: TemplateSelectorProps) {
  const { role } = useAuthRole();
  const canManage = meetsRole(role, ['admin', 'officer']);

  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('angmar');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomMailTemplate[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save-as-template dialog
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saveCategory, setSaveCategory] = useState<TemplateCategory>('events');

  useEffect(() => {
    loadCustomTemplates().then(setCustomTemplates);
  }, []);

  const categories = Object.keys(TEMPLATE_CATEGORY_LABELS) as TemplateCategory[];
  const allTemplates: MailTemplate[] = useMemo(
    () => [...MAIL_TEMPLATES, ...customTemplates],
    [customTemplates],
  );
  const filteredTemplates = allTemplates.filter((t) => t.category === activeCategory);
  const previewTemplate = selectedTemplate
    ? allTemplates.find((t) => t.id === selectedTemplate)
    : null;

  const isCustom = (t: MailTemplate): boolean => 'custom' in t && (t as CustomMailTemplate).custom;

  const handleSave = async () => {
    if (!saveName.trim() || !currentContent?.trim()) return;
    setBusy(true);
    setError(null);
    const { templates, error: err } = await addCustomTemplate({
      name: saveName,
      description: saveDesc || 'Custom template',
      category: saveCategory,
      content: currentContent,
    });
    if (templates) {
      setCustomTemplates(templates);
      setShowSave(false);
      setSaveName('');
      setSaveDesc('');
      setActiveCategory(saveCategory);
    } else {
      setError(`Save failed: ${err}`);
    }
    setBusy(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete the "${name}" template? This removes it for everyone.`)) return;
    setBusy(true);
    setError(null);
    const { templates, error: err } = await deleteCustomTemplate(id);
    if (templates) {
      setCustomTemplates(templates);
      if (selectedTemplate === id) setSelectedTemplate(null);
    } else {
      setError(`Delete failed: ${err}`);
    }
    setBusy(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-xl shadow-2xl border w-[90vw] max-w-3xl max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: 'var(--background-card)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
            Mail Templates
          </h2>
          <div className="flex items-center gap-2">
            {canManage && (
              <button
                type="button"
                disabled={!currentContent?.trim()}
                onClick={() => setShowSave(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-pink-500/15 text-pink-400 hover:bg-pink-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-fast"
                title={currentContent?.trim()
                  ? 'Save the mail currently in the editor as a reusable template'
                  : 'Write a mail in the editor first — this saves its content as a template'}
              >
                <BookmarkPlus size={14} /> Save current as template
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-pink-500/10 transition-fast"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Save dialog */}
        {showSave && (
          <div className="px-4 py-3 border-b space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background-secondary)' }}>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Template name (e.g. MGE Results)…"
                autoFocus
                className="px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: 'var(--background-card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
              <select
                value={saveCategory}
                onChange={(e) => setSaveCategory(e.target.value as TemplateCategory)}
                className="px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: 'var(--background-card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{TEMPLATE_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <input
              value={saveDesc}
              onChange={(e) => setSaveDesc(e.target.value)}
              placeholder="Short description (optional)…"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ backgroundColor: 'var(--background-card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={busy || !saveName.trim()}
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:opacity-90 disabled:opacity-40 transition-fast"
              >
                <Plus size={13} /> {busy ? 'Saving…' : 'Save template'}
              </button>
              <button
                type="button"
                onClick={() => setShowSave(false)}
                className="px-3 py-1.5 rounded-lg text-xs"
                style={{ color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Saves the mail currently in the editor, shared with all officers.
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-2 text-xs text-red-400 border-b" style={{ borderColor: 'var(--border)' }}>{error}</div>
        )}

        {/* Category Tabs */}
        <div
          className="flex flex-wrap gap-1 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat);
                setSelectedTemplate(null);
              }}
              className={`px-3 py-1.5 text-sm rounded-lg transition-fast ${
                activeCategory === cat
                  ? 'bg-pink-500/20 text-pink-400 font-medium'
                  : 'hover:bg-pink-500/10'
              }`}
              style={activeCategory !== cat ? { color: 'var(--text-secondary)' } : undefined}
            >
              {TEMPLATE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Template List */}
          <div
            className="md:w-1/3 border-b md:border-b-0 md:border-r overflow-y-auto p-2 shrink-0 max-h-[25vh] md:max-h-none"
            style={{ borderColor: 'var(--border)' }}
          >
            {filteredTemplates.length === 0 && (
              <p className="text-xs p-3" style={{ color: 'var(--text-muted)' }}>
                No templates here yet{canManage ? ' — write a mail and use "Save current as template".' : '.'}
              </p>
            )}
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`relative rounded-lg mb-1 transition-fast ${
                  selectedTemplate === template.id
                    ? 'bg-pink-500/15 border border-pink-500/30'
                    : 'hover:bg-pink-500/5 border border-transparent'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className="w-full text-left p-3 pr-8"
                >
                  <p className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--foreground)' }}>
                    {template.name}
                    {isCustom(template) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/15 text-pink-400 font-semibold uppercase tracking-wide">custom</span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {template.description}
                  </p>
                </button>
                {canManage && isCustom(template) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDelete(template.id, template.name)}
                    className="absolute top-2 right-2 p-1.5 rounded-md text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-fast"
                    title="Delete this template (officers only)"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Preview + Button */}
          <div className="flex-1 flex flex-col min-h-0">
            {previewTemplate ? (
              <>
                {/* Scrollable preview area */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0">
                  <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                    <RokMailPreview content={previewTemplate.content} />
                  </div>
                </div>
                {/* Button pinned at bottom */}
                <div className="shrink-0 px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => onLoadTemplate(previewTemplate.content)}
                    className="w-full py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:opacity-90 transition-fast"
                  >
                    Load Template
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Select a template to preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

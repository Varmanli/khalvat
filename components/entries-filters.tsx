"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import type { EntryCategory } from "@/db/schema";

const TYPE_OPTIONS = [
  { value: "", label: "همه نوع‌ها" },
  { value: "note", label: "یادداشت" },
  { value: "idea", label: "ایده" },
  { value: "poem", label: "شعر" },
  { value: "watch", label: "دیدنی" },
  { value: "read", label: "خواندنی" },
  { value: "reminder", label: "یادآور" },
  { value: "spark", label: "جرقه" },
];

const MOOD_OPTIONS = [
  { value: "", label: "همه حال‌وهواها" },
  { value: "neutral", label: "معمولی" },
  { value: "calm", label: "آرام" },
  { value: "sad", label: "غمگین" },
  { value: "excited", label: "پرانرژی" },
  { value: "nostalgic", label: "نوستالژیک" },
  { value: "dark", label: "تاریک" },
  { value: "hopeful", label: "امیدوار" },
  { value: "romantic", label: "عاشقانه" },
  { value: "tired", label: "خسته" },
];

const STATUS_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "raw", label: "خام" },
  { value: "active", label: "فعال" },
  { value: "done", label: "انجام‌شده" },
  { value: "archived", label: "آرشیوشده" },
  { value: "dropped", label: "رهاشده" },
];

interface EntriesFiltersProps {
  initialQ?: string;
  initialType?: string;
  initialMood?: string;
  initialStatus?: string;
  initialTag?: string;
  initialCategoryId?: string;
  categories?: EntryCategory[];
}

export function EntriesFilters({
  initialQ = "",
  initialType = "",
  initialMood = "",
  initialStatus = "",
  initialTag = "",
  initialCategoryId = "",
  categories = [],
}: EntriesFiltersProps) {
  const router = useRouter();

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState(initialType);
  const [mood, setMood] = useState(initialMood);
  const [status, setStatus] = useState(initialStatus);
  const [categoryId, setCategoryId] = useState(initialCategoryId);

  const hasFilters = q || type || mood || status || initialTag || categoryId;

  const categoryOptions = [
    { value: "", label: "همه دسته‌بندی‌ها" },
    { value: "none", label: "بدون دسته‌بندی" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  function buildParams(overrides?: Record<string, string>) {
    const merged = { q, type, mood, status, categoryId, ...overrides };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.type) params.set("type", merged.type);
    if (merged.mood) params.set("mood", merged.mood);
    if (merged.status) params.set("status", merged.status);
    if (merged.categoryId) params.set("categoryId", merged.categoryId);
    if (initialTag) params.set("tag", initialTag);
    return params;
  }

  function applyFilters() {
    const params = buildParams();
    router.push(`/entries${params.size ? `?${params}` : ""}`);
  }

  function clearFilters() {
    setQ(""); setType(""); setMood(""); setStatus(""); setCategoryId("");
    router.push("/entries");
  }

  function clearTag() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    if (mood) params.set("mood", mood);
    if (status) params.set("status", status);
    if (categoryId) params.set("categoryId", categoryId);
    router.push(`/entries${params.size ? `?${params}` : ""}`);
  }

  return (
    <div className="relative z-30 mb-6 flex flex-col gap-3 overflow-visible">
      {/* Active tag chip */}
      {initialTag && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">فیلتر تگ:</span>
          <span className="flex items-center gap-1 text-xs bg-primary-soft text-primary-dark px-2.5 py-1 rounded-full">
            #{initialTag}
            <button
              onClick={clearTag}
              className="hover:text-danger transition-colors ml-1"
              title="حذف فیلتر تگ"
            >
              <X size={11} />
            </button>
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="جستجو در عنوان و محتوا..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-colors duration-150"
        />
      </div>

      {/* Selects row */}
      <div className="relative z-30 flex flex-wrap items-start gap-2 overflow-visible">
        <div className="relative z-40 min-w-[130px] flex-1">
          <CustomSelect
            value={type}
            onValueChange={setType}
            options={TYPE_OPTIONS}
            placeholder="همه نوع‌ها"
          />
        </div>
        <div className="relative z-40 min-w-[130px] flex-1">
          <CustomSelect
            value={mood}
            onValueChange={setMood}
            options={MOOD_OPTIONS}
            placeholder="همه حال‌وهواها"
          />
        </div>
        <div className="relative z-40 min-w-[130px] flex-1">
          <CustomSelect
            value={status}
            onValueChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="همه وضعیت‌ها"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative z-40 min-w-[130px] flex-1">
            <CustomSelect
              value={categoryId}
              onValueChange={setCategoryId}
              options={categoryOptions}
              placeholder="همه دسته‌بندی‌ها"
            />
          </div>
        )}

        <button
          type="button"
          onClick={applyFilters}
          className="h-12 px-4 bg-primary text-white text-sm rounded-2xl hover:bg-primary-dark transition-colors duration-150 font-medium shrink-0"
        >
          اعمال
        </button>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 h-12 px-3 text-sm text-muted hover:text-foreground hover:bg-card-soft rounded-2xl transition-colors duration-150 shrink-0"
          >
            <X size={14} />
            پاک‌کردن
          </button>
        )}
      </div>
    </div>
  );
}


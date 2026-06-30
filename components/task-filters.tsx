"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/task-constants";
import type { TaskCategory } from "@/db/schema";

const ALL_PRIORITY = [{ value: "", label: "همه اولویت‌ها" }, ...PRIORITY_OPTIONS];
const ALL_STATUS = [{ value: "", label: "همه وضعیت‌ها" }, ...STATUS_OPTIONS];
const DUE_OPTIONS = [
  { value: "", label: "همه" },
  { value: "today", label: "امروز" },
  { value: "upcoming", label: "آینده" },
  { value: "overdue", label: "عقب‌افتاده" },
];

interface TaskFiltersProps {
  initialQ?: string;
  initialStatus?: string;
  initialPriority?: string;
  initialCategoryId?: string;
  initialDue?: string;
  categories?: TaskCategory[];
}

export function TaskFilters({
  initialQ = "",
  initialStatus = "",
  initialPriority = "",
  initialCategoryId = "",
  initialDue = "",
  categories = [],
}: TaskFiltersProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState(initialPriority);
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [due, setDue] = useState(initialDue);

  const hasFilters = q || status || priority || categoryId || due;

  const categoryOptions = [
    { value: "", label: "همه دسته‌ها" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  function apply() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (categoryId) params.set("categoryId", categoryId);
    if (due) params.set("due", due);
    router.push(`/tasks${params.size ? `?${params}` : ""}`);
  }

  function clear() {
    setQ(""); setStatus(""); setPriority(""); setCategoryId(""); setDue("");
    router.push("/tasks");
  }

  return (
    <div className="relative z-30 flex flex-col gap-3 overflow-visible mb-6">
      <div className="relative">
        <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder="جستجو در وظایف..."
          className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-soft focus:border-primary transition-colors duration-150"
        />
      </div>

      <div className="grid items-start gap-2 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
        <div className="relative z-40 min-w-0">
          <CustomSelect value={priority} onValueChange={setPriority} options={ALL_PRIORITY} placeholder="همه اولویت‌ها" />
        </div>
        <div className="relative z-40 min-w-0">
          <CustomSelect value={status} onValueChange={setStatus} options={ALL_STATUS} placeholder="همه وضعیت‌ها" />
        </div>
        <div className="relative z-40 min-w-0">
          <CustomSelect value={due} onValueChange={setDue} options={DUE_OPTIONS} placeholder="همه" />
        </div>
        {categories.length > 0 && (
          <div className="relative z-40 min-w-0">
            <CustomSelect value={categoryId} onValueChange={setCategoryId} options={categoryOptions} placeholder="همه دسته‌ها" />
          </div>
        )}

        <button
          type="button"
          onClick={apply}
          className="h-12 shrink-0 rounded-2xl bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          اعمال
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={clear}
            className="flex h-12 shrink-0 items-center gap-1.5 rounded-2xl px-3 text-sm text-muted transition-colors hover:bg-card-soft hover:text-foreground"
          >
            <X size={14} />
            پاک‌کردن
          </button>
        )}
      </div>
    </div>
  );
}


"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Edit3, Folder, Sparkles } from "lucide-react";

import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { TaskToggleButton } from "@/components/task-toggle-button";
import { TASK_PRIORITY_META } from "@/lib/task-constants";
import { formatJalaliDate } from "@/lib/date";
import { toPersianDigits } from "@/lib/persian-numbers";
import type { TaskWithCategory } from "@/lib/tasks";

interface TaskCardProps {
  task: TaskWithCategory;
}

export function TaskCard({ task }: TaskCardProps) {
  const isDone = task.status === "done";
  const isOverdue = task.dueAt ? task.dueAt < new Date() && !isDone : false;
  const accentColor =
    task.color ??
    task.category?.color ??
    TASK_PRIORITY_META[task.priority].dotColor;

  const descriptionExcerpt = task.description
    ? toPersianDigits(toPlainText(task.description).trim())
    : "";

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[1.75rem] border bg-card transition-all duration-200",
        "shadow-[0_14px_50px_rgba(94,58,47,0.045)]",
        "hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-[0_22px_80px_rgba(94,58,47,0.09)]",
        isDone ? "border-border/80 opacity-75" : "border-border",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-card via-background to-primary-soft/10 opacity-80" />

      <div
        className="pointer-events-none absolute bottom-0 right-0 h-full w-1.5 rounded-l-full"
        style={{ backgroundColor: accentColor }}
      />

      <div
        className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `${accentColor}22` }}
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <TaskToggleButton taskId={task.id} isDone={isDone} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
                <h3
                  className={[
                    "line-clamp-2 text-sm font-black leading-7 transition-colors group-hover:text-primary sm:text-base",
                    isDone ? "text-muted line-through" : "text-foreground",
                  ].join(" ")}
                >
                  {task.title}
                </h3>
              </Link>

              <Link
                href={`/tasks/${task.id}/edit`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70 text-muted transition-all hover:border-primary-soft hover:bg-primary-soft/25 hover:text-primary"
                aria-label="ویرایش وظیفه"
                title="ویرایش"
              >
                <Edit3 className="size-4" />
              </Link>
            </div>

            {descriptionExcerpt && (
              <p
                className={[
                  "mt-2 line-clamp-2 text-xs leading-6 text-muted",
                  isDone ? "line-through opacity-70" : "",
                ].join(" ")}
              >
                {descriptionExcerpt}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <TaskPriorityBadge priority={task.priority} />
              <TaskStatusBadge status={task.status} />

              {task.category && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black text-white shadow-sm"
                  style={{ backgroundColor: task.category.color }}
                >
                  <Folder className="size-3.5" />
                  {task.category.name}
                </span>
              )}

              {task.dueAt && (
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-black",
                    isOverdue
                      ? "border-danger/20 bg-danger/8 text-danger"
                      : "border-border bg-background/70 text-muted",
                  ].join(" ")}
                >
                  <Calendar className="size-3.5" />
                  {formatJalaliDate(task.dueAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            {isDone ? "انجام شده" : isOverdue ? "از موعد گذشته" : "در جریان"}
          </div>

          <Link
            href={`/tasks/${task.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-black text-muted transition-colors hover:text-primary"
          >
            مشاهده جزئیات
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function toPlainText(value: string) {
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&zwnj;/g, "‌")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
}

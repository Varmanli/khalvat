"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Edit3, Folder } from "lucide-react";

import { DeleteTaskButton } from "@/components/tasks/delete-task-button";
import { TaskPlanningActions } from "@/components/planner/task-planning-actions";
import { TaskPriorityBadge } from "@/components/task-priority-badge";
import { TaskStatusBadge } from "@/components/task-status-badge";
import { TaskToggleButton } from "@/components/task-toggle-button";
import { GoalContextLink } from "@/components/goals/goal-context-link";

import { TASK_PRIORITY_META } from "@/lib/task-constants";
import { formatJalaliDate } from "@/lib/date";
import { toPersianDigits } from "@/lib/persian-numbers";
import type { TaskWithCategory } from "@/lib/tasks";

interface TaskCardProps {
  task: TaskWithCategory;
}

export function TaskCard({ task }: TaskCardProps) {
  const isDone = task.status === "done";

  const isOverdue = Boolean(task.dueAt && task.dueAt < new Date() && !isDone);

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
        "group relative overflow-hidden rounded-[1.75rem] border border-border bg-card",
        "shadow-[0_14px_50px_rgba(94,58,47,0.045)]",
        "transition-all duration-200",
        "hover:border-primary-soft hover:shadow-[0_20px_65px_rgba(94,58,47,0.075)]",
        isDone ? "opacity-75" : "",
      ].join(" ")}
    >
      <span
        className="absolute inset-y-0 right-0 w-1"
        style={{
          backgroundColor: accentColor,
        }}
      />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <TaskToggleButton taskId={task.id} isDone={isDone} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1">
                <h3
                  className={[
                    "line-clamp-2 text-sm font-black leading-7 text-foreground transition-colors sm:text-base",
                    "group-hover:text-primary-dark",
                    isDone ? "text-muted line-through" : "",
                  ].join(" ")}
                >
                  {task.title}
                </h3>
              </Link>

              <div className="hidden shrink-0 items-center gap-1 sm:flex">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  onClick={(event) => event.stopPropagation()}
                  aria-label="ویرایش وظیفه"
                  title="ویرایش"
                  className="flex size-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-card-soft hover:text-primary-dark"
                >
                  <Edit3 className="size-3.5" />
                </Link>

                <div onClick={(event) => event.stopPropagation()}>
                  <DeleteTaskButton taskId={task.id} compact />
                </div>
              </div>
            </div>

            {descriptionExcerpt && (
              <p
                className={[
                  "mt-1.5 line-clamp-2 text-xs leading-6 text-muted",
                  isDone ? "line-through opacity-65" : "",
                ].join(" ")}
              >
                {descriptionExcerpt}
              </p>
            )}

            {task.goal && (
              <div className="mt-2">
                <GoalContextLink goal={task.goal} />
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <TaskPriorityBadge priority={task.priority} />

              <TaskStatusBadge status={task.status} />

              {task.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/65 px-2.5 py-1 text-[11px] font-bold text-muted">
                  <Folder
                    className="size-3"
                    style={{
                      color: task.category.color,
                    }}
                  />

                  {task.category.name}
                </span>
              )}

              {task.dueAt && (
                <span
                  className={[
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
                    isOverdue
                      ? "bg-danger/8 text-danger"
                      : "bg-background/65 text-muted",
                  ].join(" ")}
                >
                  <Calendar className="size-3" />

                  {formatJalaliDate(task.dueAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-border/70 pt-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TaskPlanningActions
              id={task.id}
              priority={task.priority}
              done={isDone}
            />

            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-1 sm:hidden">
                <Link
                  href={`/tasks/${task.id}/edit`}
                  onClick={(event) => event.stopPropagation()}
                  aria-label="ویرایش وظیفه"
                  className="flex size-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-card-soft hover:text-primary-dark"
                >
                  <Edit3 className="size-3.5" />
                </Link>

                <div onClick={(event) => event.stopPropagation()}>
                  <DeleteTaskButton taskId={task.id} compact />
                </div>
              </div>

              <Link
                href={`/tasks/${task.id}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-black text-muted transition-colors hover:text-primary-dark"
              >
                جزئیات
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              </Link>
            </div>
          </div>
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TaskForm } from "@/components/task-form";
import { requireUser } from "@/lib/auth";
import { getUserTaskById } from "@/lib/tasks";
import { getUserTaskCategories } from "@/lib/task-categories";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Params { params: Promise<{ id: string }> }

export default async function EditTaskPage({ params }: Params) {
  const session = await requireUser();
  const { id } = await params;

  const [userRows, task, categories] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, session.userId)).limit(1),
    getUserTaskById(session.userId, id),
    getUserTaskCategories(session.userId),
  ]);

  if (!task) notFound();
  const userName = userRows[0]?.name ?? "";

  return (
    <AppShell userName={userName}>
      <div className="mb-4">
        <Link
          href={`/tasks/${task.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowRight size={14} />
          بازگشت
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">ویرایش وظیفه</h1>
      </div>
      <TaskForm
        taskId={task.id}
        categories={categories}
        defaultValues={{
          title: task.title,
          description: task.description ?? "",
          priority: task.priority,
          status: task.status,
          categoryId: task.categoryId ?? "",
          color: task.color ?? "",
          dueAt: task.dueAt?.toISOString() ?? null,
          isPinned: task.isPinned,
        }}
      />
    </AppShell>
  );
}

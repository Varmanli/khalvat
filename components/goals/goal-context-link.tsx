import Link from "next/link";
import { Target } from "lucide-react";
export function GoalContextLink({ goal }: { goal?: { id: string; title: string } | null }) { if (!goal) return null; return <Link href={`/goals/${goal.id}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary-soft/35 px-2 py-1 text-[11px] font-bold text-primary-dark hover:bg-primary-soft/60"><Target className="size-3 shrink-0"/><span className="truncate">هدف: {goal.title}</span></Link>; }

import { ApiUser } from "@/types/users";

export interface SelectedApprover {
  userId: number;
  name: string;
  stepOrder: number;
}


export function toggleApproverIn(
  list: SelectedApprover[],
  user: ApiUser
): SelectedApprover[] {
  const exists = list.find((a) => a.userId === user.id);
  if (exists) {
    return list
      .filter((a) => a.userId !== user.id)
      .map((a, i) => ({ ...a, stepOrder: i + 1 }));
  }
  return [
    ...list,
    { userId: user.id, name: `${user.firstName} ${user.lastName}`, stepOrder: list.length + 1 },
  ];
}
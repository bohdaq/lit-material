// Stands in for your server: swap these functions for real fetch() calls (or @lit-material/http).
// Every call waits a little, so loading states are visible while you build.

export type Role = "owner" | "admin" | "member";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  pending?: boolean;
}

export interface Org {
  id: string;
  name: string;
}

const wait = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const orgs: Org[] = [
  { id: "acme", name: "Acme" },
  { id: "personal", name: "Personal" },
];

const members: Member[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "owner" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", role: "admin" },
];

export async function listMembers(signal?: AbortSignal): Promise<Member[]> {
  await wait();
  signal?.throwIfAborted();
  return members.map((m) => ({ ...m }));
}

export async function invite(email: string, role: Role): Promise<Member> {
  await wait();
  if (members.some((m) => m.email === email)) throw new Error(`${email} is already a member.`);
  const member: Member = { id: String(Date.now()), name: email, email, role, pending: true };
  members.push(member);
  return member;
}

export async function setRole(id: string, role: Role): Promise<void> {
  await wait(200);
  const member = members.find((m) => m.id === id);
  if (member) member.role = role;
}

export async function removeMember(id: string): Promise<void> {
  await wait();
  const i = members.findIndex((m) => m.id === id);
  if (i >= 0) members.splice(i, 1);
}

export async function signIn(email: string, password: string): Promise<{ email: string }> {
  await wait(600);
  if (password === "wrong") throw new Error("Wrong email or password.");
  return { email };
}

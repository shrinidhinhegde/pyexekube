import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {getSession} from "next-auth/react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function fetcher(...args: Parameters<typeof fetch>) {
  const [resource, init] = args;
  const session = await getSession();
  const headers = new Headers(init?.headers || {});
  const token = (session as { idToken?: string })?.idToken;
  headers.set("Authorization", "Bearer " + token);

  const res = await fetch(resource, {...init, headers});

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
  return res.json();
}

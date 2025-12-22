import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

export async function POST(request: Request) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Faltan credenciales del admin (configura variables de entorno)" },
      { status: 500 }
    );
  }

  const { username, password } = await request
    .json()
    .catch(() => ({ username: "", password: "" }));

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

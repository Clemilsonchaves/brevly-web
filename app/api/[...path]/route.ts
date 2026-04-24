import { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function buildTargetUrl(path: string[], search: string) {
  const normalizedBase = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;
  const joinedPath = path.join("/");
  return `${normalizedBase}/${joinedPath}${search}`;
}

async function proxy(request: NextRequest, params: { path: string[] }) {
  const targetUrl = buildTargetUrl(params.path, request.nextUrl.search);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const shouldSendBody = request.method !== "GET" && request.method !== "HEAD";
  let body: ArrayBuffer | undefined;

  if (shouldSendBody) {
    const rawBody = await request.arrayBuffer();
    body = rawBody.byteLength > 0 ? rawBody : undefined;
  }

  let response: Response;

  try {
    response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });
  } catch {
    return Response.json(
      {
        message: "Nao foi possivel conectar com o backend",
        target: targetUrl,
      },
      { status: 502 },
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

export async function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const params = await context.params;
  return proxy(request, params);
}

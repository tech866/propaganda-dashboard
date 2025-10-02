// Mock Next.js Request for testing
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  headers = new Map();
  method = 'GET';
  nextUrl = { pathname: this.url };
  ip = '127.0.0.1';
} as any;

// Mock NextResponse
global.NextResponse = {
  next: () => ({ status: 200 }),
  json: (data: any) => ({ status: 200, json: () => Promise.resolve(data) })
} as any;


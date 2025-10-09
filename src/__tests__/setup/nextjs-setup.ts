// Mock Next.js Request for testing
global.Request = class MockRequest {
  private _url: string;
  
  constructor(url: string, public init?: RequestInit) {
    this._url = url;
  }
  
  get url() {
    return this._url;
  }
  
  headers = new Map();
  method = 'GET';
  
  get nextUrl() {
    return { pathname: this._url };
  }
  
  ip = '127.0.0.1';
} as any;

// Mock Headers
global.Headers = class MockHeaders extends Map {
  constructor(init?: HeadersInit) {
    super();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value));
      } else if (init && typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this.set(key, value));
      }
    }
  }
  
  get(name: string) {
    return super.get(name.toLowerCase()) || null;
  }
  
  set(name: string, value: string) {
    return super.set(name.toLowerCase(), value);
  }
  
  has(name: string) {
    return super.has(name.toLowerCase());
  }
  
  delete(name: string) {
    return super.delete(name.toLowerCase());
  }
} as any;

// Mock NextRequest
global.NextRequest = class MockNextRequest {
  private _url: string;
  
  constructor(url: string, public init?: RequestInit) {
    this._url = url;
  }
  
  get url() {
    return this._url;
  }
  
  headers = new Map();
  method = 'GET';
  
  get nextUrl() {
    return { pathname: this._url };
  }
  
  ip = '127.0.0.1';
} as any;

// Mock Response
global.Response = class MockResponse {
  constructor(public body?: any, public init?: ResponseInit) {}
  status = 200;
  statusText = 'OK';
  headers = new Map();
  
  async json() {
    return Promise.resolve(this.body);
  }
  
  async text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
  }
} as any;

// Mock NextResponse
global.NextResponse = {
  next: () => ({ status: 200 }),
  json: (data: any) => ({ 
    status: 200, 
    json: () => Promise.resolve(data),
    headers: new Map()
  })
} as any;


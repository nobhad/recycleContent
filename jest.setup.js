// jest.setup.js
const chromeMock = {
    storage: {
      local: {
        get: jest.fn().mockResolvedValue({}),
        set: jest.fn().mockResolvedValue(),
      },
    },
  };
  
  global.chrome = chromeMock;
  global.browser = chromeMock;
  
  console.log('✅ Jest setup loaded');
  
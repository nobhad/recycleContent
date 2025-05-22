const storageData = {};

const storage = {
  local: {
    get: jest.fn((keys, callback) => {
      if (typeof keys === 'function') {
        callback = keys;
        keys = null;
      }
      if (!keys) {
        callback({ ...storageData });
      } else if (Array.isArray(keys)) {
        const result = {};
        keys.forEach(key => {
          if (key in storageData) result[key] = storageData[key];
        });
        callback(result);
      } else if (typeof keys === 'string') {
        callback({ [keys]: storageData[keys] });
      } else {
        callback({});
      }
    }),
    set: jest.fn((items, callback) => {
      Object.assign(storageData, items);
      if (callback) callback();
    }),
    remove: jest.fn((keys, callback) => {
      if (Array.isArray(keys)) {
        keys.forEach(key => delete storageData[key]);
      } else {
        delete storageData[keys];
      }
      if (callback) callback();
    }),
    clear: jest.fn(callback => {
      Object.keys(storageData).forEach(key => delete storageData[key]);
      if (callback) callback();
    }),
  },
};

global.chrome = {
  storage,
  alarms: {
    onAlarm: { addListener: jest.fn() },
  },
};

global.browser = {
  storage,
  alarms: {
    onAlarm: { addListener: jest.fn() },
  },
};

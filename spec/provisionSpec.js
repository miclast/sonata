
const device = {
  id: 'sdgjdeu9443908590sfdsf8u984',
  model: 'gxp1600',
  vendor: 'grandstream',
  mac: '001565113af8',
  timezone: 'UTC+03',
  ntp_server: 'pool.ntp.org',
  status: true,
  created_at: '2019-01-18T15:39:15.645Z',
  updated_at: (new Date()).toISOString(),
  accounts: [
    {
      name: 'манго',
      position: 1,
      sip_register: 'sip.mangosip.ru',
      sip_name: 'sip101',
      sip_user: 'sip101',
      sip_password: '1234',
      sip_auth: 'sip101',
    },
    {
      name: 'Мобилон',
      position: 2,
      sip_register: 'sip.mobilonsip.ru',
      sip_name: 'sip102',
      sip_user: 'sip102',
      sip_password: '4321',
      sip_auth: 'sip102',
    },
  ],
};

const Device = {
  findById: () => {
    return Promise.resolve(device);
  },
};

const createApp = require('./../provision/app').createApp;
const app = createApp(Device);
const fetch = require('node-fetch');

describe('provision', ()=> {
  it('get xml config', (done) => {
    const server = app.listen(3000);
    fetch('http://localhost:3000/v1/device/1/cfg.xml')
        .then((res) => res.text())
        .then((res) => {
          // console.log(res);
          const containXml = res.includes('<config version="1">');
          // console.log('containXml', containXml);
          expect(containXml).toBe(true);
        })
        .then(() => {
          server.close();
          done();
        });
  });
});
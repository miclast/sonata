const template = require('./../../../template');
const helper = require('./../../../helper');
const strip = require('strip-passwords');

const isUntilTimeRule = (device) => {
  return device.rules && device.rules.time && device.rules.time.until;
};

const isExpiredUntilTimeRule = (device) => {
  let result = false;
  const dateUntil = (new Date(device.rules.time.until)).getTime();
  const dateActual = (new Date()).getTime();
  // console.log('until:', dateUntil, 'actual:', dateActual);
  result = dateUntil - dateActual > 0 ? false : true;
  return result;
};

const isMacRule = (device) => {
  return device.rules && device.rules.mac && device.rules.hasOwnProperty('mac');
};

const isValidMac = (device, mac) => {
  return device.mac && (device.mac === mac);
};

module.exports = (Device) => {
  /**
  *
  * @param {Object} req
  * @param {Object} res
  */
  function get(req, res) {
    console.log('request params:', req.params);
    console.log('request user-agent:', req.headers['user-agent']);

    const token = req.params.token;
    console.log('token:', token);

    const file = req.params.file;
    console.log('file:', file);

    const mac = file.match(new RegExp('cfg(.*).xml'))[1];
    console.log('mac:', mac);

    Device.findOne({token, mac})
        .then((device) => {
          console.log('db find:', strip(device));

          if (!device) {
            return Promise.reject(new Error('no device config'));
          }

          console.log('device:', strip(device));

          if (!device.status) {
            return Promise.reject(new Error('device config status disabled'));
          }

          if (isUntilTimeRule(device) && isExpiredUntilTimeRule(device)) {
            return Promise.reject(new Error('device until time rule expired'));
          }

          if (isMacRule(device) && !isValidMac(device, mac)) {
            return Promise.reject(new Error('device mac is not valid'));
          }

          if (!helper.isFreshUpdate(device)) {
            return Promise.reject(new Error('device config expired'));
          }

          const t = template(device);
          console.log('vendor', device.vendor);
          console.log('config template', t);
          res.status(200).type('application/xml').send(t);
        })
        .catch((err) => {
          console.log('error', err);
          res.status(404).send();
        });
  }

  get.apiDoc = {
    description: 'get by token and mac',
    operationId: 'get device config',
    tags: ['config'],
    produces: [
      'application/xml',
    ],
    responses: {
      200: {
        description: 'Requested config',
      },

      default: {
        description: 'Unexpected error',
        schema: {
          $ref: '#/definitions/Error',
        },
      },
    },
  };

  return {
    parameters: [
      {
        name: 'token',
        in: 'path',
        type: 'string',
        required: true,
        description: 'device config token',
      },
      {
        name: 'file',
        in: 'path',
        type: 'string',
        required: true,
        description: 'filename like cfg{mac}.xml',
      },
    ],
    get: get,
  };
};
const { createClient } = require('ippanel-node-sdk');

const IPPANEL_SENDER = process.env.IPPANEL_SENDER || '+983000505';

let _client = null;

function getClient() {
  const apiKey = process.env.IPPANEL_API_KEY;
  if (!apiKey) {
    throw new Error('IPPANEL_API_KEY is not configured');
  }
  if (!_client) {
    _client = createClient(apiKey);
  }
  return _client;
}

exports.sendOTP = async (phone, code) => {
  const client = getClient();
  const response = await client.sendVOTP(code, phone);
  if (!response.meta.status) {
    throw new Error(response.meta.message || 'SMS send failed');
  }
  return response;
};

exports.sendPattern = async (patternCode, phone, params) => {
  const client = getClient();
  const response = await client.sendPattern(patternCode, IPPANEL_SENDER, phone, params);
  if (!response.meta.status) {
    throw new Error(response.meta.message || 'SMS send failed');
  }
  return response;
};

exports.sendWebservice = async (message, recipients) => {
  const client = getClient();
  const numbers = Array.isArray(recipients) ? recipients : [recipients];
  const response = await client.sendWebservice(message, IPPANEL_SENDER, numbers);
  if (!response.meta.status) {
    throw new Error(response.meta.message || 'SMS send failed');
  }
  return response;
};

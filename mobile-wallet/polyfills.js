// Polyfills for Polkadot.js in React Native
import 'react-native-get-random-values';
import { decode, encode } from 'base-64';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// TextEncoder/TextDecoder polyfills
import { TextEncoder, TextDecoder } from 'text-encoding';

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Buffer polyfill
import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polkadot global setup
import '@polkadot/x-global';

// Additional globals for Node.js compatibility
if (typeof global.process === 'undefined') {
  global.process = require('process');
}

// Ensure crypto.getRandomValues is available
const getRandomValues = require('react-native-get-random-values');
if (!global.crypto) {
  global.crypto = {};
}
if (!global.crypto.getRandomValues) {
  global.crypto.getRandomValues = getRandomValues;
}

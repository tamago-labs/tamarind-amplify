import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { cleanverseIdentity } from './functions/cleanverseIdentity/resource.js';

defineBackend({
  auth,
  data,
  cleanverseIdentity,
});

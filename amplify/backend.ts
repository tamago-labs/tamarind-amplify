import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { cleanverseIdentity } from './functions/cleanverseIdentity/resource.js';
import { cleanverseFaucet } from './functions/cleanverseFaucet/resource.js';
import { queryDepositAddress } from './functions/queryDepositAddress/resource.js';
import { addWhitelist } from './functions/addWhitelist/resource.js';
import { removeWhitelist } from './functions/removeWhitelist/resource.js';
import { queryTokenRules } from './functions/queryTokenRules/resource.js';

defineBackend({
  auth,
  data,
  cleanverseIdentity,
  cleanverseFaucet,
  queryDepositAddress,
  addWhitelist,
  removeWhitelist,
  queryTokenRules,
});

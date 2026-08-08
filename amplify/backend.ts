import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { cleanverseIdentity } from './functions/cleanverseIdentity/resource.js';
import { cleanverseFaucet } from './functions/cleanverseFaucet/resource.js';
import { queryDepositAddress } from './functions/queryDepositAddress/resource.js';
import { addWhitelist } from './functions/addWhitelist/resource.js';
import { removeWhitelist } from './functions/removeWhitelist/resource.js';
import { queryTokenRules } from './functions/queryTokenRules/resource.js';
import { createReceivable } from './functions/createReceivable/resource.js';
import { openFunding } from './functions/openFunding/resource.js';
import { addPaymentProof } from './functions/addPaymentProof/resource.js';
import { queryReceivable } from './functions/queryReceivable/resource.js';
import { queryInvestmentPositions } from './functions/queryInvestmentPositions/resource.js';
import { queryAvailableReceivables } from './functions/queryAvailableReceivables/resource.js';

defineBackend({
  auth,
  data,
  cleanverseIdentity,
  cleanverseFaucet,
  queryDepositAddress,
  addWhitelist,
  removeWhitelist,
  queryTokenRules,
  createReceivable,
  openFunding,
  addPaymentProof,
  queryReceivable,
  queryInvestmentPositions,
  queryAvailableReceivables,
});

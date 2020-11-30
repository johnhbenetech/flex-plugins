import { set } from 'lodash/fp';

import secret from '../private/secret';
import { createNewTaskEntry } from '../states/contacts/reducer';
import { isNonDataCallType } from '../states/ValidationRules';
import { channelTypes } from '../states/DomainConstants';
import { getConversationDuration, fillEndMillis } from '../utils/conversationDuration';
import { getLimitAndOffsetParams } from './PaginationParams';
import fetchHrmApi from './fetchHrmApi';
import CategoriesFormDefinition from '../formDefinitions/categories.json';

export async function searchContacts(searchParams, limit, offset) {
  const queryParams = getLimitAndOffsetParams(limit, offset);

  const options = {
    method: 'POST',
    body: JSON.stringify(searchParams),
  };

  const responseJson = await fetchHrmApi(`/contacts/search${queryParams}`, options);
  return responseJson;
}

export function getNumberFromTask(task) {
  let number;

  if (task.channelType === channelTypes.facebook) {
    number = task.defaultFrom.replace('messenger:', '');
  } else if (task.channelType === channelTypes.whatsapp) {
    number = task.defaultFrom.replace('whatsapp:', '');
  } else {
    number = task.defaultFrom;
  }

  return number;
}

// const createCategoriesObject = <T extends {}>(obj: T, [category, { subcategories }]: [string, CategoryEntry]) => ({
const createCategory = (obj, [category, { subcategories }]) => ({
  ...obj,
  [category]: subcategories.reduce((acc, subcategory) => ({ ...acc, [subcategory]: false }), {}),
});

const createCategoriesObject = () => Object.entries(CategoriesFormDefinition).reduce(createCategory, {});

/**
 * @param {{ firstName: string, lastName: string }} information
 */
const groupName = information => {
  const { firstName, lastName, ...rest } = information;
  return { ...rest, name: { firstName, lastName } };
};

/**
 * Transforms the form to be saved as the backend expects it
 * VisibleForTesting
 * @param {TaskEntry} form
 */
// eslint-disable-next-line import/no-unused-modules
export function transformForm(form) {
  const { callType, metadata, caseInformation } = form;

  const callerInformation = groupName(form.callerInformation);
  const childInformation = groupName(form.childInformation);

  const categoriesObject = createCategoriesObject();
  const { categories } = form.categories.reduce((acc, path) => set(path, true, acc), { categories: categoriesObject });

  const transformed = {
    definitionVersion: 'v1', // TODO: put this in config (like feature flags). Question: Should this be inside rawForm or be a separate column for each contact?
    callType,
    callerInformation,
    childInformation,
    metadata,
    caseInformation: {
      ...caseInformation,
      categories,
    },
  };

  return transformed;
}

/**
 * Function that saves the form to Contacts table.
 * If you don't intend to complete the twilio task, set shouldFillEndMillis=false
 *
 * @param  task
 * @param form
 * @param hrmBaseUrl
 * @param workerSid
 * @param helpline
 * @param shouldFillEndMillis
 */
export async function saveToHrm(task, form, hrmBaseUrl, workerSid, helpline, shouldFillEndMillis = true) {
  // if we got this far, we assume the form is valid and ready to submit
  const metadata = shouldFillEndMillis ? fillEndMillis(form.metadata) : form.metadata;
  const conversationDuration = getConversationDuration(metadata);
  const { callType } = form;

  let rawForm = form;

  if (isNonDataCallType(callType)) {
    rawForm = {
      ...createNewTaskEntry(),
      callType: form.callType,
      metadata,
    };
  }

  /*
   * We do a transform from the original and then add things.
   * Not sure if we should drop that all into one function or not.
   * Probably.  It would just require passing the task.
   */
  const formToSend = transformForm(rawForm);

  const body = {
    form: formToSend,
    twilioWorkerId: workerSid,
    queueName: task.queueName,
    channel: task.channelType,
    number: getNumberFromTask(task),
    helpline,
    conversationDuration,
  };

  const response = await fetch(`${hrmBaseUrl}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    throw error;
  }

  return response.json();
}

export async function connectToCase(hrmBaseUrl, contactId, caseId) {
  const body = { caseId };
  const response = await fetch(`${hrmBaseUrl}/contacts/${contactId}/connectToCase`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Basic ${btoa(secret)}` },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = response.error();
    throw error;
  }

  return response.json();
}

/* eslint-disable no-empty-function */
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';
import { configureAxe, toHaveNoViolations } from 'jest-axe';
import { mount } from 'enzyme';
import { render, screen, fireEvent } from '@testing-library/react';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import { mockGetDefinitionsResponse } from '../../mockGetConfig';
import HrmTheme from '../../../styles/HrmTheme';
import Case from '../../../components/case';
import CaseHome from '../../../components/case/CaseHome';
import { namespace, configurationBase, contactFormsBase, connectedCaseBase, routingBase } from '../../../states';
import { UPDATE_TEMP_INFO } from '../../../states/case/types';
import { cancelCase, getActivities } from '../../../services/CaseService';
import { getDefinitionVersions } from '../../../HrmFormPlugin';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
}));
jest.mock('../../../services/CaseService', () => ({ getActivities: jest.fn(() => []), cancelCase: jest.fn() }));
jest.mock('../../../permissions', () => ({
  getPermissionsForCase: jest.fn(() => ({
    can: () => true,
  })),
  PermissionActions: {},
}));

/**
 * Fix issue with Popper.js:
 * https://stackoverflow.com/questions/60333156/how-to-fix-typeerror-document-createrange-is-not-a-function-error-while-testi
 */
global.document.createRange = () => ({
  setStart: () => null,
  setEnd: () => null,
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
});

expect.extend(toHaveNoViolations);
const mockStore = configureMockStore([]);

function createState(state) {
  return {
    [namespace]: state,
  };
}

const themeConf = {
  colorTheme: HrmTheme,
};

const ownProps = {
  task: {
    taskSid: 'task1',
    attributes: {
      isContactlessTask: false,
    },
  },
};

let mockV1;
let initialState;
describe('useState mocked', () => {
  beforeAll(async () => {
    mockV1 = await loadDefinition(DefinitionVersionId.v1);
    mockGetDefinitionsResponse(getDefinitionVersions, DefinitionVersionId.v1, mockV1);
  });

  beforeEach(() => {
    initialState = createState({
      [configurationBase]: {
        counselors: {
          list: [],
          hash: { worker1: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
      [contactFormsBase]: {
        tasks: {
          task1: {
            childInformation: {
              firstName: 'first',
              lastName: 'last',
            },
            metadata: {},
            caseInformation: {
              callSummary: 'contact call summary',
            },
            categories: [],
          },
          temporaryCaseInfo: '',
        },
      },
      [connectedCaseBase]: {
        tasks: {
          task1: {
            connectedCase: {
              id: 123,
              createdAt: '2020-06-29T22:26:00.208Z',
              twilioWorkerId: 'worker1',
              status: 'open',
              info: { definitionVersion: 'v1' },
              connectedContacts: [],
            },
            temporaryCaseInfo: '',
            prevStatus: 'open',
          },
        },
      },
      [routingBase]: { tasks: { task1: { route: 'new-case' } } },
    });
  });

  const setState = jest.fn();
  const useStateMock = initState => [initState, setState];

  jest.spyOn(React, 'useState').mockImplementation(useStateMock);

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Case (should return null)', async () => {
    initialState = createState({
      [contactFormsBase]: {
        tasks: {
          task1: {
            childInformation: {
              name: { firstName: 'first', lastName: 'last' },
            },
            metadata: {},
          },
        },
      },
      [connectedCaseBase]: {
        tasks: {},
      },
      [routingBase]: { tasks: { task1: { route: 'new-case' } } },
      [configurationBase]: {
        counselors: {
          list: [],
          hash: { worker1: 'worker1 name' },
        },
        definitionVersions: { v1: mockV1 },
        currentDefinitionVersion: mockV1,
      },
    });
    const store = mockStore(initialState);

    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    ).root;

    const details = component.findAllByType(CaseHome);
    expect(details.length).toBe(0);
  });

  test('Case (should render)', async () => {
    const store = mockStore(initialState);

    const component = renderer.create(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    ).root;

    expect(component.findAllByType(CaseHome).length).toBe(1);
    const details = component.findByType(CaseHome);
    const { id, name, caseCounselor, status, openedDate, lastUpdatedDate, followUpDate } = details.props.caseDetails;

    expect(id).toBe(123);
    expect(name).toStrictEqual({
      firstName: 'first',
      lastName: 'last',
    });
    expect(caseCounselor).toBe('worker1 name');
    expect(status).toBe('open');
    expect(openedDate).toBe('6/29/2020'); // the day the createdAt number represents
    expect(lastUpdatedDate).toBe('Invalid Date');
    expect(followUpDate).toBe('');
  });

  test('a11y', async () => {
    getActivities.mockReturnValueOnce(Promise.resolve([]));
    const store = mockStore(initialState);

    const wrapper = mount(
      <StorelessThemeProvider themeConf={themeConf}>
        <Provider store={store}>
          <Case {...ownProps} />
        </Provider>
      </StorelessThemeProvider>,
    );

    const rules = {
      region: { enabled: false },
    };

    const axe = configureAxe({ rules });
    const results = await axe(wrapper.getDOMNode());

    expect(results).toHaveNoViolations();
  });
});

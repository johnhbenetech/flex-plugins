import React from 'react';
import { mount } from 'enzyme';
import { StorelessThemeProvider } from '@twilio/flex-ui';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { FormProvider } from 'react-hook-form';
import { DefinitionVersionId, loadDefinition } from 'hrm-form-definitions';

import IssueCategorizationTab from '../../../components/tabbedForms/IssueCategorizationTab';
import { ToggleViewButton } from '../../../styles/HrmStyles';
import HrmTheme from '../../../styles/HrmTheme';
import { namespace, contactFormsBase } from '../../../states';
import { setCategoriesGridView } from '../../../states/contacts/actions';

jest.mock('../../../components/CSAMReport/CSAMReportFormDefinition');

let mockV1;
const helpline = 'ChildLine Zambia (ZM)';
let definition;

// Copy paste from state/contacts initial state
let expanded;

const taskId = 'task-id';
const mockStore = configureMockStore([]);

const themeConf = {
  colorTheme: HrmTheme,
};

const getGridIcon = wrapper => wrapper.find(ToggleViewButton).at(0);
const getListIcon = wrapper => wrapper.find(ToggleViewButton).at(1);

beforeAll(async () => {
  mockV1 = await loadDefinition(DefinitionVersionId.v1);
  definition = mockV1.tabbedForms.IssueCategorizationTab(helpline);
  expanded = Object.keys(definition).reduce((acc, category) => ({ ...acc, [category]: false }), {});
});

test('Click on view subcategories as grid icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: { tasks: { [taskId]: { metadata: { categories: { expanded, gridView: false } } } } },
    },
  });
  store.dispatch = jest.fn();

  const mockMethods = {
    register: jest.fn(),
    unregister: jest.fn(),
    watch: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    trigger: jest.fn(),
    errors: jest.fn(),
    formState: jest.fn(),
    reset: jest.fn(),
    getValues: jest.fn(() => ({ categories: [] })),
    handleSubmit: jest.fn(),
    control: jest.fn(),
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <FormProvider {...mockMethods}>
          <IssueCategorizationTab task={{ taskSid: taskId }} definition={definition} display={true} />
        </FormProvider>
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getGridIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(true, taskId));
  store.dispatch.mockClear();
});

test('Click on view subcategories as list icon', () => {
  const store = mockStore({
    [namespace]: {
      [contactFormsBase]: { tasks: { [taskId]: { metadata: { categories: { expanded, gridView: false } } } } },
    },
  });
  store.dispatch = jest.fn();

  const mockMethods = {
    register: jest.fn(),
    unregister: jest.fn(),
    watch: jest.fn(),
    setError: jest.fn(),
    clearErrors: jest.fn(),
    setValue: jest.fn(),
    trigger: jest.fn(),
    errors: jest.fn(),
    formState: jest.fn(),
    reset: jest.fn(),
    getValues: jest.fn(() => ({ categories: [] })),
    handleSubmit: jest.fn(),
    control: jest.fn(),
  };

  const wrapper = mount(
    <StorelessThemeProvider themeConf={themeConf}>
      <Provider store={store}>
        <FormProvider {...mockMethods}>
          <IssueCategorizationTab task={{ taskSid: taskId }} definition={definition} display={true} />
        </FormProvider>
      </Provider>
    </StorelessThemeProvider>,
  );
  expect(store.dispatch).not.toHaveBeenCalled();

  getListIcon(wrapper).simulate('click');

  expect(store.dispatch).toHaveBeenCalled();
  expect(store.dispatch).toHaveBeenCalledWith(setCategoriesGridView(false, taskId));
  store.dispatch.mockClear();
});

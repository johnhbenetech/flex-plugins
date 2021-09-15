/*
 * File used to populate test's scope with mocked styled components
 * Should be imported before the components making use of the styled
 */

jest.mock('../styles/HrmStyles', () => ({
  Box: 'Box',
  Flex: 'Flex',
  Absolute: 'Absolute',
  TabbedFormsContainer: 'TabbedFormsContainer',
  Container: 'Container',
  ErrorText: 'ErrorText',
  CategoryTitle: 'CategoryTitle',
  CategorySubtitleSection: 'CategorySubtitleSection',
  CategoryRequiredText: 'CategoryRequiredText',
  StyledInput: 'StyledInput',
  TextField: 'TextField',
  StyledLabel: 'StyledLabel',
  StyledSelect: 'StyledSelect',
  StyledMenuItem: 'StyledMenuItem',
  StyledNextStepButton: 'StyledNextStepButton',
  CheckboxField: 'CheckboxField',
  StyledCheckboxLabel: 'StyledCheckboxLabel',
  StyledCategoryCheckboxLabel: 'StyledCategoryCheckboxLabel',
  BottomButtonBar: 'BottomButtonBar',
  NameFields: 'NameFields',
  ColumnarBlock: 'ColumnarBlock',
  TwoColumnLayout: 'TwoColumnLayout',
  CategoryCheckboxField: 'CategoryCheckboxField',
  StyledCategoryCheckbox: 'StyledCategoryCheckbox',
  ToggleViewButton: 'ToggleViewButton',
  CategoriesWrapper: 'CategoriesWrapper',
  SubcategoriesWrapper: 'SubcategoriesWrapper',
  StyledTabs: 'StyledTabs',
  StyledTab: 'StyledTab',
  StyledSearchTab: 'StyledSearchTab',
  Row: 'Row',
  FontOpenSans: 'FontOpenSans',
  HiddenText: 'HiddenText',
  TransferStyledButton: 'TransferStyledButton',
  HeaderContainer: 'HeaderContainer',
  StyledIcon: () => 'StyledIcon',
  addHover: () => 'addHover',
  PaginationRow: 'PaginationRow',
  AddTaskIconContainer: 'AddTaskIconContainer',
  AddTaskIcon: 'AddTaskIcon',
  AddTaskContent: 'AddTaskContent',
  AddTaskText: 'AddTaskText',
  AddTaskButtonBase: 'AddTaskButtonBase',
  FormItem: 'FormItem',
  FormLabel: 'FormLabel',
  DependentSelectLabel: 'DependentSelectLabel',
  FormError: 'FormError',
  FormInput: 'FormInput',
  FormDateInput: 'FormDateInput',
  FormTimeInput: 'FormTimeInput',
  FormTextArea: 'FormTextArea',
  FormCheckBoxWrapper: 'FormCheckBoxWrapper',
  FormCheckbox: 'FormCheckbox',
  FormMixedCheckbox: 'FormMixedCheckbox',
  FormSelectWrapper: 'FormSelectWrapper',
  FormSelect: 'FormSelect',
  FormOption: 'FormOption',
  CategoryCheckbox: 'CategoryCheckbox',
  CategoryCheckboxLabel: 'CategoryCheckboxLabel',
  CategoryCheckboxField: 'CategoryCheckboxField',
  TaskCanvasOverride: 'TaskCanvasOverride',
  PopoverText: 'PopoverText',
  CannedResponsesContainer: 'CannedResponsesContainer',
  Bold: 'Bold',
  UploadFileLabel: 'UploadFileLabel',
  UploadFileFileName: 'UploadFileFileName',
}));

jest.mock('../styles/search', () => ({
  ConfirmContainer: 'ConfirmContainer',
  BackIcon: 'BackIcon',
  ContactWrapper: 'ContactWrapper',
  ConnectIcon: 'ConnectIcon',
  ContactButtonsWrapper: 'ContactButtonsWrapper',
  StyledLink: 'StyledLink',
  ContactTag: 'ContactTag',
  ConfirmText: 'ConfirmText',
  CancelButton: 'CancelButton',
  SilentText: 'SilentText',
  PrevNameText: 'PrevNameText',
  SummaryText: 'SummaryText',
  ShortSummaryText: 'ShortSummaryText',
  CounselorText: 'CounselorText',
  CaseFooter: 'CaseFooter',
  CaseFooterText: 'CaseFooterText',
  DateText: 'DateText',
  TagsWrapper: 'TagsWrapper',
  TagText: 'TagText',
  TagMiddleDot: 'TagMiddleDot',
  ContactDetailsIcon: () => 'ContactDetailsIcon',
  DetailsContainer: 'DetailsContainer',
  SectionTitleContainer: 'SectionTitleContainer',
  NameContainer: 'NameContainer',
  BackText: 'BackText',
  DetNameText: 'DetNameText',
  SectionTitleText: 'SectionTitleText',
  SectionDescriptionText: 'SectionDescriptionText',
  SectionValueText: 'SectionValueText',
  ResultsHeader: 'ResultsHeader',
  ListContainer: 'ListContainer',
  ScrollableList: 'ScrollableList',
  StyledButtonBase: 'StyledButtonBase',
  StyledFormControlLabel: 'StyledFormControlLabel',
  StyledSwitch: 'StyledSwitch',
  SwitchLabel: 'SwitchLabel',
  StyledLink: 'StyledLink',
  StyledTabs: 'StyledTabs',
  StyledResultsContainer: 'StyledResultsContainer',
  StyledResultsText: 'StyledResultsText',
  StyledTabLabel: 'StyledTabLabel',
  StyledFolderIcon: 'StyledFolderIcon',
  BoldText: 'BoldText',
  SearchResults: 'SearchResults',
  CaseHeaderContainer: 'CaseHeaderContainer',
  CaseHeaderCaseId: 'CaseHeaderCaseId',
  CaseHeaderChildName: 'CaseHeaderChildName',
  CaseSummaryContainer: 'CaseSummaryContainer',
  CaseWrapper: 'CaseWrapper',
  SearchTitle: 'SearchTitle',
  StandaloneSearchContainer: 'StandaloneSearchContainer',
  StyledCount: 'StyledCount',
  StyledContactResultsHeader: 'StyledContactResultsHeader',
  StyledCaseResultsHeader: 'StyledCaseResultsHeader',
}));

jest.mock('../styles/callTypeButtons', () => ({
  Container: 'Container',
  Label: 'Label',
  DataCallTypeButton: 'DataCallTypeButton',
  NonDataCallTypeButton: 'NonDataCallTypeButton',
  CloseTaskDialog: 'CloseTaskDialog',
  CloseTaskDialogText: 'CloseTaskDialogText',
  ConfirmButton: 'ConfirmButton',
  CancelButton: 'CancelButton',
  CloseButton: 'CloseButton',
  NonDataCallTypeDialogContainer: 'NonDataCallTypeDialogContainer',
}));

jest.mock('../styles/queuesStatus', () => ({
  Container: 'Container',
  HeaderContainer: 'HeaderContainer',
  QueuesContainer: 'QueuesContainer',
  QueueName: 'QueueName',
  ChannelColumn: 'ChannelColumn',
  ChannelBox: 'ChannelBox',
  ChannelLabel: 'ChannelLabel',
  WaitTimeLabel: 'WaitTimeLabel',
  WaitTimeValue: 'WaitTimeValue',
}));

jest.mock('../styles/case', () => ({
  CaseContainer: 'CaseContainer',
  CaseActionContainer: 'CaseActionContainer',
  CaseActionFormContainer: 'CaseActionFormContainer',
  CenteredContainer: 'CenteredContainer',
  CaseSectionFont: 'CaseSectionFont',
  ViewButton: 'ViewButton',
  CaseAddButtonFont: 'CaseAddButtonFont',
  CaseActionTitle: 'CaseActionTitle',
  CaseActionDetailFont: 'CaseActionDetailFont',
  BaseTextArea: 'BaseTextArea',
  TimelineRow: 'TimelineRow',
  TimelineDate: 'TimelineDate',
  TimelineText: 'TimelineText',
  InformationBoldText: 'InformationBoldText',
  PlaceHolderText: 'PlaceHolderText',
  TimelineIconContainer: 'TimelineIconContainer',
  CaseSummaryTextArea: 'CaseSummaryTextArea',
  RowItemContainer: 'RowItemContainer',
  NoteContainer: 'NoteContainer',
  DetailsContainer: 'DetailsContainer',
  DetailEntryText: 'DetailEntryText',
  DetailDescription: 'DetailDescription',
  DetailsHeaderChildName: 'DetailsHeaderChildName',
  DetailsHeaderCaseContainer: 'DetailsHeaderCaseContainer',
  DetailsHeaderCaseId: 'DetailsHeaderCaseId',
  DetailsHeaderOfficeName: 'DetailsHeaderOfficeName',
  StyledInputField: 'StyledInputField',
  StyledSelectWrapper: 'StyledSelectWrapper',
  StyledSelectField: 'StyledSelectField',
  TimelineFileName: 'TimelineFileName',
}));

jest.mock('../styles/previousContactsBanner', () => ({
  YellowBanner: 'YellowBanner',
}));

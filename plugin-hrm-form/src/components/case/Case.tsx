/* eslint-disable react/prop-types,complexity,sonarjs/cognitive-complexity */
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { CircularProgress } from '@material-ui/core';
import { format } from 'date-fns';

import {
  configurationBase,
  connectedCaseBase,
  contactFormsBase,
  namespace,
  RootState,
  routingBase,
} from '../../states';
import { getConfig } from '../../HrmFormPlugin';
import { connectToCase, transformCategories } from '../../services/ContactService';
import { cancelCase, getActivities, updateCase } from '../../services/CaseService';
import { getDefinitionVersion } from '../../services/ServerlessService';
import { getDateFromNotSavedContact, getHelplineData, isConnectedCaseActivity, sortActivities } from './caseHelpers';
import { getLocaleDateTime } from '../../utils/helpers';
import * as SearchActions from '../../states/search/actions';
import * as CaseActions from '../../states/case/actions';
import * as RoutingActions from '../../states/routing/actions';
import * as ConfigActions from '../../states/configuration/actions';
import ViewContact from './ViewContact';
import { CaseDetailsName, updateCaseListByIndex, updateCaseSectionListByIndex } from '../../states/case/types';
import { Case as CaseType, CustomITask, NoteEntry, ReferralEntry, StandaloneITask } from '../../types/types';
import CasePrintView from './casePrint/CasePrintView';
import { NewCaseSubroutes } from '../../states/routing/types';
import CaseHome from './CaseHome';
import AddEditCaseItem from './AddEditCaseItem';
import ViewCaseItem from './ViewCaseItem';
import documentUploadHandler from './documentUploadHandler';
import { recordBackendError } from '../../fullStory';
import { completeTask, submitContactForm } from '../../services/formSubmissionHelpers';
import { getPermissionsForCase } from '../../permissions';
import { CenteredContainer } from '../../styles/case';

export const isStandaloneITask = (task): task is StandaloneITask => {
  return task && task.taskSid === 'standalone-task-sid';
};

type OwnProps = {
  task: CustomITask | StandaloneITask;
  isCreating?: boolean;
  handleClose?: () => void;
  updateAllCasesView?: (updatedCase: CaseType) => void;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const getFirstNameAndLastNameFromContact = (contact): CaseDetailsName => {
  if (contact?.rawJson?.childInformation?.name) {
    const { firstName, lastName } = contact.rawJson.childInformation.name;
    return {
      firstName,
      lastName,
    };
  }
  return {
    firstName: 'Unknown',
    lastName: 'Unknown',
  };
};

const getFirstNameAndLastNameFromForm = (form): CaseDetailsName => {
  if (form?.childInformation) {
    const { firstName, lastName } = form.childInformation;
    return {
      firstName,
      lastName,
    };
  }
  return {
    firstName: 'Unknown',
    lastName: 'Unknown',
  };
};

const Case: React.FC<Props> = ({
  task,
  form,
  counselorsHash,
  setConnectedCase,
  removeConnectedCase,
  updateCaseInfo,
  updateCaseStatus,
  updateCases,
  markCaseAsUpdated,
  changeRoute,
  updateAllCasesView,
  isCreating,
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    /**
     * Gets the activities timeline from current caseId
     * If the case is just being created, adds the case's description as a new activity.
     */
    const getTimeline = async () => {
      if (!props.connectedCaseId) return;

      setLoading(true);
      const activities = await getActivities(props.connectedCaseId);
      setLoading(false);
      let timelineActivities = sortActivities(activities);

      const isCreatingCase = !timelineActivities.some(isConnectedCaseActivity);

      if (isCreatingCase) {
        if (isStandaloneITask(task)) return;
        const date = getDateFromNotSavedContact(task, form);
        const { workerSid } = getConfig();
        const connectCaseActivity = {
          date: format(date, 'yyyy-MM-dd HH:mm:ss'),
          createdAt: new Date().toISOString(),
          type: task.channelType,
          text: form.caseInformation.callSummary.toString(),
          twilioWorkerId: workerSid,
          channel: task.channelType === 'default' ? form.contactlessTask.channel.toString() : task.channelType,
        };

        timelineActivities = sortActivities([...timelineActivities, connectCaseActivity]);
      }
      setTimeline(timelineActivities);
    };

    getTimeline();
  }, [task, form, props.connectedCaseId, props.connectedCaseNotes, props.connectedCaseReferrals, setLoading]);

  const version = props.connectedCaseState?.connectedCase.info.definitionVersion;
  const { updateDefinitionVersion, definitionVersions } = props;

  /**
   * Check if the definitionVersion for this case exists in redux, and look for it if not.
   */
  useEffect(() => {
    const fetchDefinitionVersions = async (v: string) => {
      const definitionVersion = await getDefinitionVersion(version);
      updateDefinitionVersion(version, definitionVersion);
    };

    if (version && !definitionVersions[version]) {
      fetchDefinitionVersions(version);
    }
  }, [definitionVersions, updateDefinitionVersion, version]);

  if (props.routing.route === 'csam-report') return null;

  const { route, subroute } = props.routing;

  // Redirects to the proper view when the user clicks 'Close' button.
  const handleClose = () => {
    props.updateTempInfo(null, task.taskSid);
    if (route === 'select-call-type') {
      changeRoute({ route: 'select-call-type' }, task.taskSid);
    } else if (route === 'new-case') {
      changeRoute({ route: 'new-case' }, task.taskSid);
    } else {
      changeRoute({ route: 'tabbed-forms', subroute: 'search' }, task.taskSid);
    }
  };

  if (!props.connectedCaseState) return null;

  const { connectedCase, prevStatus, caseHasBeenEdited } = props.connectedCaseState;

  const getCategories = firstConnectedContact => {
    if (firstConnectedContact?.rawJson?.caseInformation) {
      return firstConnectedContact.rawJson.caseInformation.categories;
    }
    if (form?.categories && form?.helpline) {
      return transformCategories(form.helpline, form.categories);
    }
    return null;
  };

  const { can } = getPermissionsForCase(connectedCase.twilioWorkerId, prevStatus);

  const firstConnectedContact = connectedCase && connectedCase.connectedContacts && connectedCase.connectedContacts[0];
  const name = firstConnectedContact
    ? getFirstNameAndLastNameFromContact(firstConnectedContact)
    : getFirstNameAndLastNameFromForm(form);

  const categories = getCategories(firstConnectedContact);
  const { createdAt, updatedAt, twilioWorkerId, status, info } = connectedCase || {};
  const { workerSid } = getConfig();
  const caseCounselor = counselorsHash[twilioWorkerId];
  const currentCounselor = counselorsHash[workerSid];
  const openedDate = getLocaleDateTime(createdAt);
  const lastUpdatedDate = getLocaleDateTime(updatedAt);
  // -- Date cannot be converted here since the date dropdown uses the yyyy-MM-dd format.
  const followUpDate = info && info.followUpDate ? info.followUpDate : '';
  // -- Converting followUpDate to match the same format as the rest of the dates
  const followUpPrintedDate = info && info.followUpDate ? getLocaleDateTime(info.followUpDate) : '';
  const households = info && info.households ? info.households : [];
  const perpetrators = info && info.perpetrators ? info.perpetrators : [];
  const incidents = info && info.incidents ? info.incidents : [];
  const documents = info && info.documents ? info.documents : [];
  const childIsAtRisk = info && info.childIsAtRisk;
  const referrals = props.connectedCaseReferrals;
  const notes = timeline.filter(x => x.type === 'note');
  const summary = info?.summary;
  const definitionVersion = props.definitionVersions[version];
  const office = getHelplineData(connectedCase.helpline, definitionVersion.helplineInformation);

  const onInfoChange = (fieldName, value) => {
    const newInfo = info ? { ...info, [fieldName]: value } : { [fieldName]: value };
    updateCaseInfo(newInfo, task.taskSid);
  };

  const onStatusChange = (value: string) => {
    updateCaseStatus(value, task.taskSid);
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { strings } = getConfig();

    try {
      const updatedCase = await updateCase(connectedCase.id, { ...connectedCase });
      setConnectedCase(updatedCase, task.taskSid, false);
      updateCases(task.taskSid, updatedCase);
      // IF case has been edited from All Cases view, we should update that view
      if (updateAllCasesView) {
        updateAllCasesView(updatedCase);
      }
    } catch (error) {
      console.error(error);
      recordBackendError('Update Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelNewCaseAndClose = async () => {
    await cancelCase(connectedCase.id);

    changeRoute({ route: 'tabbed-forms', subroute: 'caseInformation', autoFocus: true }, task.taskSid);
    removeConnectedCase(task.taskSid);
  };

  const handleSaveAndEnd = async () => {
    setLoading(true);

    const { strings } = getConfig();

    // Validating that task isn't a StandaloneITask.
    if (isStandaloneITask(task)) return;

    try {
      const contact = await submitContactForm(task, form, connectedCase);
      await updateCase(connectedCase.id, { ...connectedCase });
      await connectToCase(contact.id, connectedCase.id);
      markCaseAsUpdated(task.taskSid);
      await completeTask(task);
    } catch (error) {
      console.error(error);
      recordBackendError('Save and End Case', error);
      window.alert(strings['Error-Backend']);
    } finally {
      setLoading(false);
    }
  };

  const addScreenProps = {
    task,
    route: props.routing.route,
    counselor: currentCounselor,
    counselorsHash,
    onClickClose: handleClose,
    definitionVersion,
  };

  const { caseForms } = definitionVersion;
  const caseLayouts = definitionVersion.layoutVersion.case;

  const caseDetails = {
    id: connectedCase.id,
    name,
    categories,
    status,
    prevStatus,
    caseCounselor,
    currentCounselor,
    openedDate,
    lastUpdatedDate,
    followUpDate,
    followUpPrintedDate,
    households,
    perpetrators,
    incidents,
    referrals,
    documents,
    notes,
    summary,
    childIsAtRisk,
    office,
    version,
    contact: firstConnectedContact,
    contacts: connectedCase?.connectedContacts ?? [],
  };

  switch (subroute) {
    case NewCaseSubroutes.AddNote:
    case NewCaseSubroutes.EditNote:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            layout: {},
            itemType: 'Note',
            route,
            formDefinition: caseForms.NoteForm,
          }}
          applyTemporaryInfoToCase={updateCaseListByIndex<NoteEntry>(
            ci => {
              ci.counsellorNotes = ci.counsellorNotes ?? [];
              return ci.counsellorNotes;
            },
            temp => ({
              note: temp.form.note.toString(),
              createdAt: temp.createdAt,
              twilioWorkerId: temp.twilioWorkerId,
            }),
          )}
        />
      );
    case NewCaseSubroutes.AddReferral:
    case NewCaseSubroutes.EditReferral:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            layout: {},
            itemType: 'Referral',
            route,
            formDefinition: caseForms.ReferralForm,
          }}
          applyTemporaryInfoToCase={updateCaseListByIndex<ReferralEntry>(
            ci => {
              ci.referrals = ci.referrals ?? [];
              return ci.referrals;
            },
            temp => ({ ...temp.form }),
          )}
        />
      );
    case NewCaseSubroutes.AddHousehold:
    case NewCaseSubroutes.EditHousehold:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.households,
            itemType: 'Household',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('households', 'household'),
            formDefinition: caseForms.HouseholdForm,
          }}
        />
      );
    case NewCaseSubroutes.AddPerpetrator:
    case NewCaseSubroutes.EditPerpetrator:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.perpetrators,
            itemType: 'Perpetrator',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('perpetrators', 'perpetrator'),
            formDefinition: caseForms.PerpetratorForm,
          }}
        />
      );
    case NewCaseSubroutes.AddIncident:
    case NewCaseSubroutes.EditIncident:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.incidents,
            itemType: 'Incident',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('incidents', 'incident'),
            formDefinition: caseForms.IncidentForm,
          }}
        />
      );
    case NewCaseSubroutes.AddDocument:
    case NewCaseSubroutes.EditDocument:
      return (
        <AddEditCaseItem
          {...{
            ...addScreenProps,
            route,
            layout: caseLayouts.documents,
            itemType: 'Document',
            applyTemporaryInfoToCase: updateCaseSectionListByIndex('documents', 'document'),
            formDefinition: caseForms.DocumentForm,
            customFormHandlers: documentUploadHandler,
            reactHookFormOptions: {
              shouldUnregister: false,
            },
          }}
        />
      );
    case NewCaseSubroutes.ViewContact:
      return <ViewContact {...addScreenProps} />;
    case NewCaseSubroutes.ViewNote:
      return <ViewCaseItem {...addScreenProps} itemType="Note" formDefinition={definitionVersion.caseForms.NoteForm} />;
    case NewCaseSubroutes.ViewHousehold:
      return <ViewCaseItem {...addScreenProps} itemType="Household" formDefinition={caseForms.HouseholdForm} />;
    case NewCaseSubroutes.ViewPerpetrator:
      return <ViewCaseItem {...addScreenProps} itemType="Perpetrator" formDefinition={caseForms.PerpetratorForm} />;
    case NewCaseSubroutes.ViewIncident:
      return <ViewCaseItem {...addScreenProps} itemType="Incident" formDefinition={caseForms.IncidentForm} />;
    case NewCaseSubroutes.ViewReferral:
      return (
        <ViewCaseItem
          {...addScreenProps}
          itemType="Referral"
          formDefinition={caseForms.ReferralForm}
          includeAddedTime={false}
        />
      );
    case NewCaseSubroutes.ViewDocument:
      return <ViewCaseItem {...addScreenProps} itemType="Document" formDefinition={caseForms.DocumentForm} />;
    case NewCaseSubroutes.CasePrintView:
      return <CasePrintView caseDetails={caseDetails} {...addScreenProps} />;
    default:
      return loading || !definitionVersion ? (
        <CenteredContainer>
          <CircularProgress size={50} />
        </CenteredContainer>
      ) : (
        <CaseHome
          task={task}
          definitionVersion={definitionVersion}
          caseDetails={caseDetails}
          timeline={timeline}
          handleClose={handleClose}
          handleCancelNewCaseAndClose={handleCancelNewCaseAndClose}
          handleUpdate={handleUpdate}
          handleSaveAndEnd={handleSaveAndEnd}
          onInfoChange={onInfoChange}
          onStatusChange={onStatusChange}
          isCreating={isCreating}
          isEdited={Boolean(caseHasBeenEdited)}
          can={can}
        />
      );
  }
};

Case.displayName = 'Case';

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  form: state[namespace][contactFormsBase].tasks[ownProps.task.taskSid],
  connectedCaseState: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid],
  connectedCaseId: state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.id,
  connectedCaseNotes:
    state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.info?.counsellorNotes,
  connectedCaseReferrals:
    state[namespace][connectedCaseBase].tasks[ownProps.task.taskSid]?.connectedCase?.info?.referrals,
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  routing: state[namespace][routingBase].tasks[ownProps.task.taskSid],
  definitionVersions: state[namespace][configurationBase].definitionVersions,
});

const mapDispatchToProps = {
  changeRoute: RoutingActions.changeRoute,
  removeConnectedCase: CaseActions.removeConnectedCase,
  updateCaseInfo: CaseActions.updateCaseInfo,
  updateTempInfo: CaseActions.updateTempInfo,
  updateCaseStatus: CaseActions.updateCaseStatus,
  setConnectedCase: CaseActions.setConnectedCase,
  markCaseAsUpdated: CaseActions.markCaseAsUpdated,
  updateCases: SearchActions.updateCases,
  updateDefinitionVersion: ConfigActions.updateDefinitionVersion,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Case);

export default connected;

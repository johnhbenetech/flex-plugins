import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { ButtonBase, IconButton } from '@material-ui/core';
import { MoreHoriz, Link as LinkIcon } from '@material-ui/icons';
import { Template } from '@twilio/flex-ui';

import { DetailsContainer, NameContainer, DetNameText, ContactDetailsIcon } from '../styles/search';
import Section from './Section';
import SectionEntry from './SectionEntry';
import callTypes, { channelTypes } from '../states/DomainConstants';
import { isNonDataCallType } from '../states/ValidationRules';
import { contactType } from '../types';
import { formatDuration, formatName, formatCategories, mapChannel } from '../utils';
import { ContactDetailsSections } from './common/ContactDetails';
// import definitons for now because there's only 1, but this should be better handled depending on the definition version
import ChildFormDefinition from '../formDefinitions/childForm.json';
import CallerFormDefinition from '../formDefinitions/callerForm.json';
import CaseInfoFormDefinition from '../formDefinitions/caseInfoForm.json';
import { FormDefinition, FormItemDefinition } from './common/forms/types';

const MoreHorizIcon = ContactDetailsIcon(MoreHoriz);

const Details = ({
  contact,
  detailsExpanded,
  showActionIcons,
  handleOpenConnectDialog,
  handleMockedMessage,
  handleExpandDetailsSection,
}) => {
  // Object destructuring on contact
  const { overview, details, counselor } = contact;
  const { dateTime, name: childName, customerNumber, callType, channel, conversationDuration, categories } = overview;
  const child = details.childInformation;

  // Format the obtained information
  const isDataCall = !isNonDataCallType(callType);
  const childOrUnknown = formatName(childName);
  const childUpperCased = childOrUnknown.toUpperCase();
  const formattedChannel = mapChannel(channel);
  const formattedDate = `${format(new Date(dateTime), 'MMM d, yyyy / h:mm aaaaa')}m`;
  const formattedDuration = formatDuration(conversationDuration);

  const isPhoneContact =
    channel === channelTypes.voice || channel === channelTypes.sms || channel === channelTypes.whatsapp;
  const formattedCategories = formatCategories(categories);

  const {
    GENERAL_DETAILS,
    CALLER_INFORMATION,
    CHILD_INFORMATION,
    ISSUE_CATEGORIZATION,
    CONTACT_SUMMARY,
  } = ContactDetailsSections;

  const deTransform = (e: FormItemDefinition, obj: { [k: string]: any }) =>
    ['firstName', 'lastName'].includes(e.name) ? obj.name[e.name] : obj[e.name];

  return (
    <DetailsContainer data-testid="ContactDetails-Container">
      <NameContainer>
        <DetNameText>{childUpperCased}</DetNameText>
        {showActionIcons && (
          <>
            <IconButton
              onClick={handleOpenConnectDialog}
              disabled={!isDataCall}
              style={{ paddingTop: 0, paddingBottom: 0 }}
            >
              <LinkIcon style={{ color: '#ffffff' }} />
            </IconButton>
            <ButtonBase style={{ padding: 0 }} onClick={handleMockedMessage}>
              <MoreHorizIcon style={{ color: '#ffffff' }} />
            </ButtonBase>
          </>
        )}
      </NameContainer>
      <Section
        sectionTitle={<Template code="ContactDetails-GeneralDetails" />}
        expanded={detailsExpanded[GENERAL_DETAILS]}
        handleExpandClick={() => handleExpandDetailsSection(GENERAL_DETAILS)}
      >
        <SectionEntry description="Channel" value={formattedChannel} />
        <SectionEntry description="Phone Number" value={isPhoneContact ? customerNumber : ''} />
        <SectionEntry description="Conversation Duration" value={formattedDuration} />
        <SectionEntry description="Counselor" value={counselor} />
        <SectionEntry description="Date/Time" value={formattedDate} />
      </Section>
      {callType === callTypes.caller && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddCallerInfoTab" />}
          expanded={detailsExpanded[CALLER_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CALLER_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-CallerInformation"
        >
          {(CallerFormDefinition as FormDefinition).map(e => (
            <SectionEntry
              key={`CallerInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={deTransform(e, contact.details.callerInformation)}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddChildInfoTab" />}
          expanded={detailsExpanded[CHILD_INFORMATION]}
          handleExpandClick={() => handleExpandDetailsSection(CHILD_INFORMATION)}
          buttonDataTestid="ContactDetails-Section-ChildInformation"
        >
          {(ChildFormDefinition as FormDefinition).map(e => (
            <SectionEntry
              key={`ChildInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={deTransform(e, contact.details.childInformation)}
            />
          ))}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-CategoriesTab" />}
          expanded={detailsExpanded[ISSUE_CATEGORIZATION]}
          handleExpandClick={() => handleExpandDetailsSection(ISSUE_CATEGORIZATION)}
        >
          {formattedCategories.length ? (
            formattedCategories.map((c, index) => (
              <SectionEntry key={`Category ${index + 1}`} description={`Category ${index + 1}`} value={c} />
            ))
          ) : (
            <SectionEntry description="No category provided" value="" />
          )}
        </Section>
      )}
      {isDataCall && (
        <Section
          sectionTitle={<Template code="TabbedForms-AddCaseInfoTab" />}
          expanded={detailsExpanded[CONTACT_SUMMARY]}
          handleExpandClick={() => handleExpandDetailsSection(CONTACT_SUMMARY)}
        >
          {CaseInfoFormDefinition.map(e => (
            <SectionEntry
              key={`CaseInformation-${e.label}`}
              description={<Template code={e.label} />}
              value={contact.details.caseInformation[e.name]}
            />
          ))}
        </Section>
      )}
    </DetailsContainer>
  );
};

Details.displayName = 'Details';

Details.propTypes = {
  contact: contactType.isRequired,
  detailsExpanded: PropTypes.objectOf(PropTypes.bool).isRequired,
  handleOpenConnectDialog: PropTypes.func,
  handleMockedMessage: PropTypes.func,
  handleExpandDetailsSection: PropTypes.func.isRequired,
  showActionIcons: PropTypes.bool,
};
Details.defaultProps = {
  handleOpenConnectDialog: () => null,
  handleMockedMessage: () => null,
  showActionIcons: false,
};

export default Details;

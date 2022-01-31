/* eslint-disable react/prop-types */
import React from 'react';
import { connect } from 'react-redux';
import { Template } from '@twilio/flex-ui';
import { FormDefinition } from 'hrm-form-definitions';

import { Container, StyledNextStepButton, BottomButtonBar, Box } from '../../styles/HrmStyles';
import { CaseLayout, FullWidthFormTextContainer } from '../../styles/case';
import { namespace, connectedCaseBase, configurationBase, RootState } from '../../states';
import { CaseState } from '../../states/case/reducer';
import SectionEntry from '../SectionEntry';
import ActionHeader from './ActionHeader';
import type { CustomITask, StandaloneITask } from '../../types/types';
import { isViewTemporaryCaseInfo } from '../../states/case/types';

const mapStateToProps = (state: RootState, ownProps: ViewCaseItemProps) => {
  const counselorsHash = state[namespace][configurationBase].counselors.hash;
  const caseState: CaseState = state[namespace][connectedCaseBase];
  const { temporaryCaseInfo } = caseState.tasks[ownProps.task.taskSid];

  return { counselorsHash, temporaryCaseInfo };
};

export type ViewCaseItemProps = {
  task: CustomITask | StandaloneITask;
  onClickClose: () => void;
  itemType: string;
  formDefinition: FormDefinition;
  includeAddedTime?: boolean;
};

type Props = ViewCaseItemProps & ReturnType<typeof mapStateToProps>;

const ViewCaseItem: React.FC<Props> = ({
  counselorsHash,
  temporaryCaseInfo,
  onClickClose,
  formDefinition,
  itemType,
  includeAddedTime = true,
}) => {
  if (!isViewTemporaryCaseInfo(temporaryCaseInfo))
    throw new Error('This component only supports temporary case info of the ViewTemporaryCaseInfo type');
  const counselorName = counselorsHash[temporaryCaseInfo.info.twilioWorkerId] || 'Unknown';
  const added = new Date(temporaryCaseInfo.info.createdAt);

  const { form } = temporaryCaseInfo.info;

  return (
    <CaseLayout>
      <Container>
        <ActionHeader
          titleTemplate={`Case-View${itemType}`}
          onClickClose={onClickClose}
          counselor={counselorName}
          added={added}
          includeTime={includeAddedTime}
        />
        {formDefinition.length === 1 && formDefinition[0].type === 'textarea' ? (
          <FullWidthFormTextContainer data-testid="Case-ViewCaseItemScreen-FullWidthTextArea">
            {form[formDefinition[0].name]}
          </FullWidthFormTextContainer>
        ) : (
          <Box paddingTop="10px">
            <>
              {formDefinition.map(e => (
                <SectionEntry
                  key={`entry-${e.label}`}
                  description={<Template code={e.label} />}
                  value={form[e.name]}
                  definition={e}
                />
              ))}
            </>
          </Box>
        )}
      </Container>
      <BottomButtonBar>
        <StyledNextStepButton roundCorners onClick={onClickClose} data-testid="Case-CloseButton">
          <Template code="CloseButton" />
        </StyledNextStepButton>
      </BottomButtonBar>
    </CaseLayout>
  );
};

ViewCaseItem.displayName = 'ViewCaseItem';

export default connect(mapStateToProps, null)(ViewCaseItem);

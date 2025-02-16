/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { Template } from '@twilio/flex-ui';
import type { DefinitionVersion } from 'hrm-form-definitions';
import FilterList from '@material-ui/icons/FilterList';
import DateRange from '@material-ui/icons/DateRange';
import { connect, ConnectedProps } from 'react-redux';

import { getConfig } from '../../../HrmFormPlugin';
import { FiltersContainer, FiltersResetAll, CasesTitle, CasesCount, FilterBy } from '../../../styles/caseList/filters';
import MultiSelectFilter, { Item } from './MultiSelectFilter';
import { CategoryFilter, CounselorHash } from '../../../types/types';
import DateRangeFilter from './DateRangeFilter';
import {
  DateFilter,
  followUpDateFilterOptions,
  standardCaseListDateFilterOptions,
  DateFilterValue,
} from './dateFilters';
import CategoriesFilter, { Category } from './CategoriesFilter';
import { caseListBase, configurationBase, namespace, RootState } from '../../../states';
import * as CaseListSettingsActions from '../../../states/caseList/settings';
/**
 * Reads the definition version and returns and array of items (type Item[])
 * to be used as the options for the status filter
 * @param definitionVersion DefinitionVersion
 * @returns Item[]
 */
const getStatusInitialValue = (definitionVersion: DefinitionVersion) =>
  Object.values(definitionVersion.caseStatus).map(caseStatus => ({
    value: caseStatus.value,
    label: caseStatus.label,
    checked: false,
  }));

/**
 * Reads the counselors hash and returns and array of items (type Item[])
 * to be used as the options for the counselors filter
 * @param counselorsHash CounselorHash
 * @returns Item[]
 */
const getCounselorsInitialValue = (counselorsHash: CounselorHash) =>
  Object.keys(counselorsHash).map(key => ({ value: key, label: counselorsHash[key], checked: false }));

const getInitialDateFilters = (): DateFilter[] => [
  {
    labelKey: 'CaseList-Filters-DateFilter-CreatedAt',
    filterPayloadParameter: 'createdAt',
    options: standardCaseListDateFilterOptions(),
  },
  {
    labelKey: 'CaseList-Filters-DateFilter-UpdatedAt',
    filterPayloadParameter: 'updatedAt',
    options: standardCaseListDateFilterOptions(),
  },
  {
    labelKey: 'CaseList-Filters-DateFilter-FollowUpDate',
    filterPayloadParameter: 'followUpDate',
    options: followUpDateFilterOptions(),
  },
];

/**
 * Reads the definition version and returns and array of categories (type Category[])
 * to be used as the options for the categories filter
 * @param definitionVersion DefinitionVersion
 * @returns Item[]
 */
const getCategoriesInitialValue = (definitionVersion: DefinitionVersion, helpline: string) =>
  Object.entries(definitionVersion.tabbedForms.IssueCategorizationTab(helpline)).map(
    ([categoryName, { subcategories }]) => ({
      categoryName,
      subcategories: subcategories.map(subcategory => ({
        value: subcategory,
        label: subcategory,
        checked: false,
      })),
    }),
  );

/**
 * Convert an array of items (type Item[]) into an array of strings.
 * This array will contain only the items that are checked.
 * @param items Item[]
 * @returns string[]
 */
const filterCheckedItems = (items: Item[]): string[] => items.filter(item => item.checked).map(item => item.value);

/**
 * Convert an array of categories (type Category[]) into an array of CategoryFilter.
 * This array will contain only the categories that are checked.
 * @param categories Category[]
 * @returns CategoryFilter[]
 */
const filterCheckedCategories = (categories: Category[]): CategoryFilter[] =>
  categories.flatMap(category =>
    category.subcategories
      .filter(subcategory => subcategory.checked)
      .map(subcategory => ({
        category: category.categoryName,
        subcategory: subcategory.label,
      })),
  );

/**
 * Given the selected categories from redux and the previous categoriesValues,
 * it returns the updated values for categoriesValues, whith the correct checked values.
 *
 * @param categories Selected categories from redux (type CategoryFilter[])
 * @param categoriesValues Previous categoriesValues (type Category[])
 * @returns
 */
const getUpdatedCategoriesValues = (categories: CategoryFilter[], categoriesValues: Category[]): Category[] => {
  const isChecked = (categoryName: string, subcategoryName: string) =>
    categories.some(c => c.category === categoryName && c.subcategory === subcategoryName);

  return categoriesValues.map(categoryValue => ({
    ...categoryValue,
    subcategories: categoryValue.subcategories.map(subcategory => ({
      ...subcategory,
      checked: isChecked(categoryValue.categoryName, subcategory.label),
    })),
  }));
};

type OwnProps = {
  currentDefinitionVersion: DefinitionVersion;
  caseCount: number;
};

// eslint-disable-next-line no-use-before-define
type Props = OwnProps & ConnectedProps<typeof connector>;

const Filters: React.FC<Props> = ({
  currentDefinitionVersion,
  currentFilter,
  currentFilterCompare,
  counselorsHash,
  counselorsHashCompare,
  caseCount,
  updateCaseListFilter,
  clearCaseListFilter,
}) => {
  const { strings, featureFlags, helpline } = getConfig();

  const statusInitialValues = getStatusInitialValue(currentDefinitionVersion);
  const categoriesInitialValues = getCategoriesInitialValue(currentDefinitionVersion, helpline);

  const [openedFilter, setOpenedFilter] = useState<string>();
  const [statusValues, setStatusValues] = useState<Item[]>(statusInitialValues);
  const [counselorValues, setCounselorValues] = useState<Item[]>(getCounselorsInitialValue(counselorsHash));
  const [dateFilterValues, setDateFilterValues] = useState<{
    createdAt?: DateFilterValue;
    updatedAt?: DateFilterValue;
    followUpDate?: DateFilterValue;
  }>({});
  const [categoriesValues, setCategoriesValues] = useState<Category[]>(categoriesInitialValues);

  // Updates UI state from current filters
  useEffect(() => {
    const { counsellors, statuses, categories, includeOrphans, ...currentDateFilters } = currentFilter;
    const newCounselorValues = getCounselorsInitialValue(counselorsHash).map(cv => ({
      ...cv,
      checked: counsellors.includes(cv.value),
    }));
    const newStatusValues = statusValues.map(sv => ({ ...sv, checked: statuses.includes(sv.value) }));
    const newCategoriesValues = getUpdatedCategoriesValues(categories, categoriesValues);
    setCounselorValues(newCounselorValues);
    setStatusValues(newStatusValues);
    setDateFilterValues(currentDateFilters);
    setCategoriesValues(newCategoriesValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilterCompare, counselorsHashCompare]);

  const handleApplyStatusFilter = (values: Item[]) => {
    updateCaseListFilter({ statuses: filterCheckedItems(values) });
  };

  const handleApplyCounselorFilter = (values: Item[]) => {
    updateCaseListFilter({ counsellors: filterCheckedItems(values) });
  };

  const handleApplyDateRangeFilter = (filter: DateFilter) => (filterValue: DateFilterValue | undefined) => {
    const updatedDateFilterValues = { ...dateFilterValues, [filter.filterPayloadParameter]: filterValue };
    updateCaseListFilter({
      ...updatedDateFilterValues,
    });
  };

  const handleApplyCategoriesFilter = (values: Category[]) => {
    updateCaseListFilter({ categories: filterCheckedCategories(values) });
  };

  const handleClearFilters = () => {
    clearCaseListFilter();
  };

  const getCasesCountString = () =>
    caseCount === 1 ? 'CaseList-Filters-CaseCount-Singular' : 'CaseList-Filters-CaseCount-Plural';

  const hasFiltersApplied =
    filterCheckedItems(statusValues).length > 0 ||
    filterCheckedItems(counselorValues).length > 0 ||
    Boolean(Object.values(dateFilterValues).filter(dfv => dfv).length) ||
    filterCheckedCategories(categoriesValues).length > 0;

  return (
    <>
      <FiltersContainer id="CaseList-Cases-label">
        <CasesTitle>
          <Template code="CaseList-Cases" />
        </CasesTitle>
        {hasFiltersApplied && (
          <FiltersResetAll type="button" onClick={handleClearFilters}>
            <Template code="CaseList-Filters-ResetAllFilters" />
          </FiltersResetAll>
        )}
        <CasesCount>
          <Template code={getCasesCountString()} count={caseCount} />
        </CasesCount>
      </FiltersContainer>
      {featureFlags.enable_filter_cases && (
        <FiltersContainer>
          <FilterList />
          <FilterBy>
            <Template code="CaseList-FilterBy" />
          </FilterBy>
          <MultiSelectFilter
            name="status"
            text={strings['CaseList-Filters-Status']}
            defaultValues={statusValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyStatusFilter}
            setOpenedFilter={setOpenedFilter}
          />
          <MultiSelectFilter
            name="counselor"
            searchDescription={strings['CaseList-Filters-SearchForCounselor']}
            text={strings['CaseList-Filters-Counselor']}
            defaultValues={counselorValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyCounselorFilter}
            setOpenedFilter={setOpenedFilter}
            searchable
          />
          <CategoriesFilter
            name="categories"
            searchDescription={strings['CaseList-Filters-SearchByCategory']}
            text={strings['CaseList-Filters-Categories']}
            defaultValues={categoriesValues}
            openedFilter={openedFilter}
            applyFilter={handleApplyCategoriesFilter}
            setOpenedFilter={setOpenedFilter}
            searchable
          />
          <FiltersContainer style={{ marginLeft: '100px', boxShadow: 'none' }}>
            <DateRange fontSize="inherit" style={{ marginRight: 5 }} />
            <Template code="CaseList-Filters-DateFiltersLabel" />
            {getInitialDateFilters().map(df => {
              return (
                <DateRangeFilter
                  labelKey={df.labelKey}
                  key={df.filterPayloadParameter}
                  name={`${df.filterPayloadParameter}Filter`}
                  options={df.options}
                  openedFilter={openedFilter}
                  applyFilter={handleApplyDateRangeFilter(df)}
                  setOpenedFilter={setOpenedFilter}
                  current={dateFilterValues[df.filterPayloadParameter]}
                />
              );
            })}
          </FiltersContainer>
        </FiltersContainer>
      )}
    </>
  );
};

Filters.displayName = 'Filters';

const mapDispatchToProps = {
  updateCaseListFilter: CaseListSettingsActions.updateCaseListFilter,
  clearCaseListFilter: CaseListSettingsActions.clearCaseListFilter,
};

const mapStateToProps = (state: RootState) => ({
  currentFilter: state[namespace][caseListBase].currentSettings.filter,
  currentFilterCompare: JSON.stringify(state[namespace][caseListBase].currentSettings.filter),
  counselorsHash: state[namespace][configurationBase].counselors.hash,
  counselorsHashCompare: JSON.stringify(state[namespace][configurationBase].counselors.hash),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
const connected = connector(Filters);

export default connected;

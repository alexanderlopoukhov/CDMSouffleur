import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {
  VocabSearchFilters,
  VocabSearchMode,
  VocabSearchReqParams,
  VocabSearchResult,
  VocabularySearchService
} from '../services/vocabulary-search/vocabulary-search.service';
import { Concept } from '../models/vocabulary-search/concept';
import { Subject } from 'rxjs/internal/Subject';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BaseComponent } from '../shared/base/base.component';
import { Filter } from './filter-item/filter-item.component';
import { FilterValue } from './filter-list/filter-list.component';
import { of } from 'rxjs';
import { VocabularySearchStateService } from '../services/vocabulary-search/vocabulary-search-state.service';

@Component({
  selector: 'app-vocabulary-search',
  templateUrl: './vocabulary-search.component.html',
  styleUrls: ['./vocabulary-search.component.scss']
})
export class VocabularySearchComponent extends BaseComponent implements OnInit, OnDestroy {

  movableIndexes = {
    second: 2,
    third: 3,
  };

  currentPage = 1;

  pageCount = 1;

  concepts: Concept[] = [];

  total = 0;

  requestInProgress = false;

  disableAll = false; // When Athena API return error

  columns = [
    {field: 'id', name: 'ID', className: 'id'},
    {field: 'code', name: 'Code', className: 'code'},
    {field: 'name', name: 'Name', className: 'name'},
    {field: 'className', name: 'Class', className: 'class'},
    {field: 'standardConcept', name: 'Concept', className: 'concept'},
    {field: 'invalidReason', name: 'Validity', className: 'validity'},
    {field: 'domain', name: 'Domain', className: 'domain'},
    {field: 'vocabulary', name: 'Vocab', className: 'vocab'}
  ];

  sort: {
    field: string;
    order: string
  };

  @ViewChild('keyWordInput')
  keyWordInput: ElementRef;

  @ViewChild('pageSizeInput')
  pageSizeInput: ElementRef;

  filters: Filter[] = [];

  openedFilter: string;

  oldSelectedFilters: string[] = []; // only names
  selectedFilters: FilterValue[] = [];

  chipsHeight = '';

  requestParams: VocabSearchReqParams = {
    pageSize: 10,
    pageNumber: 1,
    query: '',
    updateFilters: true
  };

  mode = VocabSearchMode.LOCAL;

  @Input()
  bottom = '0'

  @Output()
  close = new EventEmitter<void>();

  private pageNumberRecognizer = {
    first: () => 1,
    second: () => this.movableIndexes.second,
    third: () => this.movableIndexes.third,
    fourth: () => this.pageCount
  };

  private filtersRecognizer = {
    domain_id: {name: 'Domain', priority: 1, color: '#761C1C'},
    standard_concept: {name: 'Concept', priority: 2, color: '#406C95'},
    concept_class_id: {name: 'Class', priority: 3, color: '#14772A'},
    vocabulary_id: {name: 'Vocab', priority: 4, color: '#E99A00'},
    invalid_reason: {name: 'Valid', priority: 5, color: '#3D00BD'}
  };

  private sortFieldMap = {
    id: 'concept_id',
    code: 'concept_code',
    name: 'concept_name',
    className: 'concept_class_id',
    standardConcept: 'standard_concept',
    invalidReason: 'invalid_reason',
    domain: 'domain_id',
    vocabulary: 'vocabulary_id'
  };

  private request$ = new Subject<VocabSearchReqParams>();

  private readonly chipHeight = 78;

  private readonly maxPageSize = 500;

  constructor(private searchService: VocabularySearchService,
              private stateService: VocabularySearchStateService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnRequests();

    const needRequest = !this.loadState();

    if (needRequest) {
      this.makeRequest(this.requestParams);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.saveState();
  }

  handleNavigation(event: MouseEvent) {
    const dataset = (event.target as HTMLElement).dataset;

    let doRequest = false;

    if (dataset.arrow) {
      doRequest = this.handleArrowNavigation(dataset.arrow);
    } else {
      const getPage = this.pageNumberRecognizer[dataset.page];
      const page = getPage ? getPage() : null;

      if (page && page !== this.currentPage) {
        doRequest = this.handlePageNavigation(page);
      }
    }

    if (doRequest) {
      this.makeRequest({
        ...this.requestParams,
        pageNumber: this.currentPage,
        updateFilters: false
      });
    }
  }

  @HostListener('document:keyup.enter')
  onEnterOrApply() {
    if (this.disableAll) {
      return
    }

    const changes = this.findChanges();
    const filtersChanged = this.isFilterChanged();

    if (changes) {
      const {query, pageSize} = changes;

      this.setPageSizeAndQuery(query, pageSize);
    }

    if (filtersChanged) {
      this.setFilters();
    }

    if (changes || filtersChanged) {
      this.makeRequest(this.requestParams);
    }
  }

  onOpen(filter: string) {
    if (this.openedFilter === filter) {
      this.openedFilter = null;
    } else {
      this.openedFilter = filter;
    }
  }

  onSort(event: MouseEvent) {
    const field = (event.target as HTMLElement).dataset.sortField;

    if (field) {
      if (!this.sort || this.sort.field !== field || this.sort.order === 'desc') {
        this.sort = {
          field,
          order: 'asc'
        };
      } else {
        this.sort = {
          field,
          order: 'desc'
        };
      }

      this.requestParams = {
        ...this.requestParams,
        sort: this.sortFieldMap[this.sort.field],
        order: this.sort.order,
        updateFilters: false
      };
      this.makeRequest(this.requestParams);
    }
  }

  chipBackgroundColor(filterIndex: number) {
    const field = this.filters[filterIndex].field;
    return this.filtersRecognizer[field].color;
  }

  onCheckFilter(filterValue: FilterValue) {
    filterValue.checked = !filterValue.checked;

    if (filterValue.checked) {
      this.selectedFilters.push(filterValue);
    } else {
      const index = this.selectedFilters.indexOf(filterValue);
      this.selectedFilters.splice(index, 1);
    }

    this.updateChipsHeight();
  }

  onDeleteFilter(index: number) {
    this.selectedFilters[index].checked = false;
    this.selectedFilters.splice(index, 1);

    this.updateChipsHeight();
  }

  onClear() {
    if (this.selectedFilters.length > 0) {
      this.selectedFilters.forEach(filter =>
        filter.checked = false
      );
      this.selectedFilters = [];
      this.updateChipsHeight();

      this.setFilters();
      this.makeRequest(this.requestParams);
    }
  }

  onModeChange(value: string) {
    this.mode = value as VocabSearchMode;
    this.makeRequest(this.requestParams);
  }

  onClose() {
    this.close.emit();
  }

  private makeRequest(params: VocabSearchReqParams) {
    if (!this.requestInProgress) {
      this.requestInProgress = true;
    }
    this.request$.next(params);
  }

  private handleArrowNavigation(arrow: string): boolean {
    if (arrow === 'left' && this.currentPage !== 1) {
      if (this.currentPage === this.movableIndexes.second && this.movableIndexes.second !== 2) {
        this.setMovableIndexes(this.movableIndexes.second - 1);
      }
      this.currentPage--;

      return true;
    } else if (arrow === 'right' && this.currentPage !== this.pageCount) {
      if (this.currentPage === this.movableIndexes.third && this.movableIndexes.third !== this.pageCount - 1) {
        this.setMovableIndexes(this.movableIndexes.second + 1);
      }
      this.currentPage++;

      return true;
    }

    return false;
  }

  private handlePageNavigation(page: number) {
    if (page !== this.currentPage) {
      this.currentPage = page;
      if (page === 1 && this.movableIndexes.second !== 2) {
        this.setMovableIndexes(2);
      } else if (page === this.pageCount && this.movableIndexes.third !== this.pageCount - 1) {
        this.setMovableIndexes(this.pageCount - 2);
      }

      return true;
    }

    return false;
  }

  private subscribeOnRequests() {
    const searchRequest = (params: VocabSearchReqParams) =>
      this.searchService.search(params, this.mode)
        .pipe(
          catchError(error => {
            if (this.mode === VocabSearchMode.ATHENA) {
              this.disableAll = true
            }
            return of({
              content: [],
              totalPages: 1,
              totalElements: 0
            } as VocabSearchResult);
          })
        );

    let updateFilters = false;

    this.request$
      .pipe(
        takeUntil(this.ngUnsubscribe),
        tap(params => updateFilters = params.updateFilters),
        switchMap(params => searchRequest(params))
      )
      .subscribe(result => {
        this.concepts = result.content;
        this.setPagesAndElementsCount(result.totalElements, result.totalPages);
        if (updateFilters && result.facets) {
          this.updateFilters(result.facets);
        }
        if (this.concepts.length > 0) {
          this.disableAll = false;
        }
        this.requestInProgress = false;
      });
  }

  private findChanges(): { query: string, pageSize: number } {
    const query = this.keyWordInput.nativeElement.value;
    const pageSize = parseInt(this.pageSizeInput.nativeElement.value, 10);

    if (this.requestParams.query !== query || this.requestParams.pageSize !== pageSize) {
      return {
        query,
        pageSize
      };
    }

    return null;
  }

  private updateFilters(facets: VocabSearchFilters) {
    this.filters = Object.keys(facets)
      .sort((key1, key2) =>
        this.filtersRecognizer[key1].priority - this.filtersRecognizer[key2].priority
      )
      .map((filterKey, filterIndex) => {
        const filter = this.filtersRecognizer[filterKey];
        const filterValue = facets[filterKey];

        return {
          name: filter.name as string,
          field: filterKey,
          color: filter.color as string,
          values: Object.keys(filterValue)
            .map(valueKey => {
              const oldFilterValue = this.filters[filterIndex]?.values.find(value => value.name === valueKey);

              if (oldFilterValue) {
                oldFilterValue.count = filterValue[valueKey] as number;
                oldFilterValue.disabled = oldFilterValue.count === 0;
                return oldFilterValue;
              } else {
                return {
                  name: valueKey,
                  filterIndex,
                  count: filterValue[valueKey] as number,
                  checked: this.selectedFilters.find(value => value.name === valueKey)?.checked,
                  disabled: (filterValue[valueKey] as number) === 0
                }
              }
            })
        };
      })
  }

  private updateChipsHeight() {
    const height = this.selectedFilters.length * this.chipHeight;
    this.chipsHeight = `${height}px`;
  }

  private setFilters() {
    this.saveOldFilters();

    const getConcreteFiltersByIndex = index => this.selectedFilters
      .filter(filter => filter.filterIndex === index)
      .map(filter => filter.name);

    this.requestParams = {
      ...this.requestParams,
      domain: getConcreteFiltersByIndex(0),
      standardConcept: getConcreteFiltersByIndex(1),
      conceptClass: getConcreteFiltersByIndex(2),
      vocabulary: getConcreteFiltersByIndex(3),
      invalidReason: getConcreteFiltersByIndex(4),
      updateFilters: true
    };
  }

  private setPagesAndElementsCount(total: number, pageCount: number) {
    if (this.total !== total || this.pageCount !== pageCount) {
      if (this.currentPage >= pageCount) { // current page > new page count
        this.currentPage = pageCount;
        this.setMovableIndexes(pageCount - 2, pageCount);
      } else if (this.currentPage === this.pageCount) { // current page = old page count
        this.setMovableIndexes(this.currentPage - 1, pageCount);
      }

      if (this.currentPage === 0) {
        this.currentPage = 1;
      }

      this.total = total;
      this.pageCount = pageCount;
    }
  }

  private setMovableIndexes(second: number, pageCount = this.pageCount) {
    if (pageCount < 4 || second < 2) {
      this.movableIndexes = {
        second: 2,
        third: 3
      };
    } else {
      this.movableIndexes = {
        second,
        third: second + 1
      };
    }
  }

  private loadState(): boolean {
    if (this.stateService.state) {
      const {requestParams, mode, selectedFilters, concepts,
        currentPage, pageCount, filters, movableIndexes, sort} = this.stateService.state;
      this.requestParams = requestParams;
      this.mode = mode;
      this.selectedFilters = selectedFilters;
      this.concepts = concepts;
      this.currentPage = currentPage;
      this.pageCount = pageCount;
      this.filters = filters;
      this.movableIndexes = movableIndexes;
      this.sort = sort;

      this.updateChipsHeight();

      return true;
    }

    return false;
  }

  private saveState() {
    if (this.concepts.length > 0) {
      this.stateService.state = {
        requestParams: this.requestParams,
        mode: this.mode,
        selectedFilters: this.selectedFilters,
        concepts: this.concepts,
        currentPage: this.currentPage,
        pageCount: this.pageCount,
        filters: this.filters,
        movableIndexes: this.movableIndexes,
        sort: this.sort
      };
    }
  }

  private setPageSizeAndQuery(query: string, pageSize: number) {
    const updateFilters = this.requestParams.query !== query;

    let checkedPageSize: number;
    if (!pageSize || pageSize < 1) {
      checkedPageSize = 1;
    } else if (pageSize > this.maxPageSize) {
      checkedPageSize = this.maxPageSize;
    } else {
      checkedPageSize = pageSize;
    }

    this.requestParams = {
      ...this.requestParams,
      pageSize: checkedPageSize,
      query,
      updateFilters
    };
  }

  private isFilterChanged() {
    const equal = (oldFilters: string[], newFilters: FilterValue[]) =>
      oldFilters.length === newFilters.length &&
      oldFilters.every((name, index) => name === newFilters[index].name)

    return !equal(this.oldSelectedFilters, this.selectedFilters);
  }

  private saveOldFilters() {
    this.oldSelectedFilters = this.selectedFilters
      .map(filter => filter.name);
  }
}

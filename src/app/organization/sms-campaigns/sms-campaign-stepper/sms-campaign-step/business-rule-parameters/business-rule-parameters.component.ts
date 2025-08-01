/** Angular Imports */
import { Component, OnChanges, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Validators, UntypedFormGroup, UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { ReportParameter } from 'app/reports/common-models/report-parameter.model';
import { SelectOption } from 'app/reports/common-models/select-option.model';
import { Dates } from 'app/core/utils/dates';
import { MatDivider } from '@angular/material/divider';
import { NgFor, NgSwitch, NgIf, NgSwitchCase } from '@angular/common';
import { MatStepperNext } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Business Rule Parameters Component.
 */
@Component({
  selector: 'mifosx-business-rule-parameters',
  templateUrl: './business-rule-parameters.component.html',
  styleUrls: ['./business-rule-parameters.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    NgSwitch,
    NgSwitchCase,
    MatStepperNext
  ]
})
export class BusinessRuleParametersComponent implements OnInit, OnChanges {
  /** Run Report Parameters Data */
  @Input() paramData: any;

  /** Report Name */
  reportName: string;
  /** Initializes new form group ReportForm */
  ReportForm = new UntypedFormGroup({});
  /** Array of all parent parameters */
  parentParameters: any[] = [];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /** Template Parameters Event Emitter */
  @Output() templateParameters = new EventEmitter();

  /**
   * @param {ReportsService} reportsService Reports Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Dates} dateUtils Date Utils.
   */
  constructor(
    private reportsService: ReportsService,
    private settingsService: SettingsService,
    private dateUtils: Dates
  ) {}

  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
  }

  ngOnChanges() {
    if (this.paramData) {
      this.ReportForm = new UntypedFormGroup({});
      this.reportName = this.paramData.reportName;
      this.paramData = this.paramData.response;
      this.createRunReportForm();
    }
  }

  /**
   * Formatted form value for API request.
   */
  get businessRuleFormValue() {
    const formattedresponse = this.formatUserResponse(this.ReportForm.value, false);
    formattedresponse.reportName = this.reportName;
    return { paramValue: formattedresponse };
  }

  /**
   * Establishes form controls for Report Parameter's name attribute,
   * Fetches dropdown options and builds child dependencies.
   */
  createRunReportForm() {
    this.paramData.forEach((param: any) => {
      if (!param.parentParameterName) {
        // Non-Child Parameter
        this.ReportForm.addControl(param.name, new UntypedFormControl('', Validators.required));
        if (param.displayType === 'select') {
          this.fetchSelectOptions(param, param.name);
        }
      } else {
        // Child Parameter
        const parent: ReportParameter = this.paramData.find((entry: any) => entry.name === param.parentParameterName);
        parent.childParameters.push(param);
        this.updateParentParameters(parent);
      }
    });
    this.setChildControls();
  }

  /**
   * Updates the array of parent parameters.
   * @param {ReportParameter} parent Parent report parameter
   */
  updateParentParameters(parent: ReportParameter) {
    const parentNames = this.parentParameters.map((parameter) => parameter.name);
    if (!parentNames.includes(parent.name)) {
      // Parent's first child.
      this.parentParameters.push(parent);
    } else {
      // Parent already has a child
      const index = parentNames.indexOf(parent.name);
      this.parentParameters[index] = parent;
    }
  }

  /**
   * Subscribes to changes in parent parameters value, builds child parameter vis-a-vis parent's value.
   */
  setChildControls() {
    this.parentParameters.forEach((param: ReportParameter) => {
      this.ReportForm.get(param.name).valueChanges.subscribe((option: any) => {
        param.childParameters.forEach((child: ReportParameter) => {
          if (child.displayType === 'none') {
            this.ReportForm.addControl(child.name, new UntypedFormControl(child.defaultVal));
          } else {
            this.ReportForm.addControl(child.name, new UntypedFormControl('', Validators.required));
          }
          if (child.displayType === 'select') {
            const inputstring = `${child.name}?${param.inputName}=${option.id}`;
            this.fetchSelectOptions(child, inputstring);
          }
        });
      });
    });
  }

  /**
   * Fetches Select Dropdown options for param type "Select".
   * @param {ReportParameter} param Parameter for which dropdown options are required.
   * @param {string} inputstring url substring for API call.
   */
  fetchSelectOptions(param: ReportParameter, inputstring: string) {
    this.reportsService.getSelectOptions(inputstring).subscribe((options: SelectOption[]) => {
      param.selectOptions = options;
      if (param.selectAll === 'Y') {
        param.selectOptions.push({ id: '-1', name: 'All' });
      }
    });
  }

  /**
   * Formats user response and readies it for utilization by run report function.
   * @param {any} response Object containing formcontrol values.
   */
  formatUserResponse(response: any, forHeaders: boolean) {
    const formattedResponse: any = {};
    let newKey: string;
    for (const [
      key,
      value
    ] of Object.entries(response)) {
      const param: ReportParameter = this.paramData.find((_entry: any) => _entry.name === key);
      newKey = forHeaders ? param.inputName : param.variable;
      switch (param.displayType) {
        case 'text':
          formattedResponse[newKey] = value;
          break;
        case 'select':
          formattedResponse[newKey] = (value as { id: string | number })['id'];
          break;
        case 'date':
          const dateFormat = this.settingsService.dateFormat;
          formattedResponse[newKey] = this.dateUtils.formatDate(value, dateFormat);
          break;
        case 'none':
          formattedResponse[newKey] = value;
          break;
      }
    }
    return formattedResponse;
  }

  /**
   * Gets run report response headers.
   * Emits them via template parameters event emitter.
   * TODO: Replace report object with report name once reports service is refactored.
   */
  getResponseHeaders() {
    const formattedresponse = this.formatUserResponse(this.ReportForm.value, true);
    this.reportsService.getRunReportData(this.reportName, formattedresponse).subscribe(
      (response: any) => {
        this.templateParameters.emit(response.columnHeaders);
      },
      (error: any) => {
        this.templateParameters.emit(null);
      }
    );
  }
}

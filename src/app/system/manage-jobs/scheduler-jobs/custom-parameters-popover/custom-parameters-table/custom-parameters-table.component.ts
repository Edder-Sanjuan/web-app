import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobIdAndParameterType, JobParameterType } from '../custom-parameters-popover.component';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-custom-parameters-table',
  templateUrl: './custom-parameters-table.component.html',
  styleUrls: ['./custom-parameters-table.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    FormsModule,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class CustomParametersTableComponent implements OnInit {
  /* Job name for table title */
  @Input() displayName: string;
  /* Job id for table */
  @Input() jobId: string;
  /* Array of custom job parameters */
  @Input() jobParameters: JobParameterType[];
  /* Listener to return jobs */
  @Output() retrieveJob: EventEmitter<JobParameterType[]> = new EventEmitter<JobParameterType[]>();

  /* Job parameters copy updated by user input */
  updatedJobParameters: JobParameterType[];
  /* Columns for the table */
  columnsToDisplay: string[] = [
    'parameterName',
    'parameterValue',
    'actions'
  ];

  constructor() {}

  ngOnInit(): void {
    this.updatedJobParameters = this.jobParameters;
    this.updatedJobParameters.push({
      parameterName: '',
      parameterValue: ''
    });
  }

  addParameter(): void {
    this.updatedJobParameters = [
      ...this.updatedJobParameters,
      {
        parameterName: '',
        parameterValue: ''
      }
    ];
  }

  deleteParameter(index: number): void {
    let idx = 0;
    const jobParameters: JobParameterType[] = [];
    for (; idx < this.updatedJobParameters.length; idx++) {
      if (idx !== index) {
        jobParameters.push(this.updatedJobParameters[idx]);
      }
    }
    this.updatedJobParameters = jobParameters;
  }

  /**
   * Gets the jobId and jobParameters array
   * @returns jobId and jobParameters array
   */
  getTableData(): JobIdAndParameterType {
    return {
      jobId: this.jobId,
      displayName: this.displayName,
      jobParameters: this.updatedJobParameters
    };
  }
}

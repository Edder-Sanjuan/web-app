import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoansService } from 'app/loans/loans.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-close-as-rescheduled',
  templateUrl: './close-as-rescheduled.component.html',
  styleUrls: ['./close-as-rescheduled.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class CloseAsRescheduledComponent implements OnInit {
  @Input() dataObject: any;

  /** Close form. */
  closeLoanForm: UntypedFormGroup;
  /** Loan Id */
  loanId: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the close form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCloseForm();
  }

  /**
   * Creates the create close form.
   */
  createCloseForm() {
    this.closeLoanForm = this.formBuilder.group({
      transactionDate: [
        new Date(this.dataObject.date) || new Date(),
        Validators.required
      ],
      note: []
    });
  }

  /**
   * Submits the close form and creates a close,
   * if successful redirects to view created close.
   */
  submit() {
    const closeLoanFormData = this.closeLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const transactionDate = this.closeLoanForm.value.transactionDate;
    if (closeLoanFormData.transactionDate instanceof Date) {
      closeLoanFormData.transactionDate = this.dateUtils.formatDate(transactionDate, dateFormat);
    }
    const data = {
      ...closeLoanFormData,
      dateFormat,
      locale
    };
    this.loanService.submitLoanActionButton(this.loanId, data, 'close-rescheduled').subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}

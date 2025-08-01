/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create teller component.
 */
@Component({
  selector: 'mifosx-create-teller',
  templateUrl: './create-teller.component.html',
  styleUrls: ['./create-teller.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class CreateTellerComponent implements OnInit {
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Teller form. */
  tellerForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;
  /** TellerStatuses data. */
  tellerStatusesData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
    this.tellerStatusesData = [
      { id: 300, code: '300', value: 'Active' },
      { id: 400, code: '400', value: 'Inactive' }
    ];
  }

  /**
   * Creates the teller form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.createTellerForm();
  }

  /**
   * Creates the teller form.
   */
  createTellerForm() {
    this.tellerForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      name: [
        '',
        [
          Validators.required,
          Validators.pattern('(^[A-z]).*')]
      ],
      description: [''],
      startDate: [
        '',
        Validators.required
      ],
      endDate: [''],
      status: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits the teller form and creates teller,
   * if successful redirects to tellers.
   */
  submit() {
    const tellerFormData = this.tellerForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.tellerForm.value.startDate;
    const prevEndDate: Date = this.tellerForm.value.endDate;
    if (tellerFormData.startDate instanceof Date) {
      tellerFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (tellerFormData.endDate instanceof Date) {
      tellerFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...tellerFormData,
      dateFormat,
      locale
    };
    this.organizationService.createTeller(data).subscribe((response: any) => {
      this.router.navigate(
        [
          '../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}

/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Components */
import { SavingsAccountDetailsStepComponent } from '../savings-account-stepper/savings-account-details-step/savings-account-details-step.component';
import { SavingsAccountTermsStepComponent } from '../savings-account-stepper/savings-account-terms-step/savings-account-terms-step.component';
import { SavingsAccountChargesStepComponent } from '../savings-account-stepper/savings-account-charges-step/savings-account-charges-step.component';

/** Custom Services */
import { SavingsService } from '../savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SavingsAccountPreviewStepComponent } from '../savings-account-stepper/savings-account-preview-step/savings-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Savings Account Component
 */
@Component({
  selector: 'mifosx-create-savings-account',
  templateUrl: './create-savings-account.component.html',
  styleUrls: ['./create-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    SavingsAccountDetailsStepComponent,
    SavingsAccountTermsStepComponent,
    SavingsAccountChargesStepComponent,
    SavingsAccountPreviewStepComponent
  ]
})
export class CreateSavingsAccountComponent {
  /** Savings Account Template */
  savingsAccountTemplate: any;
  /** Savings Account Product Template */
  savingsAccountProductTemplate: any;

  /** Savings Account Details Step */
  @ViewChild(SavingsAccountDetailsStepComponent, { static: true })
  savingsAccountDetailsStep: SavingsAccountDetailsStepComponent;
  /** Savings Account Terms Step */
  @ViewChild(SavingsAccountTermsStepComponent, { static: true })
  savingsAccountTermsStep: SavingsAccountTermsStepComponent;
  /** Savings Account Charges Step */
  @ViewChild(SavingsAccountChargesStepComponent, { static: true })
  savingsAccountChargesStep: SavingsAccountChargesStepComponent;

  /**
   * Fetches savings account template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {Dates} dateUtils Date Utils
   * @param {SavingsService} savingsService Savings Service
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private savingsService: SavingsService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { savingsAccountTemplate: any }) => {
      this.savingsAccountTemplate = data.savingsAccountTemplate;
    });
  }

  /**
   * Sets savings account product template.
   * @param {any} $event API response
   */
  setTemplate($event: any) {
    this.savingsAccountProductTemplate = $event;
  }

  /**
   * Retrieves savings account details form.
   */
  get savingsAccountDetailsForm() {
    return this.savingsAccountDetailsStep.savingsAccountDetailsForm;
  }

  /**
   * Retrieves savings account terms form.
   */
  get savingsAccountTermsForm() {
    return this.savingsAccountTermsStep.savingsAccountTermsForm;
  }

  /**
   * Checks validity of overall savings account form.
   */
  get savingsAccountFormValid() {
    return this.savingsAccountDetailsForm.valid && this.savingsAccountTermsForm.valid;
  }

  /**
   * Retrieves savings account object.
   */
  get savingsAccount() {
    return {
      ...this.savingsAccountDetailsStep.savingsAccountDetails,
      ...this.savingsAccountTermsStep.savingsAccountTerms,
      ...this.savingsAccountChargesStep.savingsAccountCharges
    };
  }

  /**
   * Creates a new share account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const monthDayFormat = 'dd MMMM';
    const savingsAccount = {
      ...this.savingsAccount,
      charges: this.savingsAccount.charges.map((charge: any) => ({
        chargeId: charge.id,
        amount: charge.amount,
        dueDate: charge.dueDate,
        feeOnMonthDay: charge.feeOnMonthDay,
        feeInterval: charge.feeInterval
      })),
      submittedOnDate: this.dateUtils.formatDate(this.savingsAccount.submittedOnDate, dateFormat),
      dateFormat,
      monthDayFormat,
      locale
    };
    if (this.savingsAccountTemplate.clientId) {
      savingsAccount.clientId = this.savingsAccountTemplate.clientId;
    } else {
      savingsAccount.groupId = this.savingsAccountTemplate.groupId;
    }
    this.savingsService.createSavingsAccount(savingsAccount).subscribe((response: any) => {
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

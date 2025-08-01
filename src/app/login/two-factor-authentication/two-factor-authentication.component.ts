/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** rxjs Imports */
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { MatDivider } from '@angular/material/divider';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatPrefix, MatLabel, MatHint, MatError } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Two factor authentication component.
 */
@Component({
  selector: 'mifosx-two-factor-authentication',
  templateUrl: './two-factor-authentication.component.html',
  styleUrls: ['./two-factor-authentication.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    MatRadioGroup,
    MatRadioButton,
    MatProgressSpinner,
    MatPrefix,
    FaIconComponent,
    MatHint
  ]
})
export class TwoFactorAuthenticationComponent implements OnInit {
  /** Available delivery methods to receive OTP. */
  twoFactorAuthenticationDeliveryMethods: any;
  /** Delivery method selected to receive OTP. */
  selectedTwoFactorAuthenticationDeliveryMethod: any;
  /** True if OTP is requested. */
  otpRequested = false;
  /** Time for which OTP is valid. */
  tokenValidityTime: number;
  /** Two factor authentication delivery method form group. */
  twoFactorAuthenticationDeliveryMethodForm: UntypedFormGroup;
  /** Two factor authentication form group. */
  twoFactorAuthenticationForm: UntypedFormGroup;
  /** True if loading. */
  loading = false;
  /** True if loading. */
  resendOTPLoading = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService
  ) {}

  /**
   * Creates two factor authentication delivery method form.
   *
   * Gets the delivery methods available to receive OTP.
   */
  ngOnInit() {
    this.createTwoFactorAuthenticationDeliveryMethodForm();
    this.authenticationService.getDeliveryMethods().subscribe((deliveryMethods: any) => {
      this.twoFactorAuthenticationDeliveryMethods = deliveryMethods;
    });
  }

  /**
   * Requests OTP via the selected delivery method.
   */
  requestOTP() {
    this.loading = true;
    this.twoFactorAuthenticationDeliveryMethodForm.disable();
    this.selectedTwoFactorAuthenticationDeliveryMethod =
      this.twoFactorAuthenticationDeliveryMethodForm.value.twoFactorAuthenticationDeliveryMethod;

    this.authenticationService
      .requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(
        finalize(() => {
          this.twoFactorAuthenticationDeliveryMethodForm.reset();
          this.twoFactorAuthenticationDeliveryMethodForm.markAsPristine();
          // Angular Material Bug: Validation errors won't get removed on reset.
          this.twoFactorAuthenticationDeliveryMethodForm.enable();
          this.loading = false;
        })
      )
      .subscribe((response: any) => {
        this.createTwoFactorAuthenticationForm();
        this.otpRequested = true;
        this.tokenValidityTime = response.tokenLiveTimeInSec;
      });
  }

  /**
   * Validates the OTP and authenticates the user.
   */
  validateOTP() {
    this.loading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService
      .validateOTP(this.twoFactorAuthenticationForm.value.otp)
      .pipe(
        finalize(() => {
          this.twoFactorAuthenticationForm.reset();
          this.twoFactorAuthenticationForm.markAsPristine();
          // Angular Material Bug: Validation errors won't get removed on reset.
          this.twoFactorAuthenticationForm.enable();
          this.loading = false;
        })
      )
      .subscribe();
  }

  /**
   * Resends OTP via the selected delivery method.
   */
  resendOTP() {
    this.resendOTPLoading = true;
    this.twoFactorAuthenticationForm.disable();
    this.authenticationService
      .requestOTP(this.selectedTwoFactorAuthenticationDeliveryMethod)
      .pipe(
        finalize(() => {
          this.twoFactorAuthenticationForm.reset();
          this.twoFactorAuthenticationForm.markAsPristine();
          // Angular Material Bug: Validation errors won't get removed on reset.
          this.twoFactorAuthenticationForm.enable();
          this.resendOTPLoading = false;
        })
      )
      .subscribe();
  }

  /**
   * Creates two factor authentication delivery method form.
   */
  private createTwoFactorAuthenticationDeliveryMethodForm() {
    this.twoFactorAuthenticationDeliveryMethodForm = this.formBuilder.group({
      twoFactorAuthenticationDeliveryMethod: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Creates two factor authentication form.
   */
  private createTwoFactorAuthenticationForm() {
    this.twoFactorAuthenticationForm = this.formBuilder.group({
      otp: [
        '',
        Validators.required
      ]
    });
  }
}

/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Payment Type component.
 */
@Component({
  selector: 'mifosx-edit-payment-type',
  templateUrl: './edit-payment-type.component.html',
  styleUrls: ['./edit-payment-type.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize,
    MatCheckbox
  ]
})
export class EditPaymentTypeComponent implements OnInit {
  /** Payment Type form. */
  paymentTypeForm: UntypedFormGroup;
  /** Payment Type Data. */
  paymentTypeData: any;

  /**
   * Retrieves the payment type data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { paymentType: any }) => {
      this.paymentTypeData = data.paymentType;
    });
  }

  /**
   * Creates and sets the payment type form.
   */
  ngOnInit() {
    this.createPaymentTypeForm();
  }

  /**
   * Creates the payment type form.
   */
  createPaymentTypeForm() {
    this.paymentTypeForm = this.formBuilder.group({
      name: [
        this.paymentTypeData.name,
        Validators.required
      ],
      description: [this.paymentTypeData.description],
      isCashPayment: [this.paymentTypeData.isCashPayment],
      position: [
        this.paymentTypeData.position,
        Validators.required
      ]
    });
  }

  /**
   * Submits the payment type form and updates payment type.
   * if successful redirects to payment types.
   */
  submit() {
    const paymentType = this.paymentTypeForm.value;
    this.organizationService.updatePaymentType(this.paymentTypeData.id, paymentType).subscribe((response) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatTableDataSource,
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * GSIM Accounts Overview component.
 */
@Component({
  selector: 'mifosx-gsim-account',
  templateUrl: './gsim-account.component.html',
  styleUrls: ['./gsim-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    StatusLookupPipe
  ]
})
export class GsimAccountComponent implements OnInit {
  /** Columns to be displayed in charge overview table. */
  displayedColumns: string[] = [
    'clientDetails',
    'savingsAccount',
    'products',
    'balance',
    'Actions'
  ];
  /** Data source for charge overview table. */
  dataSource: MatTableDataSource<any>;
  /** Charge Overview data */
  gsimOverviewData: any;

  savingAccountData: any;

  groupsData: any;

  /** Paginator for charge overview table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  /**
   * Retrieves the charge overview data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { gsimData: any; savingAccountData: any; groupsData: any }) => {
      this.gsimOverviewData = data.gsimData[0].childGSIMAccounts;
      this.savingAccountData = data.savingAccountData;
      this.groupsData = data.groupsData;
    });
  }

  ngOnInit(): void {
    this.setLoanClientChargeOverview();
  }

  /**
   * Set Client Charge Overview.
   */
  setLoanClientChargeOverview() {
    this.dataSource = new MatTableDataSource(this.gsimOverviewData);
    // this.dataSource.paginator = this.paginator;
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }
}

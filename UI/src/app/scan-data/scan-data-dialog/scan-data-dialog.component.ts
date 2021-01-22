import { Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AbstractScanDialog, formIndex } from '../abstract-scan-dialog';
import { ScanConsoleWrapperComponent } from './scan-console-wrapper/scan-console-wrapper.component';
import { WebsocketParams } from '../model/websocket-params';

@Component({
  selector: 'app-scan-data-dialog',
  templateUrl: './scan-data-dialog.component.html',
  styleUrls: ['./scan-data-dialog.component.scss', '../styles/scan-dialog.scss', '../styles/scan-data-normalize.scss'],
})
export class ScanDataDialogComponent extends AbstractScanDialog {

  @ViewChild(ScanConsoleWrapperComponent)
  consoleWrapperComponent: ScanConsoleWrapperComponent;

  dbName: string;

  private readonly consoleIndex = 1;

  constructor(dialogRef: MatDialogRef<ScanDataDialogComponent>) {
    super(dialogRef);
  }

  onScanTables(payload: {dbName: string, params: WebsocketParams}): void {
    const {dbName, params} = payload;
    this.dbName = dbName;
    this.websocketParams = params;
    this.index = this.consoleIndex;
  }

  protected changeSize() {
    if (this.index === formIndex) {
      this.dialogRef.updateSize('700px', '674px');
    } else {
      this.dialogRef.updateSize('613px', '478px');
    }
  }
}

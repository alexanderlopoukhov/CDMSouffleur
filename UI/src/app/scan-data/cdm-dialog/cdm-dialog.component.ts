import { Component, ViewChild } from '@angular/core';
import { AbstractScanDialog, formIndex } from '../abstract-scan-dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { CdmConsoleWrapperComponent } from './cdm-console-wrapper/cdm-console-wrapper.component';
import { CdmSettings } from '../model/cdm-settings';
import { cdmWebsocketConfig, whiteRabbitWebsocketConfig } from '../scan-data.constants';
import { FakeDataParams } from '../model/fake-data-params';
import { WebsocketParams } from '../model/websocket-params';
import { fileToBase64 } from '../../services/utilites/base64-util';
import { StoreService } from '../../services/store.service';
import { ScanStatus } from '../shared/scan-console-wrapper/abstract-console-wrapper.component';
import { FakeConsoleWrapperComponent } from '../fake-data-dialog/fake-console-wrapper/fake-console-wrapper.component';

@Component({
  selector: 'app-cdm-dialog',
  templateUrl: './cdm-dialog.component.html',
  styleUrls: ['./cdm-dialog.component.scss', '../styles/scan-dialog.scss', '../styles/scan-data-normalize.scss']
})
export class CdmDialogComponent extends AbstractScanDialog {

  @ViewChild(CdmConsoleWrapperComponent)
  consoleWrapperComponent: CdmConsoleWrapperComponent;

  @ViewChild(FakeConsoleWrapperComponent)
  fakeDataConsoleWrapperComponent: FakeConsoleWrapperComponent;

  whiteRabbitWebsocketParams: WebsocketParams;

  private readonly cdmConsoleIndex = 1;
  private readonly fakeDataConsoleIndex = 2;

  constructor(dialogRef: MatDialogRef<CdmDialogComponent>, private storeService: StoreService) {
    super(dialogRef);
  }

  get isNotScanning() {
    return this.index === 0 ||
      this.consoleWrapperComponent.status === ScanStatus.FINISHED ||
      this.fakeDataConsoleWrapperComponent.status === ScanStatus.FINISHED;
  }

  onConvert(cdmSettings: CdmSettings): void {
    this.websocketParams = {
      ...cdmWebsocketConfig,
      endPoint: '',
      resultDestination: '',
      payload: cdmSettings
    };

    this.index = this.cdmConsoleIndex;
  }

  header() {
    return this.index === this.fakeDataConsoleIndex ? 'Fake Data Generation' : 'Convert to CDM';
  }

  async onGenerateFakeData(params: FakeDataParams) {
    const state = this.storeService.state;
    const scanReportBase64 = (await fileToBase64(state.reportFile)).base64;
    const itemsToScanCount = state.source.length;

    this.whiteRabbitWebsocketParams = {
      ...whiteRabbitWebsocketConfig,
      endPoint: '/fake-data',
      payload: {
        ...params,
        scanReportBase64,
      },
      itemsToScanCount,
      resultDestination: '/user/queue/fake-data'
    };

    this.index = this.fakeDataConsoleIndex;
  }

  protected changeSize() {
    if (this.index === formIndex) {
      this.dialogRef.updateSize('700px', '674px');
    } else {
      this.dialogRef.updateSize('613px', '478px');
    }
  }
}

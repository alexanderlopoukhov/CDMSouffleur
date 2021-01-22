import { Component, ViewChild } from '@angular/core';
import {
  AbstractConsoleWrapperComponent,
  ScanStatus
} from '../../shared/scan-console-wrapper/abstract-console-wrapper.component';
import { CdmScanDataConsoleComponent } from '../../shared/scan-console-wrapper/scan-data-console/cdm-scan-data-console.component';

@Component({
  selector: 'app-cdm-console-wrapper',
  templateUrl: './cdm-console-wrapper.component.html',
  styleUrls: [
    './cdm-console-wrapper.component.scss',
    '../../shared/scan-console-wrapper/console-wrapper.component.scss',
    '../../styles/scan-data-buttons.scss'
  ]
})
export class CdmConsoleWrapperComponent extends AbstractConsoleWrapperComponent {

  @ViewChild(CdmScanDataConsoleComponent)
  scanDataConsoleComponent: CdmScanDataConsoleComponent;

  onFinish(status: ScanStatus) {
    this.status = status;
  }

  onClose() {
    this.close.emit();
  }
}

import { MatDialogRef } from '@angular/material/dialog';
import { WebsocketParams } from './model/websocket-params';
import {
  AbstractConsoleWrapperComponent,
  ScanStatus
} from './shared/scan-console-wrapper/abstract-console-wrapper.component';

export const formIndex = 0;

export abstract class AbstractScanDialog {

  websocketParams: WebsocketParams;

  private selectedIndex = formIndex;

  abstract consoleWrapperComponent: AbstractConsoleWrapperComponent;

  protected constructor(protected dialogRef: MatDialogRef<AbstractScanDialog>) {
  }

  set index(value: number) {
    this.selectedIndex = value;
    this.changeSize();
  }

  get index() {
    return this.selectedIndex;
  }

  get isNotScanning() {
    return this.selectedIndex === 0 || this.consoleWrapperComponent.status === ScanStatus.FINISHED;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onCloseByDagger() {
    if (this.isNotScanning) {
      this.onClose();
    }
  }

  onCancel(): void {
    this.index = formIndex;
  }

  protected abstract changeSize();
}

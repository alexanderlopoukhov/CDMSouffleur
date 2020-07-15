import { Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { OVERLAY_DIALOG_DATA } from 'src/app/services/overlay/overlay-dialog-data';
import { OverlayDialogRef } from 'src/app/services/overlay/overlay.service';

@Component({
  selector: 'app-add-constant-popup',
  templateUrl: './add-constant-popup.component.html',
  styleUrls: ['./add-constant-popup.component.scss']
})
export class AddConstantPopupComponent {
  @ViewChild('readOnlyTemplate', {static: false}) readOnlyTemplate: TemplateRef<any>;
  @ViewChild('editTemplate', {static: false}) editTemplate: TemplateRef<any>;

  value: string;

  constructor(
    private dialogRef: OverlayDialogRef,
    @Inject(OVERLAY_DIALOG_DATA) public payload: any
  ) {
    this.value = this.payload.value;
  }

  add() {
    if (!this.value) {
      return;
    }
    this.payload.value = this.value;
    this.close();
  }

  clear() {
    this.value = null;
    this.payload.value = this.value;
    this.close();
  }

  close() {
    this.dialogRef.close();
  }
}
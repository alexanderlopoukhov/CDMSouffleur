import { Component, Inject } from '@angular/core';
import { OVERLAY_DIALOG_DATA } from 'src/app/services/overlay/overlay-dialog-data';
import { OverlayDialogRef } from 'src/app/services/overlay/overlay.service';

@Component({
  selector: 'app-select-concept-field',
  templateUrl: './select-concept-field.component.html',
  styleUrls: [ './select-concept-field.component.scss' ]
})
export class SelectConceptFieldComponent {

  constructor(public dialogRef: OverlayDialogRef,
              @Inject(OVERLAY_DIALOG_DATA) public payload: any,
  ) {
  }

  onSelectionChange(event: any) {
    this.payload.selected = event;
    this.dialogRef.close();
  }

  remove(table: any) {
    this.dialogRef.close(table);
  }

}
